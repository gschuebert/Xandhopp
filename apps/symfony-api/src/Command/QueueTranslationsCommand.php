<?php

declare(strict_types=1);

namespace App\Command;

use App\Repository\CountryRepository;
use App\Service\TranslationService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:queue-translations',
    description: 'Queue translation jobs for missing country content'
)]
class QueueTranslationsCommand extends Command
{
    public function __construct(
        private TranslationService $translationService,
        private CountryRepository $countryRepository
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('target-lang', InputArgument::OPTIONAL, 'Target language for translations', 'de')
            ->addOption('country', 'c', InputOption::VALUE_OPTIONAL, 'Specific country slug to process')
            ->addOption('all', 'a', InputOption::VALUE_NONE, 'Process all countries')
            ->addOption('method', 'm', InputOption::VALUE_OPTIONAL, 'Translation method', 'ai_openai')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Show what would be queued without actually doing it')
            ->setHelp('This command queues translation jobs for missing country content.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $targetLang = $input->getArgument('target-lang');
        $countrySlug = $input->getOption('country');
        $all = $input->getOption('all');
        $method = $input->getOption('method');
        $dryRun = $input->getOption('dry-run');

        $io->title('Translation Job Queue Manager');

        if ($dryRun) {
            $io->note('DRY RUN MODE - No actual jobs will be queued');
        }

        // Validate target language
        $validLanguages = ['de', 'fr', 'es', 'it', 'pt', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'hu', 'ro'];
        if (!in_array($targetLang, $validLanguages)) {
            $io->error("Invalid target language: {$targetLang}. Valid options: " . implode(', ', $validLanguages));
            return Command::FAILURE;
        }

        // Validate translation method
        $validMethods = ['ai_openai', 'ai_google', 'ai_azure'];
        if (!in_array($method, $validMethods)) {
            $io->error("Invalid translation method: {$method}. Valid options: " . implode(', ', $validMethods));
            return Command::FAILURE;
        }

        $io->info("Target language: {$targetLang}");
        $io->info("Translation method: {$method}");

        // Get countries to process
        $countries = [];
        
        if ($countrySlug) {
            $country = $this->countryRepository->findBySlug($countrySlug);
            if (!$country) {
                $io->error("Country not found: {$countrySlug}");
                return Command::FAILURE;
            }
            $countries = [$country];
            $io->info("Processing specific country: {$country->getNameEn()}");
        } elseif ($all) {
            $countries = $this->countryRepository->findAllOrderedByName();
            $io->info("Processing all countries: " . count($countries) . " found");
        } else {
            $io->error('Please specify either --country=slug or --all');
            return Command::FAILURE;
        }

        $totalQueued = 0;
        $totalSkipped = 0;

        $io->section('Processing Countries');

        foreach ($countries as $country) {
            $io->writeln("Processing: {$country->getNameEn()} ({$country->getSlug()})");
            
            // Get missing translations
            $missing = $this->translationService->getMissingTranslations($country, $targetLang);
            
            if (empty($missing)) {
                $io->writeln("  ✓ All translations already exist");
                $totalSkipped++;
                continue;
            }

            $io->writeln("  Missing translations: " . count($missing));
            
            foreach ($missing as $translation) {
                $io->writeln("    - {$translation['section']} ({$translation['source_lang']} → {$translation['target_lang']})");
            }

            if ($dryRun) {
                $io->writeln("  Would queue " . count($missing) . " translation job(s)");
                $totalQueued += count($missing);
            } else {
                // Queue translation jobs
                $queuedJobs = $this->translationService->queueMissingTranslations($country, $targetLang);
                
                if (!empty($queuedJobs)) {
                    $io->writeln("  ✓ Queued " . count($queuedJobs) . " translation job(s)");
                    $totalQueued += count($queuedJobs);
                } else {
                    $io->writeln("  ⚠ No jobs were queued (may already exist)");
                    $totalSkipped++;
                }
            }
        }

        $io->section('Summary');
        $io->success("Total jobs queued: {$totalQueued}");
        $io->info("Countries skipped: {$totalSkipped}");

        if (!$dryRun && $totalQueued > 0) {
            $io->note("Run 'php bin/console app:process-translations' to process the queued jobs");
        }

        return Command::SUCCESS;
    }
}
