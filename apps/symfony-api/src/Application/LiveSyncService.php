<?php

declare(strict_types=1);

namespace App\Application;

use App\Domain\Provider\FxRatesProvider;
use App\Domain\Provider\TravelAdvisoryProvider;
use App\Domain\Provider\CountryEnrichmentProvider;
use Doctrine\DBAL\Connection;

class LiveSyncService
{
    public function __construct(
        private Connection $db,
        private FxRatesProvider $fxPrimary,
        private FxRatesProvider $fxFallback,
        private TravelAdvisoryProvider $advisory,
        private CountryEnrichmentProvider $enrichment
    ) {}

    /** @param array{country?:string, providers?:string[], lang?:string} $opts */
    public function run(array $opts = []): array
    {
        $summary = ['fx' => 0, 'advisory' => 0, 'enrichment' => 0];
        $providers = $opts['providers'] ?? ['fx', 'advisory', 'enrichment'];

        // 1) Resolve countries and quote currencies
        $countries = $this->db->fetchAllAssociative('SELECT id, iso2, iso3, currency_code FROM country');
        $quotes = array_values(array_unique(array_filter(array_map(fn($c) => $c['currency_code'] ?: null, $countries))));
        if (empty($quotes)) {
            $quotes = ['USD', 'EUR'];
        }

        // 2) FX: try primary, fallback on failure
        if (in_array('fx', $providers)) {
            $bases = ['EUR', 'USD'];
            try {
                $fx = $this->fxPrimary->fetchLatest($bases, $quotes);
            } catch (\Throwable $e) {
                $fx = $this->fxFallback->fetchLatest($bases, $quotes);
            }

            foreach ($fx as $row) {
                $this->db->executeStatement(
                    'INSERT INTO fx_rate (base_currency, quote_currency, rate, as_of, source) VALUES (?,?,?,?,?)
                     ON CONFLICT (base_currency, quote_currency, as_of) DO NOTHING',
                    [$row['base'], $row['quote'], $row['rate'], $row['as_of']->format('c'), $this->fxPrimary->key()]
                );
                $summary['fx']++;
            }
        }

        // 3) Travel advisory by ISO2
        if (in_array('advisory', $providers)) {
            $mapIso2ToId = [];
            foreach ($countries as $c) {
                $mapIso2ToId[strtoupper($c['iso2'])] = (int)$c['id'];
            }
            
            try {
                $adv = $this->advisory->fetchAll();
                foreach ($adv as $iso2 => $v) {
                    if (!isset($mapIso2ToId[$iso2])) {
                        continue;
                    }
                    $cid = $mapIso2ToId[$iso2];
                    $this->db->executeStatement(
                        'INSERT INTO travel_advisory (country_id, iso2, source, score, level, updated_at, payload)
                         VALUES (:cid, :iso2, :src, :score, :level, :upd, :payload)
                         ON CONFLICT (country_id, source) DO UPDATE SET
                           score = EXCLUDED.score, level = EXCLUDED.level, updated_at = EXCLUDED.updated_at, payload = EXCLUDED.payload',
                        [
                            'cid' => $cid,
                            'iso2' => $iso2,
                            'src' => $this->advisory->key(),
                            'score' => $v['score'],
                            'level' => $v['level'],
                            'upd' => $v['updatedAt']->format('c'),
                            'payload' => json_encode($v['raw'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        ]
                    );
                    $summary['advisory']++;
                }
            } catch (\Throwable $e) {
                // Log error but continue with other providers
                error_log('Travel advisory fetch failed: ' . $e->getMessage());
            }
        }

        // 4) Country enrichment (optional)
        if (in_array('enrichment', $providers)) {
            foreach ($countries as $country) {
                if (empty($country['iso3'])) {
                    continue;
                }

                try {
                    $enrichedData = $this->enrichment->enrichCountry($country['iso3']);
                    if ($enrichedData) {
                        $this->db->executeStatement(
                            'INSERT INTO country_enrichment (country_id, currency_code, calling_code, languages, flag_svg_url, updated_at)
                             VALUES (:cid, :currency, :calling, :languages, :flag, :updated)
                             ON CONFLICT (country_id) DO UPDATE SET
                               currency_code = EXCLUDED.currency_code,
                               calling_code = EXCLUDED.calling_code,
                               languages = EXCLUDED.languages,
                               flag_svg_url = EXCLUDED.flag_svg_url,
                               updated_at = EXCLUDED.updated_at',
                            [
                                'cid' => (int)$country['id'],
                                'currency' => $enrichedData['currency_code'],
                                'calling' => $enrichedData['calling_code'],
                                'languages' => $enrichedData['languages'] ? '{' . implode(',', array_map(fn($lang) => '"' . $lang . '"', $enrichedData['languages'])) . '}' : null,
                                'flag' => $enrichedData['flag_svg_url'],
                                'updated' => (new \DateTimeImmutable())->format('c'),
                            ]
                        );
                        $summary['enrichment']++;
                    }
                } catch (\Throwable $e) {
                    // Log error but continue with other countries
                    error_log('Country enrichment failed for ' . $country['iso3'] . ': ' . $e->getMessage());
                }
            }
        }

        // 5) Refresh materialized views
        $this->db->executeStatement('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fx_latest');
        $this->db->executeStatement('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_public');

        return $summary;
    }
}
