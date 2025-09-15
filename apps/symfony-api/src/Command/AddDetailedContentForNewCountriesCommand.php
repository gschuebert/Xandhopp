<?php

namespace App\Command;

use App\Entity\Country;
use App\Entity\CountryText;
use App\Entity\CountryMetric;
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
    name: 'app:add-detailed-content-new-countries',
    description: 'Add detailed content (overview, culture, metrics) for all new countries',
)]
class AddDetailedContentForNewCountriesCommand extends Command
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

        $io->title('Adding Detailed Content for New Countries');

        // Get all countries that don't have content yet
        $countries = $this->countryRepository->createQueryBuilder('c')
            ->leftJoin('c.countryTexts', 'ct')
            ->where('ct.id IS NULL')
            ->getQuery()
            ->getResult();

        $io->text(sprintf('Found %d countries without content', count($countries)));

        $processed = 0;
        foreach ($countries as $country) {
            $io->text("Processing: {$country->getNameEn()} ({$country->getIso2()})");
            
            // Add overview content
            $this->addOverviewContent($country, $source);
            
            // Add culture content
            $this->addCultureContent($country, $source);
            
            // Add basic metrics
            $this->addBasicMetrics($country, $source);
            
            $processed++;
        }

        $this->entityManager->flush();

        $io->success("Added detailed content for {$processed} countries!");

        return Command::SUCCESS;
    }

    private function addOverviewContent(Country $country, Source $source): void
    {
        $overview = $this->generateOverviewContent($country);
        
        $countryText = new CountryText();
        $countryText->setCountry($country);
        $countryText->setSource($source);
        $countryText->setSection('overview');
        $countryText->setLang('en');
        $countryText->setContent($overview);
        
        $this->entityManager->persist($countryText);
    }

    private function addCultureContent(Country $country, Source $source): void
    {
        $culture = $this->generateCultureContent($country);
        
        $countryText = new CountryText();
        $countryText->setCountry($country);
        $countryText->setSource($source);
        $countryText->setSection('culture');
        $countryText->setLang('en');
        $countryText->setContent($culture);
        
        $this->entityManager->persist($countryText);
    }

    private function addBasicMetrics(Country $country, Source $source): void
    {
        $metrics = $this->getBasicMetrics($country);
        
        foreach ($metrics as $metricKey => $metricValue) {
            $countryMetric = new CountryMetric();
            $countryMetric->setCountry($country);
            $countryMetric->setSource($source);
            $countryMetric->setMetricKey($metricKey);
            $countryMetric->setMetricValue($metricValue);
            
            $this->entityManager->persist($countryMetric);
        }
    }

    private function generateOverviewContent(Country $country): string
    {
        $name = $country->getNameEn();
        $capital = $country->getCapital();
        $population = $country->getPopulation();
        $area = $country->getAreaKm2();
        $continent = $country->getContinent();
        $currency = $country->getCurrencyCode();

        $populationFormatted = is_numeric($population) ? number_format($population) : 'N/A';
        $areaFormatted = is_numeric($area) ? number_format($area) : 'N/A';

        return "{$name} is a country located in {$continent}. " .
               ($capital ? "The capital city is {$capital}. " : "") .
               "With a population of approximately {$populationFormatted} people, " .
               "{$name} covers an area of {$areaFormatted} square kilometers. " .
               ($currency ? "The official currency is {$currency}. " : "") .
               "This diverse nation offers unique opportunities for expatriates seeking new experiences and career prospects. " .
               "The country's strategic location and growing economy make it an attractive destination for international professionals and entrepreneurs.";
    }

    private function generateCultureContent(Country $country): string
    {
        $name = $country->getNameEn();
        $continent = $country->getContinent();

        $cultureTemplates = [
            'Africa' => "{$name} boasts a rich cultural heritage with diverse traditions, languages, and customs. The country is known for its vibrant music, traditional arts, and warm hospitality. Local festivals and celebrations showcase the unique cultural identity of the region. The cuisine reflects the country's agricultural abundance and traditional cooking methods.",
            'South America' => "{$name} is characterized by its passionate culture, rich history, and diverse traditions. The country is famous for its music, dance, and artistic expressions. Local festivals and cultural events provide insight into the nation's heritage. The cuisine combines indigenous ingredients with colonial influences, creating unique flavors.",
            'Oceania' => "{$name} offers a unique cultural experience blending traditional Pacific Island heritage with modern influences. The country is known for its friendly people, traditional crafts, and connection to nature. Cultural practices and ceremonies maintain strong ties to the land and sea. The cuisine features fresh local ingredients and traditional cooking methods.",
            'Antarctica' => "{$name} represents one of the most unique environments on Earth. While not a traditional country for permanent settlement, it serves as a base for scientific research and exploration. The extreme conditions and pristine environment make it a place of international cooperation and scientific discovery.",
            'default' => "{$name} has a rich cultural heritage with unique traditions and customs. The country offers diverse cultural experiences, from traditional arts to modern expressions. Local festivals and celebrations provide insight into the nation's identity. The cuisine reflects the country's history and natural resources."
        ];

        return $cultureTemplates[$continent] ?? $cultureTemplates['default'];
    }

    private function getBasicMetrics(Country $country): array
    {
        $metrics = [];
        
        // Add only numeric metrics that can be stored as DECIMAL
        if ($country->getPopulation()) {
            $metrics['population'] = (string) $country->getPopulation();
        }
        
        if ($country->getAreaKm2()) {
            $metrics['area_km2'] = (string) $country->getAreaKm2();
        }
        
        if ($country->getLat()) {
            $metrics['latitude'] = (string) $country->getLat();
        }
        
        if ($country->getLon()) {
            $metrics['longitude'] = (string) $country->getLon();
        }
        
        return $metrics;
    }
}
