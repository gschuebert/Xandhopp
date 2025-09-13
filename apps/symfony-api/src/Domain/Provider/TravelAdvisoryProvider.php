<?php

declare(strict_types=1);

namespace App\Domain\Provider;

interface TravelAdvisoryProvider extends LiveDataProvider
{
    /** Returns [iso2=>[score=>float, level=>int, updatedAt=>DateTimeImmutable, raw=>array], ...] */
    public function fetchAll(): array;
}
