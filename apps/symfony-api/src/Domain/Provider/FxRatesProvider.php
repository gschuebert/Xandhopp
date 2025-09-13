<?php

declare(strict_types=1);

namespace App\Domain\Provider;

interface FxRatesProvider extends LiveDataProvider
{
    /**
     * Fetch latest rates for given base currencies to a list of quote currencies.
     * Should return [ [base=>"EUR", quote=>"USD", rate=>1.07, as_of=>DateTimeImmutable], ... ]
     */
    public function fetchLatest(array $bases, array $quotes): array;
}
