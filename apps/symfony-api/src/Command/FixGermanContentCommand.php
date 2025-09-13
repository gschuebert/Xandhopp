<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Source;
use App\Entity\UsState;
use App\Entity\UsStateText;
use App\Repository\SourceRepository;
use App\Repository\UsStateRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:fix:german-content', description: 'Fix German content in US state overviews')]
class FixGermanContentCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UsStateRepository $stateRepository,
        private SourceRepository $sourceRepository
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Fixing German Content in US State Overviews');

        $wikipediaSource = $this->sourceRepository->findOneBy(['key' => 'wikipedia']);
        if (!$wikipediaSource) {
            $io->error('Wikipedia source not found');
            return Command::FAILURE;
        }

        $states = $this->stateRepository->findAllOrderedByName();
        $fixed = 0;

        foreach ($states as $state) {
            $io->section("Checking {$state->getNameEn()} ({$state->getStateCode()})");

            // Check if overview contains German text
            $overviewText = $this->em->getRepository(UsStateText::class)->findOneBy([
                'state' => $state,
                'section' => 'overview',
                'lang' => 'en'
            ]);

            if ($overviewText && $this->containsGermanText($overviewText->getContent())) {
                $io->writeln("  🔍 Found German content in overview");
                
                // Replace with proper English content
                $englishContent = $this->generateEnglishOverview($state);
                
                $overviewText->setContent($englishContent);
                $overviewText->setUpdatedAt(new \DateTimeImmutable());
                
                $io->writeln("  ✅ Fixed overview content");
                $fixed++;
            } else {
                $io->writeln("  ✅ Overview is already in English");
            }
        }

        $this->em->flush();
        
        // Refresh materialized view
        $this->em->getConnection()->executeStatement('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_us_state_public');
        
        $io->success("Fixed {$fixed} states with German content");
        return Command::SUCCESS;
    }

    private function containsGermanText(string $text): bool
    {
        $germanIndicators = [
            'ist ein', 'der Vereinigten', 'Bundesstaat', 'im Norden', 'im Süden', 'im Osten', 'im Westen',
            'steht für', 'Fluss in', 'Region der', 'Teil der', 'im Zentrum', 'im oberen', 'im unteren'
        ];

        foreach ($germanIndicators as $indicator) {
            if (stripos($text, $indicator) !== false) {
                return true;
            }
        }

        return false;
    }

    private function generateEnglishOverview(UsState $state): string
    {
        $population = is_numeric($state->getPopulation()) ? number_format((int)$state->getPopulation()) : 'unknown';
        $area = is_numeric($state->getAreaKm2()) ? number_format((float)$state->getAreaKm2()) : 'unknown';
        
        return "{$state->getNameEn()} is a state in the United States. Its capital is {$state->getCapital()} and it has a population of approximately {$population} people. The state covers an area of {$area} square kilometers and is located in North America.";
    }
}
