<?php

declare(strict_types=1);

namespace App\Service;

use Doctrine\DBAL\Connection;

class LiveDataHealthService
{
    public function __construct(private Connection $db) {}

    /**
     * Check the health of live data systems
     */
    public function checkHealth(): array
    {
        $health = [
            'status' => 'healthy',
            'checks' => [],
            'last_updated' => null,
            'issues' => []
        ];

        // Check FX rates freshness
        $fxCheck = $this->checkFxRatesFreshness();
        $health['checks']['fx_rates'] = $fxCheck;
        if (!$fxCheck['healthy']) {
            $health['status'] = 'degraded';
            $health['issues'][] = 'FX rates are stale';
        }

        // Check travel advisory freshness
        $advisoryCheck = $this->checkTravelAdvisoryFreshness();
        $health['checks']['travel_advisory'] = $advisoryCheck;
        if (!$advisoryCheck['healthy']) {
            $health['status'] = 'degraded';
            $health['issues'][] = 'Travel advisory data is stale';
        }

        // Check materialized views
        $viewsCheck = $this->checkMaterializedViews();
        $health['checks']['materialized_views'] = $viewsCheck;
        if (!$viewsCheck['healthy']) {
            $health['status'] = 'unhealthy';
            $health['issues'][] = 'Materialized views are not up to date';
        }

        // Get last update time
        $health['last_updated'] = $this->getLastUpdateTime();

        return $health;
    }

    private function checkFxRatesFreshness(): array
    {
        try {
            $result = $this->db->fetchAssociative(
                'SELECT MAX(as_of) as latest_fx FROM fx_rate'
            );
            
            $latestFx = $result['latest_fx'] ?? null;
            if (!$latestFx) {
                return ['healthy' => false, 'message' => 'No FX rates found'];
            }

            $latestFxTime = new \DateTimeImmutable($latestFx);
            $now = new \DateTimeImmutable();
            $age = $now->diff($latestFxTime);

            // Consider stale if older than 24 hours
            $isStale = $age->days > 0 || $age->h > 24;

            return [
                'healthy' => !$isStale,
                'latest_update' => $latestFx,
                'age_hours' => $age->days * 24 + $age->h,
                'message' => $isStale ? 'FX rates are stale' : 'FX rates are fresh'
            ];
        } catch (\Throwable $e) {
            return ['healthy' => false, 'message' => 'Error checking FX rates: ' . $e->getMessage()];
        }
    }

    private function checkTravelAdvisoryFreshness(): array
    {
        try {
            $result = $this->db->fetchAssociative(
                'SELECT MAX(updated_at) as latest_advisory FROM travel_advisory'
            );
            
            $latestAdvisory = $result['latest_advisory'] ?? null;
            if (!$latestAdvisory) {
                return ['healthy' => true, 'message' => 'No travel advisory data (optional)'];
            }

            $latestAdvisoryTime = new \DateTimeImmutable($latestAdvisory);
            $now = new \DateTimeImmutable();
            $age = $now->diff($latestAdvisoryTime);

            // Consider stale if older than 7 days (advisory data changes less frequently)
            $isStale = $age->days > 7;

            return [
                'healthy' => !$isStale,
                'latest_update' => $latestAdvisory,
                'age_days' => $age->days,
                'message' => $isStale ? 'Travel advisory data is stale' : 'Travel advisory data is fresh'
            ];
        } catch (\Throwable $e) {
            return ['healthy' => false, 'message' => 'Error checking travel advisory: ' . $e->getMessage()];
        }
    }

    private function checkMaterializedViews(): array
    {
        try {
            // Check if materialized views exist and are accessible
            $views = ['mv_fx_latest', 'mv_country_public', 'mv_country_search'];
            $healthy = true;
            $messages = [];

            foreach ($views as $view) {
                try {
                    $this->db->fetchAssociative("SELECT 1 FROM {$view} LIMIT 1");
                    $messages[] = "{$view}: OK";
                } catch (\Throwable $e) {
                    $healthy = false;
                    $messages[] = "{$view}: ERROR - " . $e->getMessage();
                }
            }

            return [
                'healthy' => $healthy,
                'message' => implode(', ', $messages)
            ];
        } catch (\Throwable $e) {
            return ['healthy' => false, 'message' => 'Error checking materialized views: ' . $e->getMessage()];
        }
    }

    private function getLastUpdateTime(): ?string
    {
        try {
            $result = $this->db->fetchAssociative(
                'SELECT MAX(refreshed_at) as last_refresh FROM mv_country_public'
            );
            return $result['last_refresh'] ?? null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Get statistics about live data
     */
    public function getStats(): array
    {
        try {
            $fxCount = $this->db->fetchOne('SELECT COUNT(*) FROM fx_rate');
            $advisoryCount = $this->db->fetchOne('SELECT COUNT(*) FROM travel_advisory');
            $countryCount = $this->db->fetchOne('SELECT COUNT(*) FROM country');

            return [
                'fx_rates_count' => (int)$fxCount,
                'travel_advisory_count' => (int)$advisoryCount,
                'countries_count' => (int)$countryCount,
                'last_check' => (new \DateTimeImmutable())->format('c')
            ];
        } catch (\Throwable $e) {
            return [
                'error' => $e->getMessage(),
                'last_check' => (new \DateTimeImmutable())->format('c')
            ];
        }
    }
}
