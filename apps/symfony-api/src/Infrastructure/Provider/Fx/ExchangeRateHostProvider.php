<?php

declare(strict_types=1);

namespace App\Infrastructure\Provider\Fx;

use App\Domain\Provider\FxRatesProvider;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ExchangeRateHostProvider implements FxRatesProvider
{
    public function __construct(private HttpClientInterface $http) {}

    public function key(): string
    {
        return 'exchangerate.host';
    }

    public function fetchLatest(array $bases, array $quotes): array
    {
        $out = [];
        foreach ($bases as $base) {
            $url = sprintf('https://api.exchangerate.host/latest?base=%s&symbols=%s', $base, implode(',', $quotes));
            usleep(150000); // 150ms delay between requests
            
            $res = $this->http->request('GET', $url, [
                'headers' => ['User-Agent' => 'xandhopp-live/1.0']
            ])->toArray(false);
            
            $ts = isset($res['date']) ? new \DateTimeImmutable($res['date'] . ' 12:00:00Z') : new \DateTimeImmutable('now');
            
            foreach (($res['rates'] ?? []) as $q => $rate) {
                if (!is_numeric($rate)) {
                    continue;
                }
                $out[] = [
                    'base' => $base,
                    'quote' => $q,
                    'rate' => (float)$rate,
                    'as_of' => $ts
                ];
            }
        }
        return $out;
    }
}
