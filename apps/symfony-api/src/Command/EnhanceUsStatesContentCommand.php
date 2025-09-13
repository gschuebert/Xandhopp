<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Source;
use App\Entity\UsState;
use App\Entity\UsStateText;
use App\Repository\SourceRepository;
use App\Repository\UsStateRepository;
use App\Service\WikipediaContentService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:enhance:us-states-content', description: 'Enhance all US states with comprehensive Wikipedia content')]
class EnhanceUsStatesContentCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UsStateRepository $stateRepository,
        private SourceRepository $sourceRepository,
        private WikipediaContentService $wikipediaService
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('state', null, InputOption::VALUE_OPTIONAL, 'Enhance specific state by code (e.g., TX)')
            ->addOption('limit', null, InputOption::VALUE_OPTIONAL, 'Limit number of states to process', '5');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Enhancing US States Content');

        $wikipediaSource = $this->sourceRepository->findOneBy(['key' => 'wikipedia']);
        if (!$wikipediaSource) {
            $io->error('Wikipedia source not found');
            return Command::FAILURE;
        }

        $stateCode = $input->getOption('state');
        $limit = (int) $input->getOption('limit');

        if ($stateCode) {
            $states = [$this->stateRepository->findByStateCode($stateCode)];
            $states = array_filter($states); // Remove null values
        } else {
            $states = $this->stateRepository->findAllOrderedByName();
            $states = array_slice($states, 0, $limit);
        }

        if (empty($states)) {
            $io->error('No states found to enhance');
            return Command::FAILURE;
        }

        $enhanced = 0;
        $skipped = 0;

        foreach ($states as $state) {
            $io->section("Enhancing {$state->getNameEn()} ({$state->getStateCode()})");

            try {
                // Get Wikipedia content
                $wikipediaContent = $this->wikipediaService->getStateContent($state->getNameEn());
                
                // Get state-specific data
                $stateSpecificData = $this->wikipediaService->getStateSpecificData($state->getStateCode());

                // Update or create content for each section
                $sections = ['overview', 'culture', 'economy', 'history', 'demography'];
                
                foreach ($sections as $section) {
                    $content = $this->buildSectionContent($state, $section, $wikipediaContent, $stateSpecificData);
                    
                    if (!empty($content)) {
                        $this->updateStateText($state, $section, $content, $wikipediaSource);
                        $io->writeln("  ✅ Updated {$section}");
                    } else {
                        $io->writeln("  ⚠️  No content for {$section}");
                    }
                }

                $this->em->flush();
                $enhanced++;
                $io->writeln("  🎉 Enhanced {$state->getNameEn()}");

                // Add delay to be respectful to Wikipedia API
                usleep(500000); // 500ms delay

            } catch (\Throwable $e) {
                $io->writeln("  ❌ Error enhancing {$state->getNameEn()}: " . $e->getMessage());
                $skipped++;
            }
        }

        $io->success("Enhancement completed! Enhanced: {$enhanced}, Skipped: {$skipped}");
        return Command::SUCCESS;
    }

    private function buildSectionContent(UsState $state, string $section, array $wikipediaContent, array $stateSpecificData): string
    {
        $content = '';

        switch ($section) {
            case 'overview':
                $content = $wikipediaContent['overview'] ?? '';
                if (empty($content)) {
                    $content = "{$state->getNameEn()} is a state in the United States. Its capital is {$state->getCapital()} and it has a population of approximately " . number_format($state->getPopulation()) . " people.";
                }
                break;

            case 'culture':
                $content = $wikipediaContent['culture'] ?? '';
                if (empty($content) && !empty($stateSpecificData['culture'])) {
                    $content = $stateSpecificData['culture'];
                }
                break;

            case 'economy':
                $content = $wikipediaContent['economy'] ?? '';
                if (empty($content) && !empty($stateSpecificData['economy'])) {
                    $content = $stateSpecificData['economy'];
                }
                break;

            case 'history':
                $content = $wikipediaContent['history'] ?? '';
                if (empty($content)) {
                    $establishedDate = $state->getEstablishedDate();
                if ($establishedDate) {
                    $content = "{$state->getNameEn()} was established on {$establishedDate->format('F j, Y')}. The state has a rich history and cultural heritage.";
                } else {
                    $content = "{$state->getNameEn()} has a rich history and cultural heritage dating back to its early settlement.";
                }
                }
                break;

            case 'demography':
                $content = $wikipediaContent['demography'] ?? '';
                if (empty($content)) {
                    $population = is_numeric($state->getPopulation()) ? (int)$state->getPopulation() : 0;
                    $area = is_numeric($state->getAreaKm2()) ? (float)$state->getAreaKm2() : 0;
                    $content = "{$state->getNameEn()} has a population of approximately " . number_format($population) . " people. The state covers an area of " . number_format($area) . " square kilometers.";
                }
                break;
        }

        return trim($content);
    }

    private function updateStateText(UsState $state, string $section, string $content, Source $source): void
    {
        // Check if text already exists
        $existingText = $this->em->getRepository(UsStateText::class)->findOneBy([
            'state' => $state,
            'section' => $section,
            'lang' => 'en'
        ]);

        if ($existingText) {
            $existingText->setContent($content);
            $existingText->setUpdatedAt(new \DateTimeImmutable());
        } else {
            $text = new UsStateText();
            $text->setState($state)
                 ->setSection($section)
                 ->setLang('en')
                 ->setContent($content)
                 ->setSource($source);

            $this->em->persist($text);
        }
    }
}
