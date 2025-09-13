<?php

declare(strict_types=1);

namespace App\Command;

use App\Service\LiveDataHealthService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:countries:health-check', description: 'Check the health of live data systems')]
class CheckLiveDataHealthCommand extends Command
{
    public function __construct(private LiveDataHealthService $healthService)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('json', null, InputOption::VALUE_NONE, 'Output results in JSON format')
            ->addOption('stats', null, InputOption::VALUE_NONE, 'Show statistics instead of health check');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if ($input->getOption('stats')) {
            return $this->showStats($io, $input->getOption('json'));
        }

        return $this->showHealthCheck($io, $input->getOption('json'));
    }

    private function showHealthCheck(SymfonyStyle $io, bool $jsonOutput): int
    {
        $health = $this->healthService->checkHealth();

        if ($jsonOutput) {
            $io->writeln(json_encode($health, JSON_PRETTY_PRINT));
            return $health['status'] === 'healthy' ? Command::SUCCESS : Command::FAILURE;
        }

        $io->title('Live Data Health Check');

        // Overall status
        $statusColor = match ($health['status']) {
            'healthy' => 'green',
            'degraded' => 'yellow',
            'unhealthy' => 'red',
            default => 'white'
        };

        $io->section('Overall Status');
        $io->writeln("<fg={$statusColor}>Status: {$health['status']}</>");

        if (!empty($health['issues'])) {
            $io->section('Issues');
            foreach ($health['issues'] as $issue) {
                $io->writeln("<fg=red>• {$issue}</>");
            }
        }

        // Individual checks
        $io->section('Individual Checks');
        foreach ($health['checks'] as $checkName => $check) {
            $status = $check['healthy'] ? '<fg=green>✓</>' : '<fg=red>✗</>';
            $io->writeln("{$status} <info>{$checkName}</info>: {$check['message']}");
            
            if (isset($check['latest_update'])) {
                $io->writeln("  Latest update: {$check['latest_update']}");
            }
            if (isset($check['age_hours'])) {
                $io->writeln("  Age: {$check['age_hours']} hours");
            }
            if (isset($check['age_days'])) {
                $io->writeln("  Age: {$check['age_days']} days");
            }
        }

        if ($health['last_updated']) {
            $io->section('Last Update');
            $io->writeln("Materialized views last refreshed: {$health['last_updated']}");
        }

        return $health['status'] === 'healthy' ? Command::SUCCESS : Command::FAILURE;
    }

    private function showStats(SymfonyStyle $io, bool $jsonOutput): int
    {
        $stats = $this->healthService->getStats();

        if ($jsonOutput) {
            $io->writeln(json_encode($stats, JSON_PRETTY_PRINT));
            return Command::SUCCESS;
        }

        $io->title('Live Data Statistics');

        $io->table(
            ['Metric', 'Value'],
            [
                ['FX Rates', $stats['fx_rates_count'] ?? 'N/A'],
                ['Travel Advisories', $stats['travel_advisory_count'] ?? 'N/A'],
                ['Countries', $stats['countries_count'] ?? 'N/A'],
                ['Last Check', $stats['last_check'] ?? 'N/A'],
            ]
        );

        return Command::SUCCESS;
    }
}
