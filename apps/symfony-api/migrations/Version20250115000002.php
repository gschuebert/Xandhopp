<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250115000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add US states support as special case for North America';
    }

    public function up(Schema $schema): void
    {
        // Create US states table
        $this->addSql('CREATE TABLE IF NOT EXISTS us_state (
            id SERIAL PRIMARY KEY,
            state_code CHAR(2) NOT NULL UNIQUE,
            name_en VARCHAR(100) NOT NULL,
            name_local VARCHAR(100),
            capital VARCHAR(100),
            population INTEGER,
            area_km2 NUMERIC(10,2),
            lat NUMERIC(10,6),
            lon NUMERIC(10,6),
            timezone VARCHAR(50),
            established_date DATE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )');

        // Create US state text table for content
        $this->addSql('CREATE TABLE IF NOT EXISTS us_state_text (
            id SERIAL PRIMARY KEY,
            state_id INTEGER NOT NULL REFERENCES us_state(id) ON DELETE CASCADE,
            section TEXT NOT NULL CHECK (section IN (\'overview\', \'culture\', \'demography\', \'economy\', \'history\')),
            lang CHAR(2) NOT NULL DEFAULT \'en\',
            content TEXT NOT NULL,
            source_id INTEGER NOT NULL REFERENCES source(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(state_id, section, lang)
        )');

        // Create US state metrics table
        $this->addSql('CREATE TABLE IF NOT EXISTS us_state_metric (
            id SERIAL PRIMARY KEY,
            state_id INTEGER NOT NULL REFERENCES us_state(id) ON DELETE CASCADE,
            metric_key VARCHAR(100) NOT NULL,
            metric_value NUMERIC(15,4),
            metric_unit VARCHAR(20),
            source_id INTEGER NOT NULL REFERENCES source(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(state_id, metric_key)
        )');

        // Create indexes
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_us_state_code ON us_state (state_code)');
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_us_state_name ON us_state (name_en)');
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_us_state_text_state ON us_state_text (state_id)');
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_us_state_text_section ON us_state_text (section)');
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_us_state_metric_state ON us_state_metric (state_id)');

        // Create materialized view for US states public data
        $this->addSql('CREATE MATERIALIZED VIEW IF NOT EXISTS mv_us_state_public AS
            SELECT 
                s.state_code as slug,
                s.state_code,
                s.name_en,
                s.name_local,
                \'North America\' as continent,
                s.capital,
                s.population,
                s.area_km2,
                s.lat,
                s.lon,
                \'USD\' as currency_code,
                \'{"eng"}\' as languages,
                \'+1\' as calling_code,
                CONCAT(\'https://flagcdn.com/us-\', LOWER(s.state_code), \'.svg\') as flag_svg_url,
                (SELECT content FROM us_state_text st WHERE st.state_id=s.id AND st.section=\'overview\' AND st.lang=\'en\') AS overview_en,
                (SELECT content FROM us_state_text st WHERE st.state_id=s.id AND st.section=\'culture\' AND st.lang=\'en\') AS culture_en,
                (SELECT content FROM us_state_text st WHERE st.state_id=s.id AND st.section=\'demography\' AND st.lang=\'en\') AS demography_en,
                (SELECT content FROM us_state_text st WHERE st.state_id=s.id AND st.section=\'economy\' AND st.lang=\'en\') AS economy_en,
                (SELECT content FROM us_state_text st WHERE st.state_id=s.id AND st.section=\'history\' AND st.lang=\'en\') AS history_en,
                NULL as advisory_level,
                NULL as advisory_updated_at,
                NULL as fx_eur_to_local,
                NULL as fx_usd_to_local,
                now() AS refreshed_at
            FROM us_state s');

        $this->addSql('CREATE UNIQUE INDEX IF NOT EXISTS mv_us_state_public_slug ON mv_us_state_public (slug)');

        // Create search view for US states
        $this->addSql('CREATE MATERIALIZED VIEW IF NOT EXISTS mv_us_state_search AS
            SELECT 
                s.state_code as slug,
                s.name_en,
                COALESCE(s.name_local, \'\') AS name_local,
                \'North America\' as continent,
                COALESCE(s.capital, \'\') AS capital,
                setweight(to_tsvector(\'simple\', COALESCE(s.name_en,\'\')), \'A\') ||
                setweight(to_tsvector(\'simple\', COALESCE(s.name_local,\'\')), \'B\') ||
                setweight(to_tsvector(\'simple\', \'North America\'), \'C\') ||
                setweight(to_tsvector(\'simple\', COALESCE(s.capital,\'\')), \'C\') AS ts
            FROM us_state s');

        $this->addSql('CREATE INDEX IF NOT EXISTS mv_us_state_search_ts ON mv_us_state_search USING gin(ts)');
        $this->addSql('CREATE UNIQUE INDEX IF NOT EXISTS mv_us_state_search_slug ON mv_us_state_search (slug)');

        // Update refresh function to include US states
        $this->addSql('CREATE OR REPLACE FUNCTION refresh_country_views() RETURNS void LANGUAGE plpgsql AS $$
            BEGIN
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fx_latest;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_public;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_search;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_us_state_public;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_us_state_search;
            END $$;');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_us_state_search CASCADE');
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_us_state_public CASCADE');
        $this->addSql('DROP TABLE IF EXISTS us_state_metric CASCADE');
        $this->addSql('DROP TABLE IF EXISTS us_state_text CASCADE');
        $this->addSql('DROP TABLE IF EXISTS us_state CASCADE');
        
        // Restore original refresh function
        $this->addSql('CREATE OR REPLACE FUNCTION refresh_country_views() RETURNS void LANGUAGE plpgsql AS $$
            BEGIN
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fx_latest;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_public;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_search;
            END $$;');
    }
}
