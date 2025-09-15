<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Country;
use App\Service\CountryService;
use App\Service\UsStateService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/countries', name: 'api_countries_', priority: 1)]
class CountryController extends AbstractController
{
    public function __construct(
        private CountryService $countryService,
        private UsStateService $usStateService,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $continent = $request->query->get('continent');
        $search = $request->query->get('search');
        $limit = (int) $request->query->get('limit', 50);

        // Special handling for North America - return US states instead of countries
        if ($continent === 'North America') {
            if ($search) {
                $results = $this->usStateService->searchStatesPublic($search, $limit);
            } else {
                $results = $this->usStateService->getAllStatesPublic();
            }
            
            return new JsonResponse([
                'results' => $results,
                'total' => count($results),
                'type' => 'us_states'
            ]);
        }

        // Regular country handling
        if ($search) {
            $countries = $this->countryService->searchCountries($search, $limit);
        } elseif ($continent) {
            $countries = $this->countryService->getCountriesByContinent($continent);
        } else {
            $countries = $this->countryService->getAllCountries();
        }

        $data = $this->serializer->serialize($countries, 'json', [
            'groups' => ['country:read']
        ]);

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/search', name: 'search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $query = $request->query->get('q');
        $continent = $request->query->get('continent');
        $limit = (int) $request->query->get('limit', 10);

        if (!$query) {
            return new JsonResponse(['error' => 'Query parameter "q" is required'], Response::HTTP_BAD_REQUEST);
        }

        // Special handling for North America - search US states
        if ($continent === 'North America') {
            $results = $this->usStateService->searchStatesPublic($query, $limit);
            return new JsonResponse([
                'query' => $query,
                'continent' => $continent,
                'results' => $results,
                'total' => count($results),
                'type' => 'us_states'
            ]);
        }

        // Regular country search
        $results = $this->countryService->searchCountriesPublic($query, $limit);

        // Filter by continent if specified
        if ($continent) {
            $results = array_filter($results, function($country) use ($continent) {
                return strtolower($country['continent']) === strtolower($continent);
            });
        }

        return new JsonResponse([
            'query' => $query,
            'continent' => $continent,
            'results' => array_values($results),
            'total' => count($results)
        ]);
    }

    #[Route('/autocomplete', name: 'autocomplete', methods: ['GET'])]
    public function autocomplete(Request $request): JsonResponse
    {
        $query = $request->query->get('q', '');
        $continent = $request->query->get('continent');
        $limit = (int) $request->query->get('limit', 8);

        if (strlen($query) < 2) {
            return new JsonResponse(['results' => []]);
        }

        // Special handling for North America - autocomplete US states
        if ($continent === 'North America') {
            $results = $this->usStateService->getAutocompleteStates($query, $limit);
            return new JsonResponse([
                'results' => $results,
                'total' => count($results),
                'type' => 'us_states'
            ]);
        }

        // Regular country autocomplete
        $results = $this->countryService->searchCountriesPublic($query, $limit);

        // Filter by continent if specified
        if ($continent) {
            $results = array_filter($results, function($country) use ($continent) {
                return strtolower($country['continent']) === strtolower($continent);
            });
        }

        // Format for autocomplete
        $formattedResults = array_map(function($country) {
            return [
                'id' => $country['slug'],
                'name' => $country['name_en'],
                'nameLocal' => $country['name_local'],
                'continent' => $country['continent'],
                'capital' => $country['capital'],
                'flag' => $country['flag_svg_url'] ?? null,
                'slug' => $country['slug']
            ];
        }, array_values($results));

        return new JsonResponse([
            'results' => $formattedResults,
            'total' => count($formattedResults)
        ]);
    }

    #[Route('/continents', name: 'continents', methods: ['GET'])]
    public function continents(): JsonResponse
    {
        $continents = $this->countryService->getAllContinents();
        
        return new JsonResponse([
            'continents' => $continents
        ]);
    }

