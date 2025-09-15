<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add multilingual support for country information
 */
final class Version20250115000003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add multilingual support for country information with AI translation fallbacks';
    }

    public function up(Schema $schema): void
    {
        // 1) Create smart multilingual view with German fallback
        $this->addSql('CREATE MATERIALIZED VIEW IF NOT EXISTS mv_country_public_multilingual AS
            SELECT
                c.slug,
                c.iso2, c.iso3, c.name_en, c.name_local, c.continent, c.capital,
                c.population, c.area_km2, c.lat, c.lon,
                COALESCE(c.currency_code, ce.currency_code) AS currency_code,
                COALESCE(c.languages, ce.languages) AS languages,
                COALESCE(c.calling_code, ce.calling_code) AS calling_code,
                COALESCE(c.flag_svg_url, ce.flag_svg_url) AS flag_svg_url,
                -- German versions with English fallback
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'overview\' AND ct.lang=\'de\'),
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'overview\' AND ct.lang=\'en\')
                ) AS overview_de,
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'culture\' AND ct.lang=\'de\'),
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'culture\' AND ct.lang=\'en\')
                ) AS culture_de,
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'demography\' AND ct.lang=\'de\'),
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'demography\' AND ct.lang=\'en\')
                ) AS demography_de,
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'economy\' AND ct.lang=\'de\'),
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'economy\' AND ct.lang=\'en\')
                ) AS economy_de,
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'history\' AND ct.lang=\'de\'),
                    (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'history\' AND ct.lang=\'en\')
                ) AS history_de,
                -- English versions (always available)
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'overview\' AND ct.lang=\'en\') AS overview_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'culture\' AND ct.lang=\'en\') AS culture_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'demography\' AND ct.lang=\'en\') AS demography_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'economy\' AND ct.lang=\'en\') AS economy_en,
                (SELECT content FROM country_text ct WHERE ct.country_id=c.id AND ct.section=\'history\' AND ct.lang=\'en\') AS history_en,
                ta.level AS advisory_level,
                ta.updated_at AS advisory_updated_at,
                (SELECT l.rate FROM mv_fx_latest l WHERE l.base_currency=\'EUR\' AND l.quote_currency = COALESCE(c.currency_code, ce.currency_code)) AS fx_eur_to_local,
                (SELECT l.rate FROM mv_fx_latest l WHERE l.base_currency=\'USD\' AND l.quote_currency = COALESCE(c.currency_code, ce.currency_code)) AS fx_usd_to_local,
                now() AS refreshed_at
            FROM country c
            LEFT JOIN country_enrichment ce ON ce.country_id = c.id
            LEFT JOIN travel_advisory ta ON ta.country_id = c.id AND ta.source=\'travel-advisory.info\';');

        $this->addSql('CREATE UNIQUE INDEX IF NOT EXISTS mv_country_public_multilingual_slug ON mv_country_public_multilingual (slug);');

        // 2) Create translation management table
        $this->addSql('CREATE TABLE IF NOT EXISTS translation_job (
            id BIGSERIAL PRIMARY KEY,
            country_id INTEGER NOT NULL REFERENCES country(id) ON DELETE CASCADE,
            section TEXT NOT NULL,
            source_lang CHAR(2) NOT NULL,
            target_lang CHAR(2) NOT NULL,
            source_content TEXT NOT NULL,
            translated_content TEXT,
            translation_method TEXT,
            status TEXT NOT NULL DEFAULT \'pending\',
            error_message TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            completed_at TIMESTAMPTZ
        );');

        $this->addSql('CREATE INDEX IF NOT EXISTS idx_translation_job_country ON translation_job (country_id);');
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_translation_job_status ON translation_job (status);');

        // 3) Create function to get country data by language
        $this->addSql('CREATE OR REPLACE FUNCTION get_country_data_by_lang(
            country_slug TEXT,
            target_lang CHAR(2) DEFAULT \'en\'
        ) RETURNS TABLE (
            slug TEXT, iso2 CHAR(2), iso3 CHAR(3), name_en TEXT, name_local TEXT,
            continent TEXT, capital TEXT, population BIGINT, area_km2 NUMERIC,
            lat NUMERIC, lon NUMERIC, currency_code CHAR(3), languages TEXT[],
            calling_code TEXT, flag_svg_url TEXT, overview TEXT, culture TEXT,
            demography TEXT, economy TEXT, history TEXT, advisory_level INTEGER,
            advisory_updated_at TIMESTAMPTZ, fx_eur_to_local NUMERIC,
            fx_usd_to_local NUMERIC, refreshed_at TIMESTAMPTZ
        ) LANGUAGE plpgsql AS $$
        DECLARE
            country_record RECORD;
        BEGIN
            SELECT * INTO country_record FROM country c
            LEFT JOIN country_enrichment ce ON ce.country_id = c.id
            LEFT JOIN travel_advisory ta ON ta.country_id = c.id AND ta.source=\'travel-advisory.info\'
            WHERE c.slug = country_slug;
            
            IF NOT FOUND THEN RETURN; END IF;
            
            RETURN QUERY SELECT
                country_record.slug, country_record.iso2, country_record.iso3,
                country_record.name_en, country_record.name_local, country_record.continent,
                country_record.capital, country_record.population, country_record.area_km2,
                country_record.lat, country_record.lon,
                COALESCE(country_record.currency_code, country_record.currency_code),
                COALESCE(country_record.languages, country_record.languages),
                COALESCE(country_record.calling_code, country_record.calling_code),
                COALESCE(country_record.flag_svg_url, country_record.flag_svg_url),
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'overview\' AND ct.lang=target_lang),
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'overview\' AND ct.lang=\'en\')
                ),
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'culture\' AND ct.lang=target_lang),
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'culture\' AND ct.lang=\'en\')
                ),
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'demography\' AND ct.lang=target_lang),
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'demography\' AND ct.lang=\'en\')
                ),
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'economy\' AND ct.lang=target_lang),
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'economy\' AND ct.lang=\'en\')
                ),
                COALESCE(
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'history\' AND ct.lang=target_lang),
                    (SELECT content FROM country_text ct WHERE ct.country_id=country_record.id AND ct.section=\'history\' AND ct.lang=\'en\')
                ),
                country_record.level, country_record.updated_at,
                (SELECT l.rate FROM mv_fx_latest l WHERE l.base_currency=\'EUR\' AND l.quote_currency = COALESCE(country_record.currency_code, country_record.currency_code)),
                (SELECT l.rate FROM mv_fx_latest l WHERE l.base_currency=\'USD\' AND l.quote_currency = COALESCE(country_record.currency_code, country_record.currency_code)),
                now();
        END $$;');

        // 4) Update refresh function
        $this->addSql('CREATE OR REPLACE FUNCTION refresh_country_views() RETURNS void LANGUAGE plpgsql AS $$
            BEGIN
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fx_latest;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_public;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_public_multilingual;
                REFRESH MATERIALIZED VIEW CONCURRENTLY mv_country_search;
            END $$;');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP FUNCTION IF EXISTS get_country_data_by_lang(TEXT, CHAR(2));');
        $this->addSql('DROP FUNCTION IF EXISTS refresh_country_views();');
        $this->addSql('DROP TABLE IF EXISTS translation_job;');
        $this->addSql('DROP MATERIALIZED VIEW IF EXISTS mv_country_public_multilingual;');
    }
}