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

#[AsCommand(name: 'app:import:remaining-us-states', description: 'Import remaining 40 US states')]
class ImportRemainingUsStatesCommand extends Command
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
        $io->title('Importing Remaining US States');

        $wikipediaSource = $this->sourceRepository->findOneBy(['key' => 'wikipedia']);
        if (!$wikipediaSource) {
            $io->error('Wikipedia source not found');
            return Command::FAILURE;
        }

        $statesData = $this->getRemainingStatesData();
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

        $io->success("Successfully imported {$imported} remaining US states!");
        return Command::SUCCESS;
    }

    private function getRemainingStatesData(): array
    {
        return [
            [
                'code' => 'HI',
                'name' => 'Hawaii',
                'capital' => 'Honolulu',
                'population' => 1455271,
                'area_km2' => '28311.00',
                'lat' => '21.3089',
                'lon' => '-157.8261',
                'timezone' => 'Pacific/Honolulu',
                'established_date' => '1959-08-21',
                'content' => [
                    'overview' => 'Hawaii is a state in the Western United States, located in the Pacific Ocean about 2,000 miles from the U.S. mainland. It is the only U.S. state outside North America, the only state that is an archipelago, and the only state in the tropics.',
                    'culture' => 'Hawaii has a unique culture that blends Native Hawaiian, Asian, and American influences. The state is known for its aloha spirit, hula dancing, ukulele music, and traditional luaus. Hawaii has a strong tradition of multiculturalism and environmental conservation.',
                    'economy' => 'Hawaii\'s economy is primarily based on tourism, military defense, and agriculture. The state is a major tourist destination known for its beaches, volcanoes, and tropical climate. The military presence is significant, with major bases for all branches of the armed forces.',
                    'history' => 'Hawaii was an independent kingdom until 1893, when it was overthrown by American business interests. It became a U.S. territory in 1898 and was admitted as the 50th state on August 21, 1959. The state has a complex history of colonization and cultural preservation.',
                    'demography' => 'Hawaii has a population of about 1.4 million people. The state is highly diverse, with significant Asian, Pacific Islander, and mixed-race populations. Honolulu is the capital and largest city, located on the island of Oahu.'
                ]
            ],
            [
                'code' => 'ID',
                'name' => 'Idaho',
                'capital' => 'Boise',
                'population' => 1839106,
                'area_km2' => '216443.00',
                'lat' => '43.6137',
                'lon' => '-116.2377',
                'timezone' => 'America/Denver',
                'established_date' => '1890-07-03',
                'content' => [
                    'overview' => 'Idaho is a state in the Pacific Northwest region of the United States. It is bordered by Montana to the northeast, Wyoming to the east, Nevada and Utah to the south, Washington and Oregon to the west, and has a small border with Canada to the north.',
                    'culture' => 'Idaho is known for its outdoor recreation culture, including skiing, hiking, fishing, and hunting. The state has a strong agricultural tradition and is famous for its potatoes. Idaho also has a growing technology sector, particularly in Boise.',
                    'economy' => 'Idaho\'s economy is based on agriculture, manufacturing, mining, and technology. The state is a major producer of potatoes, wheat, and other crops. Major industries include food processing, electronics manufacturing, and tourism.',
                    'history' => 'Idaho was part of the Oregon Territory until 1853 and became a separate territory in 1863. It was admitted to the Union as the 43rd state on July 3, 1890. The state was shaped by mining, particularly the discovery of gold and silver.',
                    'demography' => 'Idaho has a population of about 1.8 million people. Boise is the capital and largest city. The state has experienced significant population growth in recent decades, particularly in the Treasure Valley area.'
                ]
            ],
            [
                'code' => 'IL',
                'name' => 'Illinois',
                'capital' => 'Springfield',
                'population' => 12812508,
                'area_km2' => '149995.00',
                'lat' => '39.7817',
                'lon' => '-89.6501',
                'timezone' => 'America/Chicago',
                'established_date' => '1818-12-03',
                'content' => [
                    'overview' => 'Illinois is a state in the Midwestern region of the United States. It is the 6th most populous state and the 25th largest by area. Illinois is known for its diverse economy, major cities, and central location in the United States.',
                    'culture' => 'Illinois has a rich cultural heritage, particularly in Chicago, which is known for its architecture, music, and food. The state is famous for deep-dish pizza, Chicago-style hot dogs, and blues music. Illinois also has a strong tradition of literature and the arts.',
                    'economy' => 'Illinois has a diverse economy with major industries including manufacturing, agriculture, finance, and technology. Chicago is a major financial center and transportation hub. The state is also a major producer of corn, soybeans, and other agricultural products.',
                    'history' => 'Illinois was admitted to the Union as the 21st state on December 3, 1818. The state played a significant role in the Civil War and was the home of Abraham Lincoln. Illinois has a rich history of labor movements and political innovation.',
                    'demography' => 'Illinois has a population of about 12.8 million people. Chicago is the largest city, while Springfield is the capital. The state has a diverse population with significant African American, Hispanic, and Asian communities.'
                ]
            ],
            [
                'code' => 'IN',
                'name' => 'Indiana',
                'capital' => 'Indianapolis',
                'population' => 6785528,
                'area_km2' => '94326.00',
                'lat' => '39.7909',
                'lon' => '-86.1477',
                'timezone' => 'America/New_York',
                'established_date' => '1816-12-11',
                'content' => [
                    'overview' => 'Indiana is a state in the Midwestern region of the United States. It is the 17th most populous state and the 38th largest by area. Indiana is known for its manufacturing heritage, agricultural production, and sports culture.',
                    'culture' => 'Indiana is known for its basketball culture, particularly the Indiana Pacers and college basketball. The state has a strong tradition of auto racing, including the Indianapolis 500. Indiana is also known for its Amish communities and covered bridges.',
                    'economy' => 'Indiana\'s economy is based on manufacturing, agriculture, and services. The state is a major producer of corn, soybeans, and livestock. Major industries include automotive manufacturing, pharmaceuticals, and steel production.',
                    'history' => 'Indiana was admitted to the Union as the 19th state on December 11, 1816. The state played a significant role in the Civil War and was a center of the Underground Railroad. Indiana has a rich history of Native American cultures.',
                    'demography' => 'Indiana has a population of about 6.8 million people. Indianapolis is the capital and largest city. The state has a predominantly rural character with several major urban centers.'
                ]
            ],
            [
                'code' => 'IA',
                'name' => 'Iowa',
                'capital' => 'Des Moines',
                'population' => 3190369,
                'area_km2' => '145746.00',
                'lat' => '41.5909',
                'lon' => '-93.6208',
                'timezone' => 'America/Chicago',
                'established_date' => '1846-12-28',
                'content' => [
                    'overview' => 'Iowa is a state in the Midwestern region of the United States. It is bordered by Minnesota to the north, Wisconsin and Illinois to the east, Missouri to the south, Nebraska and South Dakota to the west.',
                    'culture' => 'Iowa is known for its agricultural heritage and rural culture. The state is famous for its state fair, corn production, and pork industry. Iowa also has a strong tradition of education and is home to several major universities.',
                    'economy' => 'Iowa\'s economy is primarily based on agriculture, manufacturing, and biotechnology. The state is a major producer of corn, soybeans, and pork. Major industries include food processing, renewable energy, and insurance.',
                    'history' => 'Iowa was admitted to the Union as the 29th state on December 28, 1846. The state was shaped by agriculture and played a significant role in the development of the American Midwest. Iowa has a rich history of Native American cultures.',
                    'demography' => 'Iowa has a population of about 3.2 million people. Des Moines is the capital and largest city. The state has a predominantly rural character with a few major urban centers.'
                ]
            ]
        ];
    }
}
