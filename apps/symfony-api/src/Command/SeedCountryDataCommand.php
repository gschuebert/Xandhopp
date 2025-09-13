<?php

declare(strict_types=1);

namespace App\Command;

use App\Service\CountryService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:seed:country-data',
    description: 'Seed sample country data for testing',
)]
class SeedCountryDataCommand extends Command
{
    public function __construct(
        private CountryService $countryService
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Seeding Country Data');

        // Get or create sources
        $wikipediaSource = $this->countryService->getSourceByKey('wikipedia');
        $restCountriesSource = $this->countryService->getSourceByKey('restcountries');

        if (!$wikipediaSource || !$restCountriesSource) {
            $io->error('Required sources not found. Please run migrations first.');
            return Command::FAILURE;
        }

        // Sample countries data
        $countriesData = [
            [
                'iso2' => 'DE',
                'iso3' => 'DEU',
                'name_en' => 'Germany',
                'name_local' => 'Deutschland',
                'slug' => 'germany',
                'continent' => 'Europe',
                'capital' => 'Berlin',
                'population' => 83200000,
                'area_km2' => '357022.00',
                'lat' => '52.5200',
                'lon' => '13.4050',
                'calling_code' => '+49',
                'currency_code' => 'EUR',
                'languages' => null,
                'flag_svg_url' => 'https://flagcdn.com/de.svg'
            ],
            [
                'iso2' => 'FR',
                'iso3' => 'FRA',
                'name_en' => 'France',
                'name_local' => 'France',
                'slug' => 'france',
                'continent' => 'Europe',
                'capital' => 'Paris',
                'population' => 68000000,
                'area_km2' => '551695.00',
                'lat' => '48.8566',
                'lon' => '2.3522',
                'calling_code' => '+33',
                'currency_code' => 'EUR',
                'languages' => null,
                'flag_svg_url' => 'https://flagcdn.com/fr.svg'
            ],
            [
                'iso2' => 'US',
                'iso3' => 'USA',
                'name_en' => 'United States',
                'name_local' => 'United States',
                'slug' => 'united-states',
                'continent' => 'North America',
                'capital' => 'Washington, D.C.',
                'population' => 331000000,
                'area_km2' => '9833517.00',
                'lat' => '38.9072',
                'lon' => '-77.0369',
                'calling_code' => '+1',
                'currency_code' => 'USD',
                'languages' => null,
                'flag_svg_url' => 'https://flagcdn.com/us.svg'
            ],
            [
                'iso2' => 'JP',
                'iso3' => 'JPN',
                'name_en' => 'Japan',
                'name_local' => '日本',
                'slug' => 'japan',
                'continent' => 'Asia',
                'capital' => 'Tokyo',
                'population' => 125000000,
                'area_km2' => '377975.00',
                'lat' => '35.6762',
                'lon' => '139.6503',
                'calling_code' => '+81',
                'currency_code' => 'JPY',
                'languages' => null,
                'flag_svg_url' => 'https://flagcdn.com/jp.svg'
            ]
        ];

        $io->progressStart(count($countriesData));

        foreach ($countriesData as $countryData) {
            // Check if country already exists
            $existingCountry = $this->countryService->getCountryBySlug($countryData['slug']);
            if ($existingCountry) {
                $io->progressAdvance();
                continue;
            }

            // Create country
            $country = $this->countryService->createCountry($countryData);

            // Add sample text content
            $this->countryService->addCountryText(
                $country,
                'overview',
                "This is a sample overview for {$countryData['name_en']}. " . 
                "It is located in {$countryData['continent']} with its capital at {$countryData['capital']}. " .
                "The country has a population of approximately " . number_format($countryData['population']) . " people.",
                $wikipediaSource,
                'en',
                'https://en.wikipedia.org/wiki/' . str_replace(' ', '_', $countryData['name_en'])
            );

            $this->countryService->addCountryText(
                $country,
                'culture',
                "The culture of {$countryData['name_en']} is rich and diverse. " .
                "This section would contain detailed information about the country's cultural heritage, " .
                "traditions, arts, and social customs.",
                $wikipediaSource,
                'en',
                'https://en.wikipedia.org/wiki/Culture_of_' . str_replace(' ', '_', $countryData['name_en'])
            );

            // Add sample metrics
            $this->countryService->addCountryMetric(
                $country,
                'gdp_usd_current',
                (string) ($countryData['population'] * 50000), // Rough estimate
                'USD',
                2023,
                $restCountriesSource
            );

            $this->countryService->addCountryMetric(
                $country,
                'population_total',
                (string) $countryData['population'],
                'people',
                2023,
                $restCountriesSource
            );

            $io->progressAdvance();
        }

        $io->progressFinish();

        // Refresh materialized views
        $io->section('Refreshing Materialized Views');
        $this->countryService->refreshCountryViews();

        $io->success('Country data seeded successfully!');
        $io->note('You can now test the API endpoints:');
        $io->listing([
            'GET /api/countries - List all countries',
            'GET /api/countries/search?q=germany - Search countries',
            'GET /api/countries/germany - Get country by slug',
            'GET /api/countries/germany/public - Get public country data',
            'GET /api/countries/germany/texts - Get country texts',
            'GET /api/countries/germany/metrics - Get country metrics'
        ]);

        return Command::SUCCESS;
    }
}
