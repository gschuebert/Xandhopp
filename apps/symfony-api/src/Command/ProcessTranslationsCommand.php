<?php

declare(strict_types=1);

namespace App\Command;

use App\Service\TranslationService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:process-translations',
    description: 'Process pending translation jobs using AI services'
)]
class ProcessTranslationsCommand extends Command
{
    public function __construct(
        private TranslationService $translationService
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('limit', 'l', InputOption::VALUE_OPTIONAL, 'Maximum number of jobs to process', 10)
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Show what would be processed without actually doing it')
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Force processing even if no providers are configured')
            ->setHelp('This command processes pending translation jobs using configured AI translation services.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $limit = (int) $input->getOption('limit');
        $dryRun = $input->getOption('dry-run');
        $force = $input->getOption('force');

        $io->title('Translation Job Processor');

        // Check if translation providers are available
        $availableProviders = $this->translationService->getAvailableProviders();
        
        if (empty($availableProviders) && !$force) {
            $io->error('No translation providers are configured. Please set up at least one of:');
            $io->listing([
                'OPENAI_API_KEY for OpenAI GPT translations',
                'GOOGLE_TRANSLATE_API_KEY for Google Translate',
                'AZURE_TRANSLATOR_KEY for Azure Translator'
            ]);
            $io->note('Use --force to run anyway (will show what would be processed)');
            return Command::FAILURE;
        }

        if (!empty($availableProviders)) {
            $io->success('Available translation providers: ' . implode(', ', array_keys($availableProviders)));
        }

        if ($dryRun) {
            $io->note('DRY RUN MODE - No actual translations will be performed');
        }

        // Get translation statistics
        $stats = $this->translationService->getTranslationStats();
        if (!empty($stats)) {
            $io->section('Current Translation Statistics');
            $table = $io->createTable();
            $table->setHeaders(['Status', 'Method', 'Language', 'Count']);
            
            foreach ($stats as $stat) {
                $table->addRow([
                    $stat['status'],
                    $stat['translation_method'] ?? 'N/A',
                    $stat['target_lang'],
                    $stat['count']
                ]);
            }
            $table->render();
        }

        // Process pending translations
        $io->section('Processing Translation Jobs');
        
        try {
            if ($dryRun) {
                $io->info("Would process up to {$limit} pending translation jobs");
                return Command::SUCCESS;
            }

            $processed = $this->translationService->processPendingTranslations($limit);
            
            if (empty($processed)) {
                $io->info('No pending translation jobs found');
            } else {
                $io->success(sprintf('Successfully processed %d translation job(s)', count($processed)));
                
                foreach ($processed as $jobId) {
                    $io->writeln("  ✓ Processed job ID: {$jobId}");
                }
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $io->error('Failed to process translations: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
