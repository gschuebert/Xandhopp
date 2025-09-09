<?php

declare(strict_types=1);

namespace App\Command;

use App\Service\FreemiumService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:seed:freemium',
    description: 'Seed freemium plans and features data',
)]
class SeedFreemiumCommand extends Command
{
    public function __construct(
        private FreemiumService $freemiumService
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Seeding Freemium Data');

        try {
            $this->freemiumService->seedDefaultData();
            $io->success('Freemium data seeded successfully!');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Failed to seed freemium data: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
