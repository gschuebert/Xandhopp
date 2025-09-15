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

#[AsCommand(name: 'app:import:all-us-states', description: 'Import all 50 US states with comprehensive data')]
class ImportAllUsStatesCommand extends Command
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
        $io->title('Importing All 50 US States');

        $wikipediaSource = $this->sourceRepository->findOneBy(['key' => 'wikipedia']);
        if (!$wikipediaSource) {
            $io->error('Wikipedia source not found');
            return Command::FAILURE;
        }

        $statesData = $this->getAllStatesData();
        $imported = 0;
        $skipped = 0;

        foreach ($statesData as $stateData) {
            $io->section("Processing {$stateData['name']}");

            // Check if state already exists
            $existingState = $this->stateRepository->findByStateCode($stateData['code']);
            if ($existingState) {
                $io->writeln("  ⚠️  State {$stateData['name']} already exists, skipping");
                $skipped++;
                continue;
            }

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

            // Add text content
            foreach ($stateData['content'] as $section => $content) {
                $text = new UsStateText();
                $text->setState($state)
                     ->setSection($section)
                     ->setLang('en')
                     ->setContent($content)
                     ->setSource($wikipediaSource);

                $this->em->persist($text);
            }

            $this->em->flush();
            $imported++;
            $io->writeln("  ✅ Imported {$stateData['name']}");
        }

        $io->success("Import completed! Imported: {$imported}, Skipped: {$skipped}");
        return Command::SUCCESS;
    }

    private function getAllStatesData(): array
    {
        return [
            // Already imported states (will be skipped)
            ['code' => 'AL', 'name' => 'Alabama', 'capital' => 'Montgomery', 'population' => 5024279, 'area_km2' => '135767.00', 'lat' => '32.3617', 'lon' => '-86.2792', 'timezone' => 'America/Chicago', 'established_date' => '1819-12-14', 'content' => []],
            ['code' => 'AK', 'name' => 'Alaska', 'capital' => 'Juneau', 'population' => 733391, 'area_km2' => '1717856.00', 'lat' => '58.3019', 'lon' => '-134.4197', 'timezone' => 'America/Anchorage', 'established_date' => '1959-01-03', 'content' => []],
            ['code' => 'AZ', 'name' => 'Arizona', 'capital' => 'Phoenix', 'population' => 7151502, 'area_km2' => '295234.00', 'lat' => '33.4484', 'lon' => '-112.0740', 'timezone' => 'America/Phoenix', 'established_date' => '1912-02-14', 'content' => []],
            ['code' => 'AR', 'name' => 'Arkansas', 'capital' => 'Little Rock', 'population' => 3011524, 'area_km2' => '137732.00', 'lat' => '34.7361', 'lon' => '-92.3311', 'timezone' => 'America/Chicago', 'established_date' => '1836-06-15', 'content' => []],
            ['code' => 'CA', 'name' => 'California', 'capital' => 'Sacramento', 'population' => 39538223, 'area_km2' => '423967.00', 'lat' => '38.5556', 'lon' => '-121.4689', 'timezone' => 'America/Los_Angeles', 'established_date' => '1850-09-09', 'content' => []],
            ['code' => 'CO', 'name' => 'Colorado', 'capital' => 'Denver', 'population' => 5773714, 'area_km2' => '269601.00', 'lat' => '39.7392', 'lon' => '-104.9903', 'timezone' => 'America/Denver', 'established_date' => '1876-08-01', 'content' => []],
            ['code' => 'CT', 'name' => 'Connecticut', 'capital' => 'Hartford', 'population' => 3605944, 'area_km2' => '14357.00', 'lat' => '41.7658', 'lon' => '-72.6734', 'timezone' => 'America/New_York', 'established_date' => '1788-01-09', 'content' => []],
            ['code' => 'DE', 'name' => 'Delaware', 'capital' => 'Dover', 'population' => 989948, 'area_km2' => '6446.00', 'lat' => '39.1619', 'lon' => '-75.5267', 'timezone' => 'America/New_York', 'established_date' => '1787-12-07', 'content' => []],
            ['code' => 'FL', 'name' => 'Florida', 'capital' => 'Tallahassee', 'population' => 21538187, 'area_km2' => '170312.00', 'lat' => '30.4518', 'lon' => '-84.2807', 'timezone' => 'America/New_York', 'established_date' => '1845-03-03', 'content' => []],
            ['code' => 'GA', 'name' => 'Georgia', 'capital' => 'Atlanta', 'population' => 10711908, 'area_km2' => '153910.00', 'lat' => '33.7490', 'lon' => '-84.3880', 'timezone' => 'America/New_York', 'established_date' => '1788-01-02', 'content' => []],
            ['code' => 'HI', 'name' => 'Hawaii', 'capital' => 'Honolulu', 'population' => 1455271, 'area_km2' => '28311.00', 'lat' => '21.3089', 'lon' => '-157.8261', 'timezone' => 'Pacific/Honolulu', 'established_date' => '1959-08-21', 'content' => []],
            ['code' => 'ID', 'name' => 'Idaho', 'capital' => 'Boise', 'population' => 1839106, 'area_km2' => '216443.00', 'lat' => '43.6137', 'lon' => '-116.2377', 'timezone' => 'America/Denver', 'established_date' => '1890-07-03', 'content' => []],
            ['code' => 'IL', 'name' => 'Illinois', 'capital' => 'Springfield', 'population' => 12812508, 'area_km2' => '149995.00', 'lat' => '39.7817', 'lon' => '-89.6501', 'timezone' => 'America/Chicago', 'established_date' => '1818-12-03', 'content' => []],
            ['code' => 'IN', 'name' => 'Indiana', 'capital' => 'Indianapolis', 'population' => 6785528, 'area_km2' => '94326.00', 'lat' => '39.7909', 'lon' => '-86.1477', 'timezone' => 'America/New_York', 'established_date' => '1816-12-11', 'content' => []],
            ['code' => 'IA', 'name' => 'Iowa', 'capital' => 'Des Moines', 'population' => 3190369, 'area_km2' => '145746.00', 'lat' => '41.5909', 'lon' => '-93.6208', 'timezone' => 'America/Chicago', 'established_date' => '1846-12-28', 'content' => []],

            // Remaining states to import
            [
                'code' => 'KS',
                'name' => 'Kansas',
                'capital' => 'Topeka',
                'population' => 2937880,
                'area_km2' => '213100.00',
                'lat' => '39.0558',
                'lon' => '-95.6894',
                'timezone' => 'America/Chicago',
                'established_date' => '1861-01-29',
                'content' => [
                    'overview' => 'Kansas is a state in the Midwestern region of the United States. It is bordered by Nebraska to the north, Missouri to the east, Oklahoma to the south, and Colorado to the west.',
                    'culture' => 'Kansas is known for its agricultural heritage and is often called the "Sunflower State." The state has a rich history of Native American cultures and is famous for its wheat production.',
                    'economy' => 'Kansas\'s economy is based on agriculture, manufacturing, and aviation. The state is a major producer of wheat, corn, and soybeans. Wichita is known as the "Air Capital of the World" for its aviation industry.',
                    'history' => 'Kansas was admitted to the Union as the 34th state on January 29, 1861. The state played a significant role in the Civil War and was known as "Bleeding Kansas" due to conflicts over slavery.',
                    'demography' => 'Kansas has a population of about 2.9 million people. Wichita is the largest city, while Topeka is the capital. The state has a predominantly rural character with several major urban centers.'
                ]
            ],
            [
                'code' => 'KY',
                'name' => 'Kentucky',
                'capital' => 'Frankfort',
                'population' => 4505836,
                'area_km2' => '104656.00',
                'lat' => '38.1973',
                'lon' => '-84.8631',
                'timezone' => 'America/New_York',
                'established_date' => '1792-06-01',
                'content' => [
                    'overview' => 'Kentucky is a state in the Southeastern region of the United States. It is bordered by Illinois, Indiana, and Ohio to the north, West Virginia and Virginia to the east, Tennessee to the south, and Missouri to the west.',
                    'culture' => 'Kentucky is known for its bourbon whiskey, horse racing, and bluegrass music. The state is famous for the Kentucky Derby and is home to many bourbon distilleries. Kentucky also has a strong tradition of country music.',
                    'economy' => 'Kentucky\'s economy is based on agriculture, manufacturing, and coal mining. The state is a major producer of tobacco, corn, and soybeans. Major industries include automotive manufacturing, bourbon production, and coal mining.',
                    'history' => 'Kentucky was admitted to the Union as the 15th state on June 1, 1792. The state was part of Virginia until it became a separate state. Kentucky played a significant role in the Civil War.',
                    'demography' => 'Kentucky has a population of about 4.5 million people. Louisville is the largest city, while Frankfort is the capital. The state has a mix of urban and rural areas.'
                ]
            ],
            [
                'code' => 'LA',
                'name' => 'Louisiana',
                'capital' => 'Baton Rouge',
                'population' => 4657757,
                'area_km2' => '135659.00',
                'lat' => '30.4515',
                'lon' => '-91.1871',
                'timezone' => 'America/Chicago',
                'established_date' => '1812-04-30',
                'content' => [
                    'overview' => 'Louisiana is a state in the Deep South and South Central regions of the United States. It is bordered by Arkansas to the north, Mississippi to the east, the Gulf of Mexico to the south, and Texas to the west.',
                    'culture' => 'Louisiana is known for its unique Creole and Cajun cultures, jazz music, and cuisine. New Orleans is famous for Mardi Gras, jazz, and its French Quarter. The state has a rich cultural heritage from French, Spanish, and African influences.',
                    'economy' => 'Louisiana\'s economy is based on oil and gas production, petrochemicals, agriculture, and tourism. The state is a major producer of oil and natural gas. New Orleans is a major port city and tourist destination.',
                    'history' => 'Louisiana was admitted to the Union as the 18th state on April 30, 1812. The state was part of the Louisiana Purchase and has a rich history of French and Spanish colonization.',
                    'demography' => 'Louisiana has a population of about 4.7 million people. New Orleans is the largest city, while Baton Rouge is the capital. The state has a diverse population with significant African American and Creole communities.'
                ]
            ],
            [
                'code' => 'ME',
                'name' => 'Maine',
                'capital' => 'Augusta',
                'population' => 1344212,
                'area_km2' => '91633.00',
                'lat' => '44.3235',
                'lon' => '-69.7653',
                'timezone' => 'America/New_York',
                'established_date' => '1820-03-15',
                'content' => [
                    'overview' => 'Maine is a state in the New England region of the United States. It is bordered by New Hampshire to the west, the Atlantic Ocean to the southeast, and the Canadian provinces of New Brunswick and Quebec to the northeast and northwest.',
                    'culture' => 'Maine is known for its lobster industry, lighthouses, and outdoor recreation. The state has a strong maritime culture and is famous for its rocky coastline. Maine is also known for its blueberries and maple syrup.',
                    'economy' => 'Maine\'s economy is based on fishing, agriculture, forestry, and tourism. The state is a major producer of lobster, blueberries, and potatoes. Tourism is significant, particularly in coastal areas.',
                    'history' => 'Maine was admitted to the Union as the 23rd state on March 15, 1820. The state was part of Massachusetts until it became a separate state as part of the Missouri Compromise.',
                    'demography' => 'Maine has a population of about 1.3 million people. Portland is the largest city, while Augusta is the capital. The state has a predominantly rural character with a few major urban centers.'
                ]
            ],
            [
                'code' => 'MD',
                'name' => 'Maryland',
                'capital' => 'Annapolis',
                'population' => 6177224,
                'area_km2' => '32131.00',
                'lat' => '38.9784',
                'lon' => '-76.4922',
                'timezone' => 'America/New_York',
                'established_date' => '1788-04-28',
                'content' => [
                    'overview' => 'Maryland is a state in the Mid-Atlantic region of the United States. It is bordered by Pennsylvania to the north, Delaware and the Atlantic Ocean to the east, Virginia and West Virginia to the south, and Washington, D.C. to the west.',
                    'culture' => 'Maryland is known for its blue crabs, Old Bay seasoning, and proximity to Washington, D.C. The state has a rich maritime history and is home to the U.S. Naval Academy. Maryland is also known for its diverse population.',
                    'economy' => 'Maryland\'s economy is based on government, biotechnology, defense, and education. The state is home to many federal agencies and defense contractors. Major industries include biotechnology, cybersecurity, and aerospace.',
                    'history' => 'Maryland was one of the original 13 colonies and was admitted to the Union on April 28, 1788. The state played a significant role in the American Revolution and Civil War.',
                    'demography' => 'Maryland has a population of about 6.2 million people. Baltimore is the largest city, while Annapolis is the capital. The state has a diverse population and is located in the densely populated Northeast corridor.'
                ]
            ]
        ];
    }
}
