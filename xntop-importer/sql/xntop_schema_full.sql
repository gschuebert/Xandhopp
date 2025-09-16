-- ========================================
-- XNTOP - Vollständiges PostgreSQL Schema
-- Version 1.0 – Erstellt am: 15.09.2025
-- ========================================

-- =====================
-- BASIS-TABELLEN
-- =====================

-- Länder
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    iso_code VARCHAR(3) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    continent VARCHAR(50),
    has_subregions BOOLEAN DEFAULT FALSE,
    slug_en VARCHAR(255),
    slug_de VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subregionen (z. B. US-Bundesstaaten)
CREATE TABLE country_subregions (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    name_en VARCHAR(255) NOT NULL,
    code VARCHAR(10),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sprachen
CREATE TABLE languages (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Inhaltstypen (z. B. Visa, Geschichte, Kultur)
CREATE TABLE content_types (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL
);

-- =====================
-- INHALTS-TABELLEN
-- =====================

-- Mehrsprachige Inhalte (z. B. Fließtexte)
CREATE TABLE localized_contents (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    subregion_id INTEGER REFERENCES country_subregions(id) ON DELETE CASCADE,
    language_code VARCHAR(10) REFERENCES languages(code),
    content_type_id INTEGER REFERENCES content_types(id),
    content TEXT,
    source_url TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_id, subregion_id, language_code, content_type_id)
);

-- Strukturierte Daten (z. B. Infobox)
CREATE TABLE country_facts (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    language_code VARCHAR(10) REFERENCES languages(code),
    key VARCHAR(100),
    value TEXT,
    unit VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_id, language_code, key)
);

-- Medien (z. B. Flagge, Karte, Bild)
CREATE TABLE media_assets (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    language_code VARCHAR(10) REFERENCES languages(code),
    title TEXT,
    type VARCHAR(50),
    url TEXT,
    attribution TEXT,
    source_url TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sync-Logs (für Wikipedia-Import etc.)
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    language_code VARCHAR(10) REFERENCES languages(code),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source TEXT,
    status VARCHAR(50)
);

-- =====================
-- VIEWS
-- =====================

-- Übersicht über alle Inhalte (Land, Sprache, Typ)
CREATE VIEW vw_country_content_overview AS
SELECT 
    c.id AS country_id,
    c.name_en AS country_name,
    l.code AS language,
    ct.key AS content_key,
    ct.name_en AS content_type,
    lc.content,
    lc.updated_at
FROM countries c
JOIN localized_contents lc ON lc.country_id = c.id
JOIN languages l ON l.code = lc.language_code
JOIN content_types ct ON ct.id = lc.content_type_id;

-- =====================
-- INDEXE FÜR PERFORMANCE
-- =====================

CREATE INDEX idx_country_slug_en ON countries(slug_en);
CREATE INDEX idx_country_slug_de ON countries(slug_de);
CREATE INDEX idx_localized_lang_country ON localized_contents(language_code, country_id);
CREATE INDEX idx_facts_country_key_lang ON country_facts(country_id, key, language_code);
