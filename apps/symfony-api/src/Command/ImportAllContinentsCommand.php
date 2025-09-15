<?php

namespace App\Command;

use App\Entity\Country;
use App\Entity\Source;
use App\Repository\CountryRepository;
use App\Repository\SourceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:import-all-continents',
    description: 'Import all continents with their most important countries for expats',
)]
class ImportAllContinentsCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private CountryRepository $countryRepository,
        private SourceRepository $sourceRepository
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        
        // Get or create Wikipedia source
        $source = $this->sourceRepository->findOneBy(['key' => 'wikipedia']);
        if (!$source) {
            $source = new Source();
            $source->setKey('wikipedia');
            $source->setBaseUrl('https://wikipedia.org');
            $this->entityManager->persist($source);
            $this->entityManager->flush();
        }

        $io->title('Importing All Continents and Countries');

        // Define all continents with their most important countries for expats
        $continentsData = [
            'Africa' => [
                ['name' => 'South Africa', 'iso2' => 'ZA', 'iso3' => 'ZAF', 'capital' => 'Cape Town', 'population' => 60000000, 'area_km2' => 1221037, 'lat' => -30.5595, 'lon' => 22.9375, 'currency_code' => 'ZAR'],
                ['name' => 'Morocco', 'iso2' => 'MA', 'iso3' => 'MAR', 'capital' => 'Rabat', 'population' => 37000000, 'area_km2' => 446550, 'lat' => 31.6295, 'lon' => -7.9811, 'currency_code' => 'MAD'],
                ['name' => 'Egypt', 'iso2' => 'EG', 'iso3' => 'EGY', 'capital' => 'Cairo', 'population' => 104000000, 'area_km2' => 1001449, 'lat' => 26.0975, 'lon' => 30.0444, 'currency_code' => 'EGP'],
                ['name' => 'Kenya', 'iso2' => 'KE', 'iso3' => 'KEN', 'capital' => 'Nairobi', 'population' => 54000000, 'area_km2' => 580367, 'lat' => -0.0236, 'lon' => 37.9062, 'currency_code' => 'KES'],
                ['name' => 'Ghana', 'iso2' => 'GH', 'iso3' => 'GHA', 'capital' => 'Accra', 'population' => 32000000, 'area_km2' => 238533, 'lat' => 7.9465, 'lon' => -1.0232, 'currency_code' => 'GHS'],
                ['name' => 'Nigeria', 'iso2' => 'NG', 'iso3' => 'NGA', 'capital' => 'Abuja', 'population' => 220000000, 'area_km2' => 923768, 'lat' => 9.0765, 'lon' => 7.3986, 'currency_code' => 'NGN'],
                ['name' => 'Tunisia', 'iso2' => 'TN', 'iso3' => 'TUN', 'capital' => 'Tunis', 'population' => 12000000, 'area_km2' => 163610, 'lat' => 33.8869, 'lon' => 9.5375, 'currency_code' => 'TND'],
                ['name' => 'Algeria', 'iso2' => 'DZ', 'iso3' => 'DZA', 'capital' => 'Algiers', 'population' => 45000000, 'area_km2' => 2381741, 'lat' => 28.0339, 'lon' => 1.6596, 'currency_code' => 'DZD'],
                ['name' => 'Ethiopia', 'iso2' => 'ET', 'iso3' => 'ETH', 'capital' => 'Addis Ababa', 'population' => 120000000, 'area_km2' => 1104300, 'lat' => 9.1450, 'lon' => 40.4897, 'currency_code' => 'ETB'],
                ['name' => 'Rwanda', 'iso2' => 'RW', 'iso3' => 'RWA', 'capital' => 'Kigali', 'population' => 13000000, 'area_km2' => 26338, 'lat' => -1.9403, 'lon' => 29.8739, 'currency_code' => 'RWF'],
                ['name' => 'Botswana', 'iso2' => 'BW', 'iso3' => 'BWA', 'capital' => 'Gaborone', 'population' => 2400000, 'area_km2' => 581730, 'lat' => -22.3285, 'lon' => 24.6849, 'currency_code' => 'BWP'],
                ['name' => 'Namibia', 'iso2' => 'NA', 'iso3' => 'NAM', 'capital' => 'Windhoek', 'population' => 2600000, 'area_km2' => 824292, 'lat' => -22.9576, 'lon' => 18.4904, 'currency_code' => 'NAD'],
                ['name' => 'Mauritius', 'iso2' => 'MU', 'iso3' => 'MUS', 'capital' => 'Port Louis', 'population' => 1300000, 'area_km2' => 2040, 'lat' => -20.3484, 'lon' => 57.5522, 'currency_code' => 'MUR'],
                ['name' => 'Seychelles', 'iso2' => 'SC', 'iso3' => 'SYC', 'capital' => 'Victoria', 'population' => 100000, 'area_km2' => 455, 'lat' => -4.6796, 'lon' => 55.4920, 'currency_code' => 'SCR'],
                ['name' => 'Senegal', 'iso2' => 'SN', 'iso3' => 'SEN', 'capital' => 'Dakar', 'population' => 17000000, 'area_km2' => 196722, 'lat' => 14.4974, 'lon' => -14.4524, 'currency_code' => 'XOF']
            ],
            'South America' => [
                ['name' => 'Brazil', 'iso2' => 'BR', 'iso3' => 'BRA', 'capital' => 'Brasília', 'population' => 215000000, 'area_km2' => 8514877, 'lat' => -14.2350, 'lon' => -51.9253, 'currency_code' => 'BRL'],
                ['name' => 'Argentina', 'iso2' => 'AR', 'iso3' => 'ARG', 'capital' => 'Buenos Aires', 'population' => 46000000, 'area_km2' => 2780400, 'lat' => -38.4161, 'lon' => -63.6167, 'currency_code' => 'ARS'],
                ['name' => 'Chile', 'iso2' => 'CL', 'iso3' => 'CHL', 'capital' => 'Santiago', 'population' => 19000000, 'area_km2' => 756102, 'lat' => -35.6751, 'lon' => -71.5430, 'currency_code' => 'CLP'],
                ['name' => 'Colombia', 'iso2' => 'CO', 'iso3' => 'COL', 'capital' => 'Bogotá', 'population' => 51000000, 'area_km2' => 1141748, 'lat' => 4.5709, 'lon' => -74.2973, 'currency_code' => 'COP'],
                ['name' => 'Peru', 'iso2' => 'PE', 'iso3' => 'PER', 'capital' => 'Lima', 'population' => 34000000, 'area_km2' => 1285216, 'lat' => -9.1900, 'lon' => -75.0152, 'currency_code' => 'PEN'],
                ['name' => 'Uruguay', 'iso2' => 'UY', 'iso3' => 'URY', 'capital' => 'Montevideo', 'population' => 3500000, 'area_km2' => 176215, 'lat' => -32.5228, 'lon' => -55.7658, 'currency_code' => 'UYU'],
                ['name' => 'Ecuador', 'iso2' => 'EC', 'iso3' => 'ECU', 'capital' => 'Quito', 'population' => 18000000, 'area_km2' => 276841, 'lat' => -1.8312, 'lon' => -78.1834, 'currency_code' => 'USD'],
                ['name' => 'Paraguay', 'iso2' => 'PY', 'iso3' => 'PRY', 'capital' => 'Asunción', 'population' => 7000000, 'area_km2' => 406752, 'lat' => -23.4425, 'lon' => -58.4438, 'currency_code' => 'PYG'],
                ['name' => 'Bolivia', 'iso2' => 'BO', 'iso3' => 'BOL', 'capital' => 'Sucre', 'population' => 12000000, 'area_km2' => 1098581, 'lat' => -16.2902, 'lon' => -63.5887, 'currency_code' => 'BOB'],
                ['name' => 'Venezuela', 'iso2' => 'VE', 'iso3' => 'VEN', 'capital' => 'Caracas', 'population' => 28000000, 'area_km2' => 916445, 'lat' => 6.4238, 'lon' => -66.5897, 'currency_code' => 'VES'],
                ['name' => 'Guyana', 'iso2' => 'GY', 'iso3' => 'GUY', 'capital' => 'Georgetown', 'population' => 800000, 'area_km2' => 214969, 'lat' => 4.8604, 'lon' => -58.9302, 'currency_code' => 'GYD'],
                ['name' => 'Suriname', 'iso2' => 'SR', 'iso3' => 'SUR', 'capital' => 'Paramaribo', 'population' => 600000, 'area_km2' => 163820, 'lat' => 3.9193, 'lon' => -56.0278, 'currency_code' => 'SRD'],
                ['name' => 'French Guiana', 'iso2' => 'GF', 'iso3' => 'GUF', 'capital' => 'Cayenne', 'population' => 300000, 'area_km2' => 83534, 'lat' => 3.9339, 'lon' => -53.1258, 'currency_code' => 'EUR'],
                ['name' => 'Falkland Islands', 'iso2' => 'FK', 'iso3' => 'FLK', 'capital' => 'Stanley', 'population' => 3000, 'area_km2' => 12173, 'lat' => -51.7963, 'lon' => -59.5236, 'currency_code' => 'FKP'],
                ['name' => 'South Georgia and the South Sandwich Islands', 'iso2' => 'GS', 'iso3' => 'SGS', 'capital' => 'King Edward Point', 'population' => 30, 'area_km2' => 3903, 'lat' => -54.4296, 'lon' => -36.5879, 'currency_code' => 'GBP']
            ],
            'Oceania' => [
                ['name' => 'Australia', 'iso2' => 'AU', 'iso3' => 'AUS', 'capital' => 'Canberra', 'population' => 26000000, 'area_km2' => 7692024, 'lat' => -25.2744, 'lon' => 133.7751, 'currency_code' => 'AUD'],
                ['name' => 'New Zealand', 'iso2' => 'NZ', 'iso3' => 'NZL', 'capital' => 'Wellington', 'population' => 5000000, 'area_km2' => 270467, 'lat' => -40.9006, 'lon' => 174.8860, 'currency_code' => 'NZD'],
                ['name' => 'Fiji', 'iso2' => 'FJ', 'iso3' => 'FJI', 'capital' => 'Suva', 'population' => 900000, 'area_km2' => 18272, 'lat' => -16.5788, 'lon' => 179.4144, 'currency_code' => 'FJD'],
                ['name' => 'Papua New Guinea', 'iso2' => 'PG', 'iso3' => 'PNG', 'capital' => 'Port Moresby', 'population' => 9000000, 'area_km2' => 462840, 'lat' => -6.3150, 'lon' => 143.9555, 'currency_code' => 'PGK'],
                ['name' => 'Samoa', 'iso2' => 'WS', 'iso3' => 'WSM', 'capital' => 'Apia', 'population' => 200000, 'area_km2' => 2842, 'lat' => -13.7590, 'lon' => -172.1046, 'currency_code' => 'WST'],
                ['name' => 'Tonga', 'iso2' => 'TO', 'iso3' => 'TON', 'capital' => 'Nuku\'alofa', 'population' => 100000, 'area_km2' => 747, 'lat' => -21.1789, 'lon' => -175.1982, 'currency_code' => 'TOP'],
                ['name' => 'Vanuatu', 'iso2' => 'VU', 'iso3' => 'VUT', 'capital' => 'Port Vila', 'population' => 300000, 'area_km2' => 12189, 'lat' => -15.3767, 'lon' => 166.9592, 'currency_code' => 'VUV'],
                ['name' => 'Solomon Islands', 'iso2' => 'SB', 'iso3' => 'SLB', 'capital' => 'Honiara', 'population' => 700000, 'area_km2' => 28896, 'lat' => -9.6457, 'lon' => 160.1562, 'currency_code' => 'SBD'],
                ['name' => 'Palau', 'iso2' => 'PW', 'iso3' => 'PLW', 'capital' => 'Ngerulmud', 'population' => 18000, 'area_km2' => 459, 'lat' => 7.5150, 'lon' => 134.5825, 'currency_code' => 'USD'],
                ['name' => 'Micronesia', 'iso2' => 'FM', 'iso3' => 'FSM', 'capital' => 'Palikir', 'population' => 115000, 'area_km2' => 702, 'lat' => 7.4256, 'lon' => 150.5508, 'currency_code' => 'USD'],
                ['name' => 'Marshall Islands', 'iso2' => 'MH', 'iso3' => 'MHL', 'capital' => 'Majuro', 'population' => 60000, 'area_km2' => 181, 'lat' => 7.1315, 'lon' => 171.1845, 'currency_code' => 'USD'],
                ['name' => 'Kiribati', 'iso2' => 'KI', 'iso3' => 'KIR', 'capital' => 'Tarawa', 'population' => 120000, 'area_km2' => 811, 'lat' => -3.3704, 'lon' => -168.7340, 'currency_code' => 'AUD'],
                ['name' => 'Nauru', 'iso2' => 'NR', 'iso3' => 'NRU', 'capital' => 'Yaren', 'population' => 10000, 'area_km2' => 21, 'lat' => -0.5228, 'lon' => 166.9315, 'currency_code' => 'AUD'],
                ['name' => 'Tuvalu', 'iso2' => 'TV', 'iso3' => 'TUV', 'capital' => 'Funafuti', 'population' => 12000, 'area_km2' => 26, 'lat' => -7.1095, 'lon' => 177.6493, 'currency_code' => 'AUD'],
                ['name' => 'Cook Islands', 'iso2' => 'CK', 'iso3' => 'COK', 'capital' => 'Avarua', 'population' => 17000, 'area_km2' => 236, 'lat' => -21.2367, 'lon' => -159.7777, 'currency_code' => 'NZD']
            ],
            'Antarctica' => [
                ['name' => 'Antarctica', 'iso2' => 'AQ', 'iso3' => 'ATA', 'capital' => '', 'population' => 1000, 'area_km2' => 14000000, 'lat' => -75.2509, 'lon' => -0.0713, 'currency_code' => 'USD']
            ]
        ];

        $totalCountries = 0;
        $totalContinents = 0;

        foreach ($continentsData as $continent => $countries) {
            $io->section("Processing continent: {$continent}");
            $continentCount = 0;

            foreach ($countries as $countryData) {
                // Check if country already exists
                $existingCountry = $this->countryRepository->findOneBy(['iso2' => $countryData['iso2']]);
                if ($existingCountry) {
                    $io->text("Country {$countryData['name']} already exists, skipping...");
                    continue;
                }

                // Create new country
                $country = new Country();
                $country->setNameEn($countryData['name']);
                $country->setIso2($countryData['iso2']);
                $country->setIso3($countryData['iso3']);
                $country->setContinent($continent);
                $country->setCapital($countryData['capital']);
                $country->setPopulation($countryData['population']);
                $country->setAreaKm2($countryData['area_km2']);
                $country->setLat($countryData['lat']);
                $country->setLon($countryData['lon']);
                $country->setCurrencyCode($countryData['currency_code']);
                
                // Generate slug
                $slug = strtolower(str_replace([' ', '\''], ['-', ''], $countryData['name']));
                $country->setSlug($slug);

                $this->entityManager->persist($country);
                $continentCount++;
                $totalCountries++;

                $io->text("Added: {$countryData['name']} ({$countryData['iso2']})");
            }

            $totalContinents++;
            $io->success("Added {$continentCount} countries to {$continent}");
        }

        $this->entityManager->flush();

        $io->success("Import completed!");
        $io->table(
            ['Metric', 'Count'],
            [
                ['Continents processed', $totalContinents],
                ['Countries added', $totalCountries],
            ]
        );

        return Command::SUCCESS;
    }
}