<?php

declare(strict_types=1);

namespace App\Service;

use Doctrine\DBAL\Connection;

class UsStateService
{
    public function __construct(private Connection $db) {}

    /**
     * Get all US states for public API
     */
    public function getAllStatesPublic(): array
    {
        return $this->db->fetchAllAssociative(
            'SELECT * FROM mv_us_state_public ORDER BY name_en ASC'
        );
    }

    /**
     * Get a specific US state by slug (state code)
     */
    public function getStatePublic(string $slug): ?array
    {
        $result = $this->db->fetchAssociative(
            'SELECT * FROM mv_us_state_public WHERE slug = ?',
            [$slug]
        );

        if (!$result) {
            return null;
        }

        // Get metrics for this state
        $metrics = $this->db->fetchAllAssociative(
            'SELECT metric_key, metric_value FROM us_state_metric WHERE state_id = (SELECT id FROM us_state WHERE state_code = ?)',
            [$slug]
        );

        // Convert metrics to associative array
        $metricsArray = [];
        foreach ($metrics as $metric) {
            $metricsArray[$metric['metric_key']] = $metric['metric_value'];
        }

        $result['metrics'] = $metricsArray;

        return $result;
    }

    /**
     * Search US states
     */
    public function searchStatesPublic(string $query, int $limit = 10): array
    {
        return $this->db->fetchAllAssociative(
            'SELECT slug, name_en, name_local, continent, capital, flag_svg_url 
             FROM mv_us_state_public 
             WHERE name_en ILIKE ? OR name_local ILIKE ? OR capital ILIKE ?
             ORDER BY name_en ASC 
             LIMIT ?',
            ["%{$query}%", "%{$query}%", "%{$query}%", $limit]
        );
    }

    /**
     * Get autocomplete suggestions for US states
     */
    public function getAutocompleteStates(string $query, int $limit = 8): array
    {
        $results = $this->searchStatesPublic($query, $limit);
        
        return array_map(function ($state) {
            return [
                'id' => $state['slug'],
                'name' => $state['name_en'],
                'nameLocal' => $state['name_local'],
                'continent' => $state['continent'],
                'capital' => $state['capital'],
                'flag' => $state['flag_svg_url'],
                'slug' => $state['slug']
            ];
        }, $results);
    }

    /**
     * Refresh US state materialized views
     */
    public function refreshViews(): void
    {
        $this->db->executeStatement('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_us_state_public');
        $this->db->executeStatement('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_us_state_search');
    }
}
