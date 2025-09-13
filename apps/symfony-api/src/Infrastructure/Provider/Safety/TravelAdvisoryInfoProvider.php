<?php

declare(strict_types=1);

namespace App\Infrastructure\Provider\Safety;

use App\Domain\Provider\TravelAdvisoryProvider;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class TravelAdvisoryInfoProvider implements TravelAdvisoryProvider
{
    public function __construct(private HttpClientInterface $http) {}

    public function key(): string
    {
        return 'travel-advisory.info';
    }

    public function fetchAll(): array
    {
        // Use a different travel advisory API that actually works
        try {
            $res = $this->http->request('GET', 'https://www.travel-advisory.info/api', [
                'headers' => ['User-Agent' => 'xandhopp-live/1.0'],
                'verify_peer' => false,
                'verify_host' => false,
                'timeout' => 10
            ])->toArray(false);
        } catch (\Throwable $e) {
            // If the API fails, return empty array - no mock data
            return [];
        }
        
        $out = [];
        foreach (($res['data'] ?? []) as $iso2 => $entry) {
            $score = $entry['advisory']['score'] ?? null;
            $updated = $entry['advisory']['updated'] ?? null;
            $level = null;
            
            if (is_numeric($score)) {
                // map score 0..5 to level 1..5 (tune mapping as needed)
                $level = max(1, min(5, (int)ceil((float)$score)));
            }
            
            $out[$iso2] = [
                'score' => $score !== null ? (float)$score : null,
                'level' => $level,
                'updatedAt' => $updated ? new \DateTimeImmutable($updated) : new \DateTimeImmutable('now'),
                'raw' => $entry,
            ];
        }
        return $out;
    }
}
