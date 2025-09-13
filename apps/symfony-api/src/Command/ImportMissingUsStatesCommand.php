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

#[AsCommand(name: 'app:import:missing-us-states', description: 'Import all missing US states')]
class ImportMissingUsStatesCommand extends Command
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
        $io->title('Importing Missing US States');

        $wikipediaSource = $this->sourceRepository->findOneBy(['key' => 'wikipedia']);
        if (!$wikipediaSource) {
            $io->error('Wikipedia source not found');
            return Command::FAILURE;
        }

        $allStates = $this->getAllStatesData();
        $imported = 0;

        foreach ($allStates as $stateData) {
            // Check if state already exists
            $existingState = $this->stateRepository->findByStateCode($stateData['code']);
            if ($existingState) {
                continue; // Skip existing states
            }

            $io->section("Importing {$stateData['name']}");

            // Create state
            $state = new UsState();
            $state->setStateCode($stateData['code'])
                  ->setNameEn($stateData['name'])
                  ->setNameLocal($stateData['name'])
                  ->setCapital($stateData['capital'])
                  ->setPopulation($stateData['population'])
                  ->setAreaKm2($stateData['area_km2'])
                  ->setLat($stateData['lat'])
                  ->setLon($stateData['lon'])
                  ->setTimezone($stateData['timezone'])
                  ->setEstablishedDate($stateData['established_date'] ? new \DateTime($stateData['established_date']) : null);

            $this->em->persist($state);
            $this->em->flush();

            // Add basic content
            $overview = "{$stateData['name']} is a state in the United States. Its capital is {$stateData['capital']} and it has a population of approximately " . number_format($stateData['population']) . " people.";
            
            $text = new UsStateText();
            $text->setState($state)
                 ->setSection('overview')
                 ->setLang('en')
                 ->setContent($overview)
                 ->setSource($wikipediaSource);

            $this->em->persist($text);
            $this->em->flush();
            
            $imported++;
            $io->writeln("  ✅ Imported {$stateData['name']}");
        }

        $io->success("Successfully imported {$imported} missing US states!");
        return Command::SUCCESS;
    }

    private function getAllStatesData(): array
    {
        return [
            ['code' => 'KS', 'name' => 'Kansas', 'capital' => 'Topeka', 'population' => 2937880, 'area_km2' => '213100.00', 'lat' => '39.0558', 'lon' => '-95.6894', 'timezone' => 'America/Chicago', 'established_date' => '1861-01-29'],
            ['code' => 'KY', 'name' => 'Kentucky', 'capital' => 'Frankfort', 'population' => 4505836, 'area_km2' => '104656.00', 'lat' => '38.1973', 'lon' => '-84.8631', 'timezone' => 'America/New_York', 'established_date' => '1792-06-01'],
            ['code' => 'LA', 'name' => 'Louisiana', 'capital' => 'Baton Rouge', 'population' => 4657757, 'area_km2' => '135659.00', 'lat' => '30.4515', 'lon' => '-91.1871', 'timezone' => 'America/Chicago', 'established_date' => '1812-04-30'],
            ['code' => 'ME', 'name' => 'Maine', 'capital' => 'Augusta', 'population' => 1344212, 'area_km2' => '91633.00', 'lat' => '44.3235', 'lon' => '-69.7653', 'timezone' => 'America/New_York', 'established_date' => '1820-03-15'],
            ['code' => 'MD', 'name' => 'Maryland', 'capital' => 'Annapolis', 'population' => 6177224, 'area_km2' => '32131.00', 'lat' => '38.9784', 'lon' => '-76.4922', 'timezone' => 'America/New_York', 'established_date' => '1788-04-28'],
            ['code' => 'MA', 'name' => 'Massachusetts', 'capital' => 'Boston', 'population' => 6892503, 'area_km2' => '27336.00', 'lat' => '42.2352', 'lon' => '-71.0275', 'timezone' => 'America/New_York', 'established_date' => '1788-02-06'],
            ['code' => 'MI', 'name' => 'Michigan', 'capital' => 'Lansing', 'population' => 10037261, 'area_km2' => '250487.00', 'lat' => '42.7335', 'lon' => '-84.5467', 'timezone' => 'America/New_York', 'established_date' => '1837-01-26'],
            ['code' => 'MN', 'name' => 'Minnesota', 'capital' => 'Saint Paul', 'population' => 5706494, 'area_km2' => '225163.00', 'lat' => '44.9442', 'lon' => '-93.0935', 'timezone' => 'America/Chicago', 'established_date' => '1858-05-11'],
            ['code' => 'MS', 'name' => 'Mississippi', 'capital' => 'Jackson', 'population' => 2961279, 'area_km2' => '125438.00', 'lat' => '32.3200', 'lon' => '-90.2074', 'timezone' => 'America/Chicago', 'established_date' => '1817-12-10'],
            ['code' => 'MO', 'name' => 'Missouri', 'capital' => 'Jefferson City', 'population' => 6154913, 'area_km2' => '180540.00', 'lat' => '38.5729', 'lon' => '-92.1893', 'timezone' => 'America/Chicago', 'established_date' => '1821-08-10'],
            ['code' => 'MT', 'name' => 'Montana', 'capital' => 'Helena', 'population' => 1084225, 'area_km2' => '380831.00', 'lat' => '46.5958', 'lon' => '-112.0270', 'timezone' => 'America/Denver', 'established_date' => '1889-11-08'],
            ['code' => 'NE', 'name' => 'Nebraska', 'capital' => 'Lincoln', 'population' => 1961504, 'area_km2' => '200330.00', 'lat' => '40.8136', 'lon' => '-96.7026', 'timezone' => 'America/Chicago', 'established_date' => '1867-03-01'],
            ['code' => 'NV', 'name' => 'Nevada', 'capital' => 'Carson City', 'population' => 3104614, 'area_km2' => '286380.00', 'lat' => '39.1608', 'lon' => '-119.7539', 'timezone' => 'America/Los_Angeles', 'established_date' => '1864-10-31'],
            ['code' => 'NH', 'name' => 'New Hampshire', 'capital' => 'Concord', 'population' => 1377529, 'area_km2' => '24214.00', 'lat' => '43.2201', 'lon' => '-71.5491', 'timezone' => 'America/New_York', 'established_date' => '1788-06-21'],
            ['code' => 'NJ', 'name' => 'New Jersey', 'capital' => 'Trenton', 'population' => 9288994, 'area_km2' => '22607.00', 'lat' => '40.2206', 'lon' => '-74.7597', 'timezone' => 'America/New_York', 'established_date' => '1787-12-18'],
            ['code' => 'NM', 'name' => 'New Mexico', 'capital' => 'Santa Fe', 'population' => 2117522, 'area_km2' => '314917.00', 'lat' => '35.6672', 'lon' => '-105.9644', 'timezone' => 'America/Denver', 'established_date' => '1912-01-06'],
            ['code' => 'NY', 'name' => 'New York', 'capital' => 'Albany', 'population' => 20201249, 'area_km2' => '141297.00', 'lat' => '42.6526', 'lon' => '-73.7562', 'timezone' => 'America/New_York', 'established_date' => '1788-07-26'],
            ['code' => 'NC', 'name' => 'North Carolina', 'capital' => 'Raleigh', 'population' => 10439388, 'area_km2' => '139391.00', 'lat' => '35.7710', 'lon' => '-78.6382', 'timezone' => 'America/New_York', 'established_date' => '1789-11-21'],
            ['code' => 'ND', 'name' => 'North Dakota', 'capital' => 'Bismarck', 'population' => 779094, 'area_km2' => '183108.00', 'lat' => '46.8083', 'lon' => '-100.7837', 'timezone' => 'America/Chicago', 'established_date' => '1889-11-02'],
            ['code' => 'OH', 'name' => 'Ohio', 'capital' => 'Columbus', 'population' => 11799448, 'area_km2' => '116098.00', 'lat' => '39.9612', 'lon' => '-82.9988', 'timezone' => 'America/New_York', 'established_date' => '1803-03-01'],
            ['code' => 'OK', 'name' => 'Oklahoma', 'capital' => 'Oklahoma City', 'population' => 3959353, 'area_km2' => '181037.00', 'lat' => '35.4823', 'lon' => '-97.5350', 'timezone' => 'America/Chicago', 'established_date' => '1907-11-16'],
            ['code' => 'OR', 'name' => 'Oregon', 'capital' => 'Salem', 'population' => 4237256, 'area_km2' => '254799.00', 'lat' => '44.9311', 'lon' => '-123.0291', 'timezone' => 'America/Los_Angeles', 'established_date' => '1859-02-14'],
            ['code' => 'PA', 'name' => 'Pennsylvania', 'capital' => 'Harrisburg', 'population' => 13002700, 'area_km2' => '119280.00', 'lat' => '40.2698', 'lon' => '-76.8756', 'timezone' => 'America/New_York', 'established_date' => '1787-12-12'],
            ['code' => 'RI', 'name' => 'Rhode Island', 'capital' => 'Providence', 'population' => 1097379, 'area_km2' => '4001.00', 'lat' => '41.8236', 'lon' => '-71.4222', 'timezone' => 'America/New_York', 'established_date' => '1790-05-29'],
            ['code' => 'SC', 'name' => 'South Carolina', 'capital' => 'Columbia', 'population' => 5118425, 'area_km2' => '82933.00', 'lat' => '34.0007', 'lon' => '-81.0348', 'timezone' => 'America/New_York', 'established_date' => '1788-05-23'],
            ['code' => 'SD', 'name' => 'South Dakota', 'capital' => 'Pierre', 'population' => 886667, 'area_km2' => '199729.00', 'lat' => '44.3668', 'lon' => '-100.3364', 'timezone' => 'America/Chicago', 'established_date' => '1889-11-02'],
            ['code' => 'TN', 'name' => 'Tennessee', 'capital' => 'Nashville', 'population' => 6910840, 'area_km2' => '109153.00', 'lat' => '36.1659', 'lon' => '-86.7844', 'timezone' => 'America/Chicago', 'established_date' => '1796-06-01'],
            ['code' => 'TX', 'name' => 'Texas', 'capital' => 'Austin', 'population' => 29145505, 'area_km2' => '695662.00', 'lat' => '30.2672', 'lon' => '-97.7431', 'timezone' => 'America/Chicago', 'established_date' => '1845-12-29'],
            ['code' => 'UT', 'name' => 'Utah', 'capital' => 'Salt Lake City', 'population' => 3271616, 'area_km2' => '219882.00', 'lat' => '40.7608', 'lon' => '-111.8910', 'timezone' => 'America/Denver', 'established_date' => '1896-01-04'],
            ['code' => 'VT', 'name' => 'Vermont', 'capital' => 'Montpelier', 'population' => 643077, 'area_km2' => '24906.00', 'lat' => '44.2601', 'lon' => '-72.5754', 'timezone' => 'America/New_York', 'established_date' => '1791-03-04'],
            ['code' => 'VA', 'name' => 'Virginia', 'capital' => 'Richmond', 'population' => 8631393, 'area_km2' => '110787.00', 'lat' => '37.5407', 'lon' => '-77.4360', 'timezone' => 'America/New_York', 'established_date' => '1788-06-25'],
            ['code' => 'WA', 'name' => 'Washington', 'capital' => 'Olympia', 'population' => 7705281, 'area_km2' => '184661.00', 'lat' => '47.0379', 'lon' => '-122.9015', 'timezone' => 'America/Los_Angeles', 'established_date' => '1889-11-11'],
            ['code' => 'WV', 'name' => 'West Virginia', 'capital' => 'Charleston', 'population' => 1793716, 'area_km2' => '62755.00', 'lat' => '38.3498', 'lon' => '-81.6326', 'timezone' => 'America/New_York', 'established_date' => '1863-06-20'],
            ['code' => 'WI', 'name' => 'Wisconsin', 'capital' => 'Madison', 'population' => 5893718, 'area_km2' => '169635.00', 'lat' => '43.0731', 'lon' => '-89.4012', 'timezone' => 'America/Chicago', 'established_date' => '1848-05-29'],
            ['code' => 'WY', 'name' => 'Wyoming', 'capital' => 'Cheyenne', 'population' => 576851, 'area_km2' => '253335.00', 'lat' => '41.1400', 'lon' => '-104.8192', 'timezone' => 'America/Denver', 'established_date' => '1890-07-10']
        ];
    }
}
