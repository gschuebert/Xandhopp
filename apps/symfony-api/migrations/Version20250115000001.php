<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add live data tables for FX rates, travel advisory, and country enrichment
 */
final class Version20250115000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add live data tables for FX rates, travel advisory, and country enrichment';
    }

    public function up(Schema $schema): void
    {
        // 1) FX rates (point-in-time, append-only to allow history)
        $this->addSql('CREATE TABLE IF NOT EXISTS fx_rate (
            id BIGSERIAL PRIMARY KEY,
            base_currency CHAR(3) NOT NULL,
            quote_currency CHAR(3) NOT NULL,
            rate NUMERIC NOT NULL,
            as_of TIMESTAMPTZ NOT NULL,
            source TEXT NOT NULL,
            UNIQUE(base_currency, quote_currency, as_of)
        );');

        $this->addSql('CREATE INDEX IF NOT EXISTS fx_rate_pair_time ON fx_rate (base_currency, quote_currency, as_of DESC);');

        // 2) Latest fx materialized projection for instant reads
        $this->addSql('CREATE MATERIALIZED VIEW IF NOT EXISTS mv_fx_latest AS
            SELECT DISTINCT ON (base_currency, quote_currency)
                base_currency, quote_currency, rate, as_of
            FROM fx_rate
            ORDER BY base_currency, quote_currency, as_of DESC;');

        $this->addSql('CREATE UNIQUE INDEX IF NOT EXISTS mv_fx_latest_pair ON mv_fx_latest (base_currency, quote_currency);');

        // 3) Travel advisory (latest state per country, overwrite on update)
        $this->addSql('CREATE TABLE IF NOT EXISTS travel_advisory (
            country_id INTEGER NOT NULL REFERENCES country(id) ON DELETE CASCADE,
            iso2 CHAR(2) NOT NULL,
            source TEXT NOT NULL,
            score NUMERIC,
            level INTEGER,
            updated_at TIMESTAMPTZ NOT NULL,
            payload JSONB,
            PRIMARY KEY (country_id, source)
        );');

        $this->addSql('CREATE INDEX IF NOT EXISTS idx_travel_advisory_country ON travel_advisory (country_id);');

        // 4) Optional enrichment table for last-seen provider facts
        $this->addSql('CREATE TABLE IF NOT EXISTS country_enrichment (
            country_id INTEGER PRIMARY KEY REFERENCES country(id) ON DELETE CASCADE,
            currency_code CHAR(3),
            calling_code TEXT,
            languages TEXT[],
            flag_svg_url TEXT,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );');

        // 5) Drop and recreate public view with live data
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_country_public CASCADE;');
        
        $this->addSql('CREATE MATERIALIZED VIEW mv_country_public AS
            SELECT
                c.slug,
                c.iso2, c.iso3, c.name_en, c.name_local, c.continent, c.capital,
                c.population, c.area_km2, c.lat, c.lon,
                COALESCE(c.currency_code, ce.currency_code) AS currency_code,
                COALESCE(c.languages, ce.languages) AS languages,
                COALESCE(c.calling_code, ce.calling_code) AS calling_code,
                COALESCE(c.flag_svg_url, ce.flag_svg_url) AS flag_svg_url,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'overview\'  AND ct.lang=\'en\') AS overview_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'culture\'   AND ct.lang=\'en\') AS culture_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'demography\'AND ct.lang=\'en\') AS demography_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'economy\'   AND ct.lang=\'en\') AS economy_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'history\'   AND ct.lang=\'en\') AS history_en,
                ta.level           AS advisory_level,
                ta.updated_at      AS advisory_updated_at,
                -- convenient FX snapshot against EUR and USD using country currency
                (SELECT l.rate FROM mv_fx_latest l WHERE l.base_currency=\'EUR\' AND l.quote_currency = COALESCE(c.currency_code, ce.currency_code)) AS fx_eur_to_local,
                (SELECT l.rate FROM mv_fx_latest l WHERE l.base_currency=\'USD\' AND l.quote_currency = COALESCE(c.currency_code, ce.currency_code)) AS fx_usd_to_local,
                now() AS refreshed_at
            FROM country c
            LEFT JOIN country_enrichment ce ON ce.country_id = c.id
            LEFT JOIN travel_advisory ta ON ta.country_id = c.id AND ta.source=\'travel-advisory.info\';');

        $this->addSql('CREATE UNIQUE INDEX mv_country_public_slug ON mv_country_public (slug);');

        // 6) Recreate search view if it doesn't exist
        $this->addSql('CREATE MATERIALIZED VIEW IF NOT EXISTS mv_country_search AS
            SELECT
                c.slug,
                c.name_en,
                coalesce(c.name_local,\'\') AS name_local,
                coalesce(c.continent,\'\') AS continent,
                coalesce(c.capital,\'\') AS capital,
                setweight(to_tsvector(\'simple\', coalesce(c.name_en,\'\')), \'A\') ||
                setweight(to_tsvector(\'simple\', coalesce(c.name_local,\'\')), \'B\') ||
                setweight(to_tsvector(\'simple\', coalesce(c.continent,\'\')), \'C\') ||
                setweight(to_tsvector(\'simple\', coalesce(c.capital,\'\')), \'C\') AS ts
            FROM country c;');

        $this->addSql('CREATE INDEX IF NOT EXISTS mv_country_search_ts ON mv_country_search USING gin(ts);');

        // 7) Update refresh function
        $this->addSql('CREATE OR REPLACE FUNCTION refresh_country_views() RETURNS void LANGUAGE plpgsql AS $$
            BEGIN
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fx_latest;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_public;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_search;
            END $$;');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP FUNCTION IF EXISTS refresh_country_views();');
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_country_search;');
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_country_public;');
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_fx_latest;');
        $this->addSql('DROP TABLE IF EXISTS country_enrichment;');
        $this->addSql('DROP TABLE IF EXISTS travel_advisory;');
        $this->addSql('DROP TABLE IF EXISTS fx_rate;');
    }
}
