<?php

declare(strict_types=1);

namespace App\Command;

use App\Application\LiveSyncService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:countries:sync-live', description: 'Fetch FX and safety advisories, then refresh views')]
class SyncLiveDataCommand extends Command
{
    public function __construct(private LiveSyncService $svc)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('country', null, InputOption::VALUE_REQUIRED, 'Filter by country name or slug (optional)')
            ->addOption('providers', null, InputOption::VALUE_REQUIRED, 'Comma-separated providers to run (fx,advisory,enrich). Default: all')
            ->addOption('lang', null, InputOption::VALUE_REQUIRED, 'Language for text ops (reserved)', 'en');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        
        $io->title('Syncing Live Country Data');
        $io->note('Fetching FX rates and travel advisories from external APIs...');

        $summary = $this->svc->run([
            'country' => $input->getOption('country'),
            'providers' => $input->getOption('providers') ? explode(',', $input->getOption('providers')) : null,
            'lang' => $input->getOption('lang'),
        ]);

        $io->success(sprintf(
            'Sync completed successfully! FX rates: %d, Travel advisories: %d, Enrichments: %d',
            $summary['fx'] ?? 0,
            $summary['advisory'] ?? 0,
            $summary['enrichment'] ?? 0
        ));

        $io->note('Materialized views have been refreshed. Live data is now available via API endpoints.');

        return Command::SUCCESS;
    }
}
