<?php

declare(strict_types=1);

namespace App\Domain\Provider;

interface LiveDataProvider
{
    /** Return a unique provider key, e.g. 'exchangerate.host' */
    public function key(): string;
}
