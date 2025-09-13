<?php

declare(strict_types=1);

namespace App\Command;

use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:countries:update-content', description: 'Update country content with real data')]
class UpdateCountryContentCommand extends Command
{
    public function __construct(private Connection $db)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Updating Country Content');

        // Germany content
        $germanyContent = [
            'overview' => 'Germany, officially the Federal Republic of Germany, is a country in Central Europe. It is the second-most populous country in Europe after Russia, and the most populous member state of the European Union. Germany is situated between the Baltic and North seas to the north, and the Alps to the south; it covers an area of 357,022 square kilometres, with a population of over 83 million within its 16 constituent states.',
            'culture' => 'German culture has been shaped by major intellectual and popular currents in Europe, both religious and secular. Historically, Germany has been called Das Land der Dichter und Denker (the country of poets and thinkers). German literature can be traced back to the Middle Ages, with the most notable authors of the period being Walther von der Vogelweide and Wolfram von Eschenbach.',
            'economy' => 'Germany has a social market economy with a highly skilled labour force, a large capital stock, a low level of corruption, and a high level of innovation. It is the world\'s third-largest exporter of goods, and has the largest economy in Europe, which is also the world\'s fourth-largest economy by nominal GDP, and the fifth-largest by PPP.',
            'history' => 'The concept of Germany as a distinct region in Central Europe can be traced to Roman commander Julius Caesar, who referred to the unconquered area east of the Rhine as Germania, thus distinguishing it from Gaul. The victory of the Germanic tribes in the Battle of the Teutoburg Forest (AD 9) prevented annexation by the Roman Empire.',
            'demography' => 'With a population of 83.2 million inhabitants, Germany is the most populous country in the European Union, the second most populous country in Europe after Russia, and the nineteenth most populous country in the world. Its population density stands at 233 inhabitants per square kilometre.'
        ];

        // France content
        $franceContent = [
            'overview' => 'France, officially the French Republic, is a country primarily located in Western Europe. It also includes overseas regions and territories in the Americas and the Atlantic, Pacific and Indian Oceans. Metropolitan France extends from the Mediterranean Sea to the English Channel and the North Sea, and from the Rhine to the Atlantic Ocean.',
            'culture' => 'French culture has been shaped by geography, by profound historical events, and by foreign and internal forces and groups. France, and in particular Paris, has played an important role as a center of high culture since the 17th century and from the 19th century on, worldwide.',
            'economy' => 'France has a mixed economy that combines extensive private enterprise with substantial state enterprise and government intervention. The government retains considerable influence over key segments of infrastructure sectors, with majority ownership of railway, electricity, aircraft, nuclear power and telecommunications.',
            'history' => 'The first written records for the history of France appear in the Iron Age. What is now France made up the bulk of the region known to the Romans as Gaul. Greek writers noted the presence of three main ethno-linguistic groups in the area: the Gauls, the Aquitani, and the Belgae.',
            'demography' => 'France is the second most populous country in Europe after Germany, with an estimated population of 68 million people as of January 2023. France is the fourth most populous country in the European Union and the second most populous country in Europe after Germany.'
        ];

        // United States content
        $usContent = [
            'overview' => 'The United States of America (USA), commonly known as the United States (U.S. or US) or America, is a country primarily located in North America. It consists of 50 states, a federal district, five major unincorporated territories, nine Minor Outlying Islands, and 326 Indian reservations.',
            'culture' => 'American culture includes both conservative and liberal elements, scientific and religious competitiveness, political structures, risk taking and free expression, materialist and moral elements. Despite certain consistent ideological principles, American culture has a variety of expressions due to its geographical scale and demographic diversity.',
            'economy' => 'The United States has a mixed economy, which is fueled by abundant natural resources, a well-developed infrastructure, and high productivity. According to the International Monetary Fund, the U.S. GDP of $23 trillion constitutes 24% of the gross world product at market exchange rates and over 16% of the gross world product at purchasing power parity.',
            'history' => 'The history of the lands that became the United States began with the arrival of the first people in the Americas around 15,000 BC. Numerous indigenous cultures formed, and many saw transformations in the 16th century away from more densely populated lifestyles and towards reorganized polities elsewhere.',
            'demography' => 'The United States is the third most populous country in the world, with an estimated population of 331 million people as of 2020. The U.S. population grew by 0.1% between 2019 and 2020, the slowest rate since 1918, during World War I.'
        ];

        // Japan content
        $japanContent = [
            'overview' => 'Japan is an island country in East Asia. It is situated in the northwest Pacific Ocean, and is bordered on the west by the Sea of Japan, while extending from the Sea of Okhotsk in the north toward the East China Sea, Philippine Sea, and Taiwan in the south.',
            'culture' => 'Japanese culture has evolved greatly from its origins. Contemporary culture combines influences from Asia, Europe and North America. Traditional Japanese arts include crafts such as ceramics, textiles, lacquerware, swords and dolls; performances of bunraku, kabuki, noh, dance, and rakugo; and other practices, the tea ceremony, ikebana, martial arts, calligraphy, origami, onsen, Geisha and games.',
            'economy' => 'Japan is the third-largest in the world by nominal GDP and the fourth-largest by purchasing power parity (PPP). It is the world\'s second-largest developed economy. Japan is a member of both the G7 and G20. According to the World Bank, the country\'s per capita GDP (PPP) was at $40,193 (2020).',
            'history' => 'The first human habitation in the Japanese archipelago has been traced to prehistoric times around 30,000 BC. The Jōmon period, named after its cord-marked pottery, was followed by the Yayoi period in the first millennium BC when new inventions were introduced from Asia.',
            'demography' => 'Japan has a population of 125.8 million people, making it the 11th most populous country in the world. The population is expected to drop to around 88 million by 2065. Japan has the highest life expectancy in the world and the third lowest infant mortality rate.'
        ];

        $countries = [
            ['id' => 2, 'name' => 'Germany', 'content' => $germanyContent],
            ['id' => 3, 'name' => 'France', 'content' => $franceContent],
            ['id' => 4, 'name' => 'United States', 'content' => $usContent],
            ['id' => 5, 'name' => 'Japan', 'content' => $japanContent],
        ];

        foreach ($countries as $country) {
            $io->section("Updating {$country['name']}");
            
            foreach ($country['content'] as $section => $content) {
                $this->db->executeStatement(
                    'INSERT INTO country_text (country_id, section, lang, content, source_id) VALUES (?, ?, ?, ?, ?)
                     ON CONFLICT (country_id, section, lang) DO UPDATE SET content = EXCLUDED.content',
                    [$country['id'], $section, 'en', $content, 1]
                );
                $io->writeln("  ✓ Updated {$section}");
            }
        }

        $io->success('Country content updated successfully!');
        return Command::SUCCESS;
    }
}
