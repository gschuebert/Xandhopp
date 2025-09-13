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

#[AsCommand(name: 'app:import:us-states', description: 'Import comprehensive US states data')]
class ImportUsStatesCommand extends Command
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
        $io->title('Importing US States Data');

        $wikipediaSource = $this->sourceRepository->findOneBy(['key' => 'wikipedia']);
        if (!$wikipediaSource) {
            $io->error('Wikipedia source not found');
            return Command::FAILURE;
        }

        $statesData = $this->getStatesData();
        $imported = 0;

        foreach ($statesData as $stateData) {
            $io->section("Importing {$stateData['name']}");

            // Check if state already exists
            $existingState = $this->stateRepository->findByStateCode($stateData['code']);
            if ($existingState) {
                $io->writeln("  ⚠️  State {$stateData['name']} already exists, skipping");
                continue;
            }

            // Create state
            $state = new UsState();
            $state->setStateCode($stateData['code'])
                  ->setNameEn($stateData['name'])
                  ->setNameLocal($stateData['name']) // Same as English for US states
                  ->setCapital($stateData['capital'])
                  ->setPopulation($stateData['population'])
                  ->setAreaKm2($stateData['area_km2'])
                  ->setLat($stateData['lat'])
                  ->setLon($stateData['lon'])
                  ->setTimezone($stateData['timezone'])
                  ->setEstablishedDate($stateData['established_date'] ? new \DateTime($stateData['established_date']) : null);

            $this->em->persist($state);
            $this->em->flush(); // Flush to get the ID

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

        $io->success("Successfully imported {$imported} US states!");
        return Command::SUCCESS;
    }

    private function getStatesData(): array
    {
        return [
            [
                'code' => 'AL',
                'name' => 'Alabama',
                'capital' => 'Montgomery',
                'population' => 5024279,
                'area_km2' => '135767.00',
                'lat' => '32.3617',
                'lon' => '-86.2792',
                'timezone' => 'America/Chicago',
                'established_date' => '1819-12-14',
                'content' => [
                    'overview' => 'Alabama is a state in the Southeastern region of the United States, bordered by Tennessee to the north; Georgia to the east; Florida and the Gulf of Mexico to the south; and Mississippi to the west. Alabama is the 30th largest by area and the 24th-most populous of the U.S. states.',
                    'culture' => 'Alabama is known for its rich cultural heritage, including its role in the Civil Rights Movement. The state has a strong tradition of Southern hospitality, country music, and college football. Alabama is home to the University of Alabama and Auburn University, which have intense football rivalries.',
                    'economy' => 'Alabama\'s economy is diverse, with major industries including automotive manufacturing, aerospace, steel production, and agriculture. The state is home to major automotive plants for Mercedes-Benz, Honda, Hyundai, and Toyota. Alabama also has a significant aerospace industry, particularly in Huntsville.',
                    'history' => 'Alabama was admitted to the Union as the 22nd state on December 14, 1819. The state played a crucial role in the Civil War and was the site of many important Civil Rights Movement events, including the Montgomery Bus Boycott and the Selma to Montgomery marches.',
                    'demography' => 'Alabama has a population of approximately 5 million people. The state is predominantly rural, with Birmingham being the largest city. The population is diverse, with significant African American, Hispanic, and Native American communities.'
                ]
            ],
            [
                'code' => 'AK',
                'name' => 'Alaska',
                'capital' => 'Juneau',
                'population' => 733391,
                'area_km2' => '1717856.00',
                'lat' => '58.3019',
                'lon' => '-134.4197',
                'timezone' => 'America/Anchorage',
                'established_date' => '1959-01-03',
                'content' => [
                    'overview' => 'Alaska is a state in the Western United States, on the northwest extremity of North America. It is the largest U.S. state by area and the third least populous, but the continent\'s most populous territory located mostly north of the 60th parallel.',
                    'culture' => 'Alaska has a unique culture shaped by its indigenous peoples, including the Inuit, Yupik, and Athabaskan groups. The state is known for its frontier spirit, outdoor recreation, and connection to nature. Alaska Native culture remains strong and influential.',
                    'economy' => 'Alaska\'s economy is heavily dependent on oil and gas production, fishing, and tourism. The state has no state income tax and provides residents with an annual dividend from oil revenues. Major industries include petroleum extraction, commercial fishing, and tourism.',
                    'history' => 'Alaska was purchased from Russia in 1867 for $7.2 million and became a U.S. territory. It was admitted as the 49th state on January 3, 1959. The discovery of oil in Prudhoe Bay in 1968 transformed the state\'s economy.',
                    'demography' => 'Alaska has a population of about 730,000 people, making it one of the least populous states. The population is concentrated in Anchorage, Fairbanks, and Juneau. The state has a significant indigenous population and is known for its diversity.'
                ]
            ],
            [
                'code' => 'AZ',
                'name' => 'Arizona',
                'capital' => 'Phoenix',
                'population' => 7151502,
                'area_km2' => '295234.00',
                'lat' => '33.4484',
                'lon' => '-112.0740',
                'timezone' => 'America/Phoenix',
                'established_date' => '1912-02-14',
                'content' => [
                    'overview' => 'Arizona is a state in the Southwestern region of the United States. It is the 6th largest and the 14th most populous of the 50 states. Its capital and largest city is Phoenix. Arizona is known for its desert climate and stunning natural landscapes.',
                    'culture' => 'Arizona has a rich cultural heritage influenced by Native American, Hispanic, and Western traditions. The state is known for its vibrant arts scene, particularly in Phoenix and Tucson. Arizona is also famous for its outdoor recreation and desert lifestyle.',
                    'economy' => 'Arizona\'s economy is diverse, with major sectors including technology, manufacturing, healthcare, and tourism. The state is home to major technology companies and has a growing aerospace industry. Tourism is significant, driven by attractions like the Grand Canyon.',
                    'history' => 'Arizona was part of the Mexican territory until 1848 and became a U.S. territory in 1863. It was admitted as the 48th state on February 14, 1912. The state has a rich history of Native American civilizations and Spanish colonization.',
                    'demography' => 'Arizona has a population of over 7 million people, with Phoenix being the largest city and state capital. The state has a significant Hispanic population and is one of the fastest-growing states in the nation.'
                ]
            ],
            [
                'code' => 'AR',
                'name' => 'Arkansas',
                'capital' => 'Little Rock',
                'population' => 3011524,
                'area_km2' => '137732.00',
                'lat' => '34.7361',
                'lon' => '-92.3311',
                'timezone' => 'America/Chicago',
                'established_date' => '1836-06-15',
                'content' => [
                    'overview' => 'Arkansas is a landlocked state in the South Central region of the United States. It is bordered by Missouri to the north, Tennessee and Mississippi to the east, Louisiana to the south, and Texas and Oklahoma to the west.',
                    'culture' => 'Arkansas is known for its Southern culture, including country music, barbecue, and outdoor recreation. The state has a rich literary tradition and is home to the Clinton Presidential Library. Arkansas is also known for its natural beauty and outdoor activities.',
                    'economy' => 'Arkansas\'s economy is based on agriculture, manufacturing, and services. The state is a major producer of rice, cotton, and poultry. Major companies like Walmart and Tyson Foods are headquartered in Arkansas.',
                    'history' => 'Arkansas was admitted to the Union as the 25th state on June 15, 1836. The state played a significant role in the Civil War and was the site of important Civil Rights Movement events, including the Little Rock Nine school integration crisis.',
                    'demography' => 'Arkansas has a population of about 3 million people. Little Rock is the capital and largest city. The state has a predominantly rural character with a significant African American population.'
                ]
            ],
            [
                'code' => 'CA',
                'name' => 'California',
                'capital' => 'Sacramento',
                'population' => 39538223,
                'area_km2' => '423967.00',
                'lat' => '38.5556',
                'lon' => '-121.4689',
                'timezone' => 'America/Los_Angeles',
                'established_date' => '1850-09-09',
                'content' => [
                    'overview' => 'California is a state in the Western United States. It is the most populous U.S. state and the third-largest by area. California is known for its diverse geography, ranging from the Pacific Coast to the Sierra Nevada mountains and the Mojave Desert.',
                    'culture' => 'California is a global cultural center, home to Hollywood, Silicon Valley, and major universities. The state is known for its entertainment industry, technology innovation, and diverse population. California has influenced global culture through film, music, and technology.',
                    'economy' => 'California has the largest economy of any U.S. state and would rank as the world\'s fifth-largest economy if it were a country. Major industries include technology, entertainment, agriculture, and manufacturing. The state is home to major companies like Apple, Google, and Tesla.',
                    'history' => 'California was part of Mexico until 1848 and became a U.S. state on September 9, 1850. The California Gold Rush of 1849 brought rapid population growth. The state has been at the forefront of many social and technological movements.',
                    'demography' => 'California has a population of nearly 40 million people, making it the most populous state. The state is highly diverse, with significant Hispanic, Asian, and African American populations. Major cities include Los Angeles, San Francisco, and San Diego.'
                ]
            ],
            [
                'code' => 'CO',
                'name' => 'Colorado',
                'capital' => 'Denver',
                'population' => 5773714,
                'area_km2' => '269601.00',
                'lat' => '39.7392',
                'lon' => '-104.9903',
                'timezone' => 'America/Denver',
                'established_date' => '1876-08-01',
                'content' => [
                    'overview' => 'Colorado is a state in the Mountain West subregion of the Western United States. It is the 8th most extensive and 21st most populous U.S. state. Colorado is known for its diverse geography, including the Rocky Mountains, high plains, and desert lands.',
                    'culture' => 'Colorado is known for its outdoor recreation culture, including skiing, hiking, and mountain biking. The state has a vibrant craft beer scene and is home to many outdoor enthusiasts. Denver is a major cultural and economic center.',
                    'economy' => 'Colorado\'s economy is diverse, with major industries including technology, aerospace, energy, and tourism. The state is home to major aerospace companies and has a growing technology sector. Tourism is significant, driven by outdoor recreation and natural attractions.',
                    'history' => 'Colorado was admitted to the Union as the 38th state on August 1, 1876. The state was shaped by mining, particularly the Colorado Gold Rush, and later by agriculture and tourism. Colorado has a rich history of Native American cultures.',
                    'demography' => 'Colorado has a population of about 5.8 million people. Denver is the capital and largest city. The state has experienced significant population growth in recent decades, particularly in the Front Range urban corridor.'
                ]
            ],
            [
                'code' => 'CT',
                'name' => 'Connecticut',
                'capital' => 'Hartford',
                'population' => 3605944,
                'area_km2' => '14357.00',
                'lat' => '41.7658',
                'lon' => '-72.6734',
                'timezone' => 'America/New_York',
                'established_date' => '1788-01-09',
                'content' => [
                    'overview' => 'Connecticut is the southernmost state in the New England region of the United States. It is bordered by Rhode Island to the east, Massachusetts to the north, New York to the west, and Long Island Sound to the south.',
                    'culture' => 'Connecticut is known for its rich colonial history and cultural institutions. The state is home to Yale University and has a strong tradition of education and innovation. Connecticut is also known for its picturesque New England towns and coastal areas.',
                    'economy' => 'Connecticut has a diverse economy with major industries including finance, insurance, manufacturing, and healthcare. The state is home to many Fortune 500 companies and has a high per capita income. Major industries include aerospace, pharmaceuticals, and financial services.',
                    'history' => 'Connecticut was one of the original 13 colonies and was admitted to the Union on January 9, 1788. The state played a significant role in the American Revolution and has a rich colonial history. Connecticut was known as the "Constitution State."',
                    'demography' => 'Connecticut has a population of about 3.6 million people. The state is densely populated, with major cities including Hartford, New Haven, and Stamford. Connecticut has a highly educated population and high median household income.'
                ]
            ],
            [
                'code' => 'DE',
                'name' => 'Delaware',
                'capital' => 'Dover',
                'population' => 989948,
                'area_km2' => '6446.00',
                'lat' => '39.1619',
                'lon' => '-75.5267',
                'timezone' => 'America/New_York',
                'established_date' => '1787-12-07',
                'content' => [
                    'overview' => 'Delaware is a state in the Mid-Atlantic region of the United States, bordering Maryland to its south and west; Pennsylvania to its north; and New Jersey and the Atlantic Ocean to its east. Delaware is the second-smallest and sixth-least populous state.',
                    'culture' => 'Delaware is known for its corporate-friendly business environment and tax advantages. The state has a rich colonial history and is home to many historic sites. Delaware is also known for its beaches and coastal recreation.',
                    'economy' => 'Delaware\'s economy is dominated by finance, particularly corporate law and banking. The state is known for its business-friendly laws and is home to many corporations. Major industries include chemicals, agriculture, and financial services.',
                    'history' => 'Delaware was the first state to ratify the U.S. Constitution on December 7, 1787, earning it the nickname "The First State." The state has a rich colonial history and was an important center of commerce and trade.',
                    'demography' => 'Delaware has a population of about 990,000 people, making it one of the least populous states. Wilmington is the largest city, while Dover is the capital. The state has a diverse population and is located in the densely populated Northeast corridor.'
                ]
            ],
            [
                'code' => 'FL',
                'name' => 'Florida',
                'capital' => 'Tallahassee',
                'population' => 21538187,
                'area_km2' => '170312.00',
                'lat' => '30.4518',
                'lon' => '-84.2807',
                'timezone' => 'America/New_York',
                'established_date' => '1845-03-03',
                'content' => [
                    'overview' => 'Florida is a state in the Southeastern region of the United States, bordered to the west by the Gulf of Mexico, to the north by Alabama and Georgia, to the east by the Atlantic Ocean, and to the south by the Straits of Florida.',
                    'culture' => 'Florida is known for its diverse culture, influenced by its large Hispanic population, tourism industry, and unique geography. The state is famous for its theme parks, beaches, and vibrant nightlife. Florida has a rich cultural heritage from various immigrant communities.',
                    'economy' => 'Florida\'s economy is driven by tourism, agriculture, international trade, and aerospace. The state is home to major theme parks, space industry facilities, and international ports. Florida is also a major producer of citrus fruits and other agricultural products.',
                    'history' => 'Florida was admitted to the Union as the 27th state on March 3, 1845. The state has a rich history of Spanish colonization, Native American cultures, and later American settlement. Florida played important roles in the Civil War and Civil Rights Movement.',
                    'demography' => 'Florida has a population of over 21 million people, making it the third most populous state. The state has a large Hispanic population and is a major destination for retirees. Major cities include Miami, Tampa, Orlando, and Jacksonville.'
                ]
            ],
            [
                'code' => 'GA',
                'name' => 'Georgia',
                'capital' => 'Atlanta',
                'population' => 10711908,
                'area_km2' => '153910.00',
                'lat' => '33.7490',
                'lon' => '-84.3880',
                'timezone' => 'America/New_York',
                'established_date' => '1788-01-02',
                'content' => [
                    'overview' => 'Georgia is a state in the Southeastern region of the United States, bordered by Tennessee and North Carolina to the north; South Carolina to the northeast; Florida to the south; and Alabama to the west.',
                    'culture' => 'Georgia is known for its rich Southern culture, including music, food, and hospitality. The state is home to Atlanta, a major cultural and economic center. Georgia has a strong tradition of country music, soul music, and hip-hop.',
                    'economy' => 'Georgia\'s economy is diverse, with major industries including agriculture, manufacturing, logistics, and technology. Atlanta is a major transportation hub and home to many Fortune 500 companies. The state is also a major producer of peanuts, peaches, and poultry.',
                    'history' => 'Georgia was one of the original 13 colonies and was admitted to the Union on January 2, 1788. The state played a significant role in the Civil War and was the birthplace of the Civil Rights Movement. Georgia has a complex history of slavery, segregation, and progress.',
                    'demography' => 'Georgia has a population of over 10.7 million people. Atlanta is the capital and largest city. The state has a significant African American population and is experiencing rapid growth, particularly in the Atlanta metropolitan area.'
                ]
            ]
        ];
    }
}
