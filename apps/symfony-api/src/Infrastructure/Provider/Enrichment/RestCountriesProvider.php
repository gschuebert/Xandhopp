<?php

declare(strict_types=1);

namespace App\Infrastructure\Provider\Enrichment;

use App\Domain\Provider\CountryEnrichmentProvider;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class RestCountriesProvider implements CountryEnrichmentProvider
{
    public function __construct(private HttpClientInterface $http) {}

    public function key(): string
    {
        return 'restcountries.com';
    }

    public function enrichCountry(string $iso3): ?array
    {
        try {
            $url = "https://restcountries.com/v3.1/alpha/{$iso3}";
            
            usleep(200000); // 200ms delay to be polite
            
            $response = $this->http->request('GET', $url, [
                'headers' => ['User-Agent' => 'xandhopp-live/1.0'],
                'timeout' => 10
            ]);

            if ($response->getStatusCode() !== 200) {
                return null;
            }

            $data = $response->toArray(false);
            
            // REST Countries returns an array, take the first element
            if (empty($data) || !is_array($data[0] ?? null)) {
                return null;
            }

            $country = $data[0];

            return [
                'currency_code' => $this->extractCurrencyCode($country),
                'calling_code' => $this->extractCallingCode($country),
                'languages' => $this->extractLanguages($country),
                'flag_svg_url' => $this->extractFlagUrl($country),
                'population' => $country['population'] ?? null,
                'area' => $country['area'] ?? null,
                'capital' => $country['capital'][0] ?? null,
                'region' => $country['region'] ?? null,
                'subregion' => $country['subregion'] ?? null,
                'timezones' => $country['timezones'] ?? [],
                'raw_data' => $country
            ];
        } catch (\Throwable $e) {
            // Log error but don't throw - enrichment is optional
            error_log("REST Countries enrichment failed for {$iso3}: " . $e->getMessage());
            return null;
        }
    }

    private function extractCurrencyCode(array $country): ?string
    {
        $currencies = $country['currencies'] ?? [];
        if (empty($currencies)) {
            return null;
        }

        // Get the first currency code
        $currencyCode = array_key_first($currencies);
        return $currencyCode ?: null;
    }

    private function extractCallingCode(array $country): ?string
    {
        $callingCodes = $country['idd']['root'] ?? '';
        $suffixes = $country['idd']['suffixes'] ?? [];
        
        if (empty($suffixes)) {
            return null;
        }

        // Take the first calling code
        $suffix = $suffixes[0];
        return $callingCodes . $suffix;
    }

    private function extractLanguages(array $country): ?array
    {
        $languages = $country['languages'] ?? [];
        if (empty($languages)) {
            return null;
        }

        // Return language codes as array
        return array_keys($languages);
    }

    private function extractFlagUrl(array $country): ?string
    {
        $flagUrl = $country['flags']['svg'] ?? null;
        
        // REST Countries provides flag URLs, but we might want to use a different service
        // For now, return the provided URL
        return $flagUrl;
    }
}