    #[Route('/{slug}', name: 'show', methods: ['GET'])]
    public function show(string $slug): JsonResponse
    {
        $country = $this->countryService->getCountryBySlug($slug);
        
        if (!$country) {
            return new JsonResponse(['error' => 'Country not found'], Response::HTTP_NOT_FOUND);
        }

        $data = $this->serializer->serialize($country, 'json', [
            'groups' => ['country:read']
        ]);

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/{slug}/public', name: 'show_public', methods: ['GET'])]
    public function showPublic(string $slug, Request $request): JsonResponse
    {
        // First try to get as US state (2-letter code)
        if (strlen($slug) === 2) {
            $stateData = $this->usStateService->getStatePublic(strtoupper($slug));
            if ($stateData) {
                return new JsonResponse($stateData);
            }
        }

        // Get language from Accept-Language header or default to 'en'
        $acceptLanguage = $request->headers->get('Accept-Language', 'en');
        $lang = $this->extractLanguageFromHeader($acceptLanguage);
        
        // Use the new multilingual function for countries
        $countryData = $this->countryService->getCountryDataByLanguage($slug, $lang);
        
        if (!$countryData) {
            return new JsonResponse(['error' => 'Country or state not found'], Response::HTTP_NOT_FOUND);
        }

        // Enhance response with live data
        $enhancedData = [
            // Basic country info
            'slug' => $countryData['slug'],
            'iso2' => $countryData['iso2'],
            'iso3' => $countryData['iso3'],
            'name_en' => $countryData['name_en'],
            'name_local' => $countryData['name_local'],
            'continent' => $countryData['continent'],
            'capital' => $countryData['capital'],
            'population' => $countryData['population'],
            'area_km2' => $countryData['area_km2'],
            'lat' => $countryData['lat'],
            'lon' => $countryData['lon'],
            'calling_code' => $countryData['calling_code'],
            'currency_code' => $countryData['currency_code'],
            'languages' => $countryData['languages'],
            'flag_svg_url' => $countryData['flag_svg_url'],
            
            // Text content (language-specific with fallback)
            'overview_en' => $countryData['overview'],
            'culture_en' => $countryData['culture'],
            'demography_en' => $countryData['demography'],
            'economy_en' => $countryData['economy'],
            'history_en' => $countryData['history'],
            
            // Live data
            'advisory' => [
                'level' => $countryData['advisory_level'],
                'updated_at' => $countryData['advisory_updated_at'],
            ],
            'fx' => [
                'EUR_to_local' => $countryData['fx_eur_to_local'],
                'USD_to_local' => $countryData['fx_usd_to_local'],
            ],
            
            'refreshed_at' => $countryData['refreshed_at'],
            'language' => $lang
        ];

        return new JsonResponse($enhancedData);
    }

    #[Route('/{slug}/texts', name: 'texts', methods: ['GET'])]
    public function texts(string $slug, Request $request): JsonResponse
    {
        $country = $this->countryService->getCountryBySlug($slug);
        
        if (!$country) {
            return new JsonResponse(['error' => 'Country not found'], Response::HTTP_NOT_FOUND);
        }

        $lang = $request->query->get('lang', 'en');
        $section = $request->query->get('section');

        if ($section) {
            $text = $this->countryService->getCountryTextBySection($country, $section, $lang);
            $texts = $text ? [$text] : [];
        } else {
            $texts = $this->countryService->getCountryTexts($country, $lang);
        }

        $data = $this->serializer->serialize($texts, 'json', [
            'groups' => ['country_text:read']
        ]);

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/{slug}/metrics', name: 'metrics', methods: ['GET'])]
    public function metrics(string $slug, Request $request): JsonResponse
    {
        $country = $this->countryService->getCountryBySlug($slug);
        
        if (!$country) {
            return new JsonResponse(['error' => 'Country not found'], Response::HTTP_NOT_FOUND);
        }

        $metricKey = $request->query->get('metric_key');
        $year = $request->query->get('year') ? (int) $request->query->get('year') : null;

        if ($metricKey) {
            $metrics = $this->countryService->getCountryMetricByKey($country, $metricKey, $year);
        } else {
            $metrics = $this->countryService->getCountryMetrics($country);
        }

        $data = $this->serializer->serialize($metrics, 'json', [
            'groups' => ['country_metric:read']
        ]);

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/iso2/{iso2}', name: 'show_by_iso2', methods: ['GET'])]
    public function showByIso2(string $iso2): JsonResponse
    {
        $country = $this->countryService->getCountryByIso2($iso2);
        
        if (!$country) {
            return new JsonResponse(['error' => 'Country not found'], Response::HTTP_NOT_FOUND);
        }

        $data = $this->serializer->serialize($country, 'json', [
            'groups' => ['country:read']
        ]);

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/iso3/{iso3}', name: 'show_by_iso3', methods: ['GET'])]
    public function showByIso3(string $iso3): JsonResponse
    {
        $country = $this->countryService->getCountryByIso3($iso3);
        
        if (!$country) {
            return new JsonResponse(['error' => 'Country not found'], Response::HTTP_NOT_FOUND);
        }

        $data = $this->serializer->serialize($country, 'json', [
            'groups' => ['country:read']
        ]);

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/refresh-views', name: 'refresh_views', methods: ['POST'])]
    public function refreshViews(): JsonResponse
    {
        $this->countryService->refreshCountryViews();
        
        return new JsonResponse(['message' => 'Country views refreshed successfully']);
    }

    /**
     * Extract language code from Accept-Language header
     */
    private function extractLanguageFromHeader(string $acceptLanguage): string
    {
        // Parse Accept-Language header (e.g., "de-DE,de;q=0.9,en;q=0.8")
        $languages = [];
        $parts = explode(',', $acceptLanguage);
        
        foreach ($parts as $part) {
            $part = trim($part);
            if (str_contains($part, ';')) {
                [$lang, $q] = explode(';', $part, 2);
                $q = (float) str_replace('q=', '', $q);
            } else {
                $lang = $part;
                $q = 1.0;
            }
            
            $lang = strtolower(trim($lang));
            $languages[$lang] = $q;
        }
        
        // Sort by quality value
        arsort($languages);
        
        // Return the highest quality language, defaulting to 'en'
        $preferredLang = array_key_first($languages);
        
        // Map common language codes to our supported languages
        $langMap = [
            'de' => 'de', 'de-de' => 'de', 'de-at' => 'de', 'de-ch' => 'de',
            'en' => 'en', 'en-us' => 'en', 'en-gb' => 'en', 'en-ca' => 'en',
            'fr' => 'fr', 'fr-fr' => 'fr', 'fr-ca' => 'fr', 'fr-ch' => 'fr',
            'es' => 'es', 'es-es' => 'es', 'es-mx' => 'es', 'es-ar' => 'es',
            'it' => 'it', 'it-it' => 'it', 'it-ch' => 'it',
            'pt' => 'pt', 'pt-pt' => 'pt', 'pt-br' => 'pt',
            'nl' => 'nl', 'nl-nl' => 'nl', 'nl-be' => 'nl',
        ];
        
        // Extract base language (e.g., 'de' from 'de-DE')
        $baseLang = explode('-', $preferredLang)[0];
        
        return $langMap[$preferredLang] ?? $langMap[$baseLang] ?? 'en';
    }
}
