<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Country;
use App\Entity\CountryText;
use App\Entity\Source;
use App\Repository\CountryTextRepository;
use App\Repository\TranslationJobRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class TranslationService
{
    private HttpClientInterface $httpClient;
    private array $translationProviders = [];

    public function __construct(
        private EntityManagerInterface $entityManager,
        private CountryTextRepository $countryTextRepository,
        private TranslationJobRepository $translationJobRepository,
        private LoggerInterface $logger,
        ?HttpClientInterface $httpClient = null
    ) {
        $this->httpClient = $httpClient ?? HttpClient::create();
        $this->initializeProviders();
    }

    private function initializeProviders(): void
    {
        // Initialize translation providers based on environment variables
        $this->translationProviders = [
            'openai' => [
                'enabled' => !empty($_ENV['OPENAI_API_KEY']),
                'api_key' => $_ENV['OPENAI_API_KEY'] ?? '',
                'endpoint' => 'https://api.openai.com/v1/chat/completions',
                'model' => 'gpt-4o-mini', // Cost-effective model for translations
            ],
            'google' => [
                'enabled' => !empty($_ENV['GOOGLE_TRANSLATE_API_KEY']),
                'api_key' => $_ENV['GOOGLE_TRANSLATE_API_KEY'] ?? '',
                'endpoint' => 'https://translation.googleapis.com/language/translate/v2',
            ],
            'azure' => [
                'enabled' => !empty($_ENV['AZURE_TRANSLATOR_KEY']),
                'api_key' => $_ENV['AZURE_TRANSLATOR_KEY'] ?? '',
                'endpoint' => $_ENV['AZURE_TRANSLATOR_ENDPOINT'] ?? '',
                'region' => $_ENV['AZURE_TRANSLATOR_REGION'] ?? '',
            ],
        ];
    }

    /**
     * Get country data in specific language with automatic fallback
     */
    public function getCountryDataByLanguage(string $slug, string $targetLang = 'en'): ?array
    {
        $sql = 'SELECT * FROM get_country_data_by_lang(:slug, :lang)';
        $stmt = $this->entityManager->getConnection()->prepare($sql);
        $result = $stmt->executeQuery([
            'slug' => $slug,
            'lang' => $targetLang
        ]);
        
        return $result->fetchAssociative() ?: null;
    }

    /**
     * Check if translation exists for a country section
     */
    public function hasTranslation(Country $country, string $section, string $lang): bool
    {
        return $this->countryTextRepository->findByCountryAndSection(
            $country->getId(),
            $section,
            $lang
        ) !== null;
    }

    /**
     * Get missing translations for a country
     */
    public function getMissingTranslations(Country $country, string $targetLang = 'de'): array
    {
        $sections = ['overview', 'culture', 'demography', 'economy', 'history'];
        $missing = [];

        foreach ($sections as $section) {
            if (!$this->hasTranslation($country, $section, $targetLang)) {
                // Check if English version exists to translate from
                $englishVersion = $this->countryTextRepository->findByCountryAndSection(
                    $country->getId(),
                    $section,
                    'en'
                );
                
                if ($englishVersion) {
                    $missing[] = [
                        'section' => $section,
                        'source_content' => $englishVersion->getContent(),
                        'source_lang' => 'en',
                        'target_lang' => $targetLang
                    ];
                }
            }
        }

        return $missing;
    }

    /**
     * Queue translation jobs for missing content
     */
    public function queueMissingTranslations(Country $country, string $targetLang = 'de'): array
    {
        $missing = $this->getMissingTranslations($country, $targetLang);
        $queuedJobs = [];

        foreach ($missing as $translation) {
            $jobId = $this->queueTranslationJob(
                $country,
                $translation['section'],
                $translation['source_lang'],
                $translation['target_lang'],
                $translation['source_content']
            );

            if ($jobId) {
                $queuedJobs[] = $jobId;
            }
        }

        return $queuedJobs;
    }

    /**
     * Queue a single translation job
     */
    public function queueTranslationJob(
        Country $country,
        string $section,
        string $sourceLang,
        string $targetLang,
        string $sourceContent,
        string $method = 'ai_openai'
    ): ?int {
        // Check if translation already exists
        if ($this->hasTranslation($country, $section, $targetLang)) {
            return null;
        }

        // Check if job already exists
        $existingJob = $this->translationJobRepository->findPendingJob(
            $country->getId(),
            $section,
            $sourceLang,
            $targetLang
        );

        if ($existingJob) {
            return null;
        }

        // Create new translation job
        $sql = 'SELECT queue_translation_job(:country_id, :section, :source_lang, :target_lang, :content, :method)';
        $stmt = $this->entityManager->getConnection()->prepare($sql);
        $result = $stmt->executeQuery([
            'country_id' => $country->getId(),
            'section' => $section,
            'source_lang' => $sourceLang,
            'target_lang' => $targetLang,
            'content' => $sourceContent,
            'method' => $method
        ]);

        $jobId = $result->fetchOne();
        return $jobId ? (int) $jobId : null;
    }

    /**
     * Process pending translation jobs
     */
    public function processPendingTranslations(int $limit = 10): array
    {
        $pendingJobs = $this->translationJobRepository->findPendingJobs($limit);
        $processed = [];

        foreach ($pendingJobs as $job) {
            try {
                $this->processTranslationJob($job);
                $processed[] = $job['id'];
            } catch (\Exception $e) {
                $this->logger->error('Translation job failed', [
                    'job_id' => $job['id'],
                    'error' => $e->getMessage()
                ]);
                
                $this->updateJobStatus($job['id'], 'failed', $e->getMessage());
            }
        }

        return $processed;
    }

    /**
     * Process a single translation job
     */
    private function processTranslationJob(array $job): void
    {
        $this->updateJobStatus($job['id'], 'processing');

        $method = $job['translation_method'] ?? 'ai_openai';
        $translatedContent = null;

        switch ($method) {
            case 'ai_openai':
                $translatedContent = $this->translateWithOpenAI(
                    $job['source_content'],
                    $job['source_lang'],
                    $job['target_lang']
                );
                break;
            case 'ai_google':
                $translatedContent = $this->translateWithGoogle(
                    $job['source_content'],
                    $job['source_lang'],
                    $job['target_lang']
                );
                break;
            case 'ai_azure':
                $translatedContent = $this->translateWithAzure(
                    $job['source_content'],
                    $job['source_lang'],
                    $job['target_lang']
                );
                break;
            default:
                throw new \InvalidArgumentException("Unknown translation method: {$method}");
        }

        if ($translatedContent) {
            // Save the translation
            $this->saveTranslation(
                $job['country_id'],
                $job['section'],
                $job['target_lang'],
                $translatedContent
            );

            // Update job status
            $this->updateJobStatus($job['id'], 'completed', null, $translatedContent);
        } else {
            throw new \RuntimeException('Translation returned empty result');
        }
    }

    /**
     * Translate using OpenAI GPT
     */
    private function translateWithOpenAI(string $content, string $sourceLang, string $targetLang): ?string
    {
        if (!$this->translationProviders['openai']['enabled']) {
            throw new \RuntimeException('OpenAI translation not configured');
        }

        $systemPrompt = $this->getTranslationSystemPrompt($sourceLang, $targetLang);
        
        $response = $this->httpClient->request('POST', $this->translationProviders['openai']['endpoint'], [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->translationProviders['openai']['api_key'],
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => $this->translationProviders['openai']['model'],
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $content]
                ],
                'temperature' => 0.3,
                'max_tokens' => 2000,
            ],
        ]);

        $data = $response->toArray();
        return $data['choices'][0]['message']['content'] ?? null;
    }

    /**
     * Translate using Google Translate API
     */
    private function translateWithGoogle(string $content, string $sourceLang, string $targetLang): ?string
    {
        if (!$this->translationProviders['google']['enabled']) {
            throw new \RuntimeException('Google Translate not configured');
        }

        $response = $this->httpClient->request('POST', $this->translationProviders['google']['endpoint'], [
            'query' => [
                'key' => $this->translationProviders['google']['api_key'],
            ],
            'json' => [
                'q' => $content,
                'source' => $sourceLang,
                'target' => $targetLang,
                'format' => 'text',
            ],
        ]);

        $data = $response->toArray();
        return $data['data']['translations'][0]['translatedText'] ?? null;
    }

    /**
     * Translate using Azure Translator
     */
    private function translateWithAzure(string $content, string $sourceLang, string $targetLang): ?string
    {
        if (!$this->translationProviders['azure']['enabled']) {
            throw new \RuntimeException('Azure Translator not configured');
        }

        $endpoint = rtrim($this->translationProviders['azure']['endpoint'], '/') . '/translate';
        
        $response = $this->httpClient->request('POST', $endpoint, [
            'headers' => [
                'Ocp-Apim-Subscription-Key' => $this->translationProviders['azure']['api_key'],
                'Ocp-Apim-Subscription-Region' => $this->translationProviders['azure']['region'],
                'Content-Type' => 'application/json',
            ],
            'json' => [
                [
                    'text' => $content
                ]
            ],
            'query' => [
                'api-version' => '3.0',
                'from' => $sourceLang,
                'to' => $targetLang,
            ],
        ]);

        $data = $response->toArray();
        return $data[0]['translations'][0]['text'] ?? null;
    }

    /**
     * Get system prompt for translation
     */
    private function getTranslationSystemPrompt(string $sourceLang, string $targetLang): string
    {
        $langNames = [
            'en' => 'English',
            'de' => 'German',
            'fr' => 'French',
            'es' => 'Spanish',
            'it' => 'Italian',
            'pt' => 'Portuguese',
            'nl' => 'Dutch',
        ];

        $sourceName = $langNames[$sourceLang] ?? $sourceLang;
        $targetName = $langNames[$targetLang] ?? $targetLang;

        return "You are a professional translator specializing in country information and travel content. 
        
Translate the following text from {$sourceName} to {$targetName}. 

Guidelines:
- Maintain the factual accuracy and tone of the original text
- Use natural, fluent language appropriate for travel and country information
- Keep proper nouns (country names, city names, etc.) in their original form
- Preserve any specific cultural or historical context
- Ensure the translation is suitable for travelers and expats
- Do not add or remove information, only translate

Return only the translated text without any additional commentary or explanations.";
    }

    /**
     * Save translation to database
     */
    private function saveTranslation(int $countryId, string $section, string $lang, string $content): void
    {
        $country = $this->entityManager->getRepository(Country::class)->find($countryId);
        if (!$country) {
            throw new \RuntimeException("Country with ID {$countryId} not found");
        }

        $source = $this->entityManager->getRepository(Source::class)->findOneBy(['key' => 'ai_translation']);
        if (!$source) {
            // Create AI translation source if it doesn't exist
            $source = new Source();
            $source->setKey('ai_translation');
            $source->setName('AI Translation');
            $source->setDescription('Automated translation using AI services');
            $this->entityManager->persist($source);
            $this->entityManager->flush();
        }

        $countryText = new CountryText();
        $countryText->setCountry($country);
        $countryText->setSection($section);
        $countryText->setLang($lang);
        $countryText->setContent($content);
        $countryText->setSource($source);
        $countryText->setSourceUrl('ai://translation');

        $this->entityManager->persist($countryText);
        $this->entityManager->flush();
    }

    /**
     * Update translation job status
     */
    private function updateJobStatus(int $jobId, string $status, ?string $errorMessage = null, ?string $translatedContent = null): void
    {
        $sql = 'UPDATE translation_job SET 
                    status = :status, 
                    error_message = :error_message,
                    translated_content = :translated_content,
                    updated_at = now(),
                    completed_at = CASE WHEN :status = \'completed\' THEN now() ELSE completed_at END
                WHERE id = :job_id';
        
        $stmt = $this->entityManager->getConnection()->prepare($sql);
        $stmt->executeQuery([
            'job_id' => $jobId,
            'status' => $status,
            'error_message' => $errorMessage,
            'translated_content' => $translatedContent,
        ]);
    }

    /**
     * Get available translation providers
     */
    public function getAvailableProviders(): array
    {
        return array_filter($this->translationProviders, fn($provider) => $provider['enabled']);
    }

    /**
     * Get translation statistics
     */
    public function getTranslationStats(): array
    {
        $sql = 'SELECT 
                    status,
                    COUNT(*) as count,
                    translation_method,
                    target_lang
                FROM translation_job 
                GROUP BY status, translation_method, target_lang
                ORDER BY status, target_lang';
        
        $stmt = $this->entityManager->getConnection()->prepare($sql);
        $result = $stmt->executeQuery();
        
        return $result->fetchAllAssociative();
    }
}
