<?php

declare(strict_types=1);

namespace App\Domain\Provider;

interface CountryEnrichmentProvider extends LiveDataProvider
{
    /**
     * Enrich country data with additional information from external API
     * 
     * @param string $iso3 The ISO3 country code
     * @return array|null Enriched data or null if not found
     */
    public function enrichCountry(string $iso3): ?array;
}
