<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Country;
use App\Entity\CountryText;
use App\Entity\CountryMetric;
use App\Entity\Source;
use App\Repository\CountryRepository;
use App\Repository\CountryTextRepository;
use App\Repository\CountryMetricRepository;
use App\Repository\SourceRepository;
use Doctrine\ORM\EntityManagerInterface;

class CountryService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private CountryRepository $countryRepository,
        private CountryTextRepository $countryTextRepository,
        private CountryMetricRepository $countryMetricRepository,
        private SourceRepository $sourceRepository
    ) {}

    public function refreshCountryViews(): void
    {
        $this->entityManager->getConnection()->executeStatement('SELECT refresh_country_views();');
    }

    public function getCountryBySlug(string $slug): ?Country
    {
        return $this->countryRepository->findBySlug($slug);
    }

    public function getCountryByIso2(string $iso2): ?Country
    {
        return $this->countryRepository->findByIso2($iso2);
    }

    public function getCountryByIso3(string $iso3): ?Country
    {
        return $this->countryRepository->findByIso3($iso3);
    }

    public function searchCountries(string $query, int $limit = 10): array
    {
        return $this->countryRepository->searchByName($query, $limit);
    }

    public function getCountriesByContinent(string $continent): array
    {
        return $this->countryRepository->findByContinent($continent);
    }

    public function getAllCountries(): array
    {
        return $this->countryRepository->findAllOrderedByName();
    }

    public function getCountryTexts(Country $country, string $lang = 'en'): array
    {
        return $this->countryTextRepository->findByCountry($country->getId(), $lang);
    }

    public function getCountryTextBySection(Country $country, string $section, string $lang = 'en'): ?CountryText
    {
        return $this->countryTextRepository->findByCountryAndSection($country->getId(), $section, $lang);
    }

    public function getCountryMetrics(Country $country): array
    {
        return $this->countryMetricRepository->findByCountry($country->getId());
    }

    public function getCountryMetricByKey(Country $country, string $metricKey, ?int $year = null): array
    {
        return $this->countryMetricRepository->findByCountryAndMetric($country->getId(), $metricKey, $year);
    }

    public function getLatestCountryMetricByKey(Country $country, string $metricKey): ?CountryMetric
    {
        return $this->countryMetricRepository->findLatestByCountryAndMetric($country->getId(), $metricKey);
    }

    public function createCountry(array $data): Country
    {
        $country = new Country();
        $country->setIso2($data['iso2']);
        $country->setIso3($data['iso3']);
        $country->setNameEn($data['name_en']);
        $country->setSlug($data['slug']);
        
        if (isset($data['name_local'])) {
            $country->setNameLocal($data['name_local']);
        }
        if (isset($data['continent'])) {
            $country->setContinent($data['continent']);
        }
        if (isset($data['capital'])) {
            $country->setCapital($data['capital']);
        }
        if (isset($data['population'])) {
            $country->setPopulation($data['population']);
        }
        if (isset($data['area_km2'])) {
            $country->setAreaKm2($data['area_km2']);
        }
        if (isset($data['lat'])) {
            $country->setLat($data['lat']);
        }
        if (isset($data['lon'])) {
            $country->setLon($data['lon']);
        }
        if (isset($data['calling_code'])) {
            $country->setCallingCode($data['calling_code']);
        }
        if (isset($data['currency_code'])) {
            $country->setCurrencyCode($data['currency_code']);
        }
        if (isset($data['languages'])) {
            $country->setLanguages($data['languages']);
        }
        if (isset($data['flag_svg_url'])) {
            $country->setFlagSvgUrl($data['flag_svg_url']);
        }

        $this->countryRepository->save($country, true);
        return $country;
    }

    public function addCountryText(Country $country, string $section, string $content, Source $source, string $lang = 'en', ?string $sourceUrl = null, ?string $sourceRev = null): CountryText
    {
        $countryText = new CountryText();
        $countryText->setCountry($country);
        $countryText->setSection($section);
        $countryText->setLang($lang);
        $countryText->setContent($content);
        $countryText->setSource($source);
        
        if ($sourceUrl) {
            $countryText->setSourceUrl($sourceUrl);
        }
        if ($sourceRev) {
            $countryText->setSourceRev($sourceRev);
        }

        $this->countryTextRepository->save($countryText, true);
        return $countryText;
    }

    public function addCountryMetric(Country $country, string $metricKey, ?string $metricValue, ?string $metricUnit = null, ?int $year = null, ?Source $source = null, ?string $sourceUrl = null): CountryMetric
    {
        $countryMetric = new CountryMetric();
        $countryMetric->setCountry($country);
        $countryMetric->setMetricKey($metricKey);
        $countryMetric->setMetricValue($metricValue);
        $countryMetric->setMetricUnit($metricUnit);
        $countryMetric->setYear($year);
        
        if ($source) {
            $countryMetric->setSource($source);
        }
        if ($sourceUrl) {
            $countryMetric->setSourceUrl($sourceUrl);
        }

        $this->countryMetricRepository->save($countryMetric, true);
        return $countryMetric;
    }

    public function getSourceByKey(string $key): ?Source
    {
        return $this->sourceRepository->findByKey($key);
    }

    public function getPublicCountryData(string $slug): ?array
    {
        $sql = 'SELECT * FROM mv_country_public WHERE slug = :slug';
        $stmt = $this->entityManager->getConnection()->prepare($sql);
        $result = $stmt->executeQuery(['slug' => $slug]);
        
        return $result->fetchAssociative() ?: null;
    }

    public function searchCountriesPublic(string $query, int $limit = 10): array
    {
        $sql = 'SELECT slug, name_en, name_local, continent, capital, flag_svg_url
                FROM country 
                WHERE LOWER(name_en) LIKE LOWER(:query) 
                   OR LOWER(name_local) LIKE LOWER(:query)
                   OR LOWER(capital) LIKE LOWER(:query)
                ORDER BY 
                    CASE 
                        WHEN LOWER(name_en) LIKE LOWER(:query_start) THEN 1
                        WHEN LOWER(name_local) LIKE LOWER(:query_start) THEN 2
                        WHEN LOWER(capital) LIKE LOWER(:query_start) THEN 3
                        ELSE 4
                    END,
                    name_en
                LIMIT :limit';
        
        $stmt = $this->entityManager->getConnection()->prepare($sql);
        $result = $stmt->executeQuery([
            'query' => '%' . $query . '%',
            'query_start' => $query . '%',
            'limit' => $limit
        ]);
        
        return $result->fetchAllAssociative();
    }

    public function getAllContinents(): array
    {
        $sql = 'SELECT DISTINCT continent FROM country WHERE continent IS NOT NULL ORDER BY continent';
        $stmt = $this->entityManager->getConnection()->prepare($sql);
        $result = $stmt->executeQuery();
        
        return array_column($result->fetchAllAssociative(), 'continent');
    }

    /**
     * Get country data in specific language with automatic fallback
     */
    public function getCountryDataByLanguage(string $slug, string $targetLang = 'en'): ?array
    {
        $sql = 'SELECT * FROM get_country_data_by_lang(:slug::text, :lang::text)';
        $stmt = $this->entityManager->getConnection()->prepare($sql);
        $result = $stmt->executeQuery([
            'slug' => $slug,
            'lang' => $targetLang
        ]);
        
        return $result->fetchAssociative() ?: null;
    }
}
