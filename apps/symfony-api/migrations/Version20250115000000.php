<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Enhanced country information system with sources, text sections, and metrics
 */
final class Version20250115000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Enhanced country information system with sources, text sections, and metrics';
    }

    public function up(Schema $schema): void
    {
        // Drop existing country table if it exists (from previous migration)
        $this->addSql('DROP TABLE IF EXISTS checklist_item CASCADE');
        $this->addSql('DROP TABLE IF EXISTS provider CASCADE');
        $this->addSql('DROP TABLE IF EXISTS residency_program CASCADE');
        $this->addSql('DROP TABLE IF EXISTS country CASCADE');
        $this->addSql('DROP SEQUENCE IF EXISTS country_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE IF EXISTS checklist_item_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE IF EXISTS provider_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE IF EXISTS residency_program_id_seq CASCADE');
        
        // Also drop any existing materialized views and functions
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_country_search CASCADE');
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_country_public CASCADE');
        $this->addSql('DROP FUNCTION IF EXISTS refresh_country_views() CASCADE');
        // Note: No enum type to drop since we're using CHECK constraint

        // Create source table
        $this->addSql('CREATE TABLE source (
            id SERIAL PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            base_url TEXT NOT NULL
        );');

        // Insert default sources
        $this->addSql("INSERT INTO source (key, base_url) VALUES
            ('wikipedia', 'https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}'),
            ('wikidata', 'https://query.wikidata.org/sparql'),
            ('worldbank','https://api.worldbank.org/v2/'),
            ('restcountries','https://restcountries.com/v3.1/');");

        // Create enhanced country table
        $this->addSql('CREATE TABLE country (
            id SERIAL PRIMARY KEY,
            iso2 CHAR(2) UNIQUE NOT NULL,
            iso3 CHAR(3) UNIQUE NOT NULL,
            name_en TEXT NOT NULL,
            name_local TEXT,
            slug TEXT UNIQUE NOT NULL,
            continent TEXT,
            capital TEXT,
            population BIGINT,
            area_km2 NUMERIC,
            lat NUMERIC, 
            lon NUMERIC,
            calling_code TEXT,
            currency_code TEXT,
            languages TEXT[],
            flag_svg_url TEXT,
            updated_at TIMESTAMPTZ DEFAULT now()
        );');

        // Create country_text table
        $this->addSql('CREATE TABLE country_text (
            id BIGSERIAL PRIMARY KEY,
            country_id INTEGER NOT NULL REFERENCES country(id) ON DELETE CASCADE,
            section TEXT NOT NULL CHECK (section IN (\'overview\',\'culture\',\'demography\',\'economy\',\'history\')),
            lang TEXT NOT NULL DEFAULT \'en\',
            content TEXT NOT NULL,
            source_id INTEGER NOT NULL REFERENCES source(id),
            source_url TEXT,
            source_rev TEXT,
            extracted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(country_id, section, lang)
        );');

        // Create country_metric table
        $this->addSql('CREATE TABLE country_metric (
            id BIGSERIAL PRIMARY KEY,
            country_id INTEGER NOT NULL REFERENCES country(id) ON DELETE CASCADE,
            metric_key TEXT NOT NULL,
            metric_value NUMERIC,
            metric_unit TEXT,
            year INTEGER,
            source_id INTEGER REFERENCES source(id),
            source_url TEXT,
            extracted_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(country_id, metric_key, year)
        );');

        // Create indexes for country table
        $this->addSql('CREATE INDEX idx_country_name_gin ON country USING gin (to_tsvector(\'simple\', coalesce(name_en,\'\') || \' \' || coalesce(name_local,\'\')));');
        $this->addSql('CREATE INDEX idx_country_continent ON country (continent);');
        $this->addSql('CREATE INDEX idx_country_slug ON country (slug);');

        // Create materialized view for public country data
        $this->addSql('CREATE MATERIALIZED VIEW mv_country_public AS
            SELECT
                c.slug,
                c.iso2, c.iso3, c.name_en, c.name_local, c.continent, c.capital,
                c.population, c.area_km2, c.lat, c.lon, c.calling_code, c.currency_code, c.languages,
                c.flag_svg_url,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'overview\'  AND ct.lang=\'en\') AS overview_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'culture\'   AND ct.lang=\'en\') AS culture_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'demography\'AND ct.lang=\'en\') AS demography_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'economy\'   AND ct.lang=\'en\') AS economy_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'history\'   AND ct.lang=\'en\') AS history_en,
                now() AS refreshed_at
            FROM country c;');

        $this->addSql('CREATE UNIQUE INDEX mv_country_public_slug ON mv_country_public (slug);');

        // Create search materialized view
        $this->addSql('CREATE MATERIALIZED VIEW mv_country_search AS
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

        $this->addSql('CREATE INDEX mv_country_search_ts ON mv_country_search USING gin(ts);');

        // Create convenience function
        $this->addSql('CREATE OR REPLACE FUNCTION refresh_country_views() RETURNS void LANGUAGE plpgsql AS $$
            BEGIN
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_public;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_search;
            END $$;');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP FUNCTION IF EXISTS refresh_country_views();');
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_country_search;');
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_country_public;');
        $this->addSql('DROP TABLE IF EXISTS country_metric;');
        $this->addSql('DROP TABLE IF EXISTS country_text;');
        $this->addSql('DROP TABLE IF EXISTS country;');
        $this->addSql('DROP TABLE IF EXISTS source;');
    }
}
