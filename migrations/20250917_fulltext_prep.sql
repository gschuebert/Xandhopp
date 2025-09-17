-- XNTOP: Vorbereitung für Full-Article Import (Wikipedia + Wikidata)
-- Datum: 2025-09-17

BEGIN;

-- 1) Wikidata-ID am Land
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS wikidata_id VARCHAR(32);

-- unique auf wikidata_id (idempotent via DO)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_countries_wikidata_id'
  ) THEN
    ALTER TABLE countries
      ADD CONSTRAINT uq_countries_wikidata_id UNIQUE (wikidata_id);
  END IF;
END$$;

-- 2) Lokalisierte Wikipedia-Titel cachen
CREATE TABLE IF NOT EXISTS wikipedia_titles (
  country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (country_id, language_code)
);

-- 3) Sauberes UPSERT für localized_contents
--    a) generierte Spalte für NULL-sicheren Unique-Key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='localized_contents' AND column_name='subregion_key'
  ) THEN
    ALTER TABLE localized_contents
      ADD COLUMN subregion_key INTEGER
      GENERATED ALWAYS AS (COALESCE(subregion_id, 0)) STORED;
  END IF;
END$$;

--    b) Duplikate bereinigen bevor Constraint hinzugefügt wird
DELETE FROM localized_contents a USING (
  SELECT MIN(id) as id, country_id, COALESCE(subregion_id, 0) as subregion_key, language_code, content_type_id
  FROM localized_contents 
  GROUP BY country_id, COALESCE(subregion_id, 0), language_code, content_type_id
  HAVING COUNT(*) > 1
) b
WHERE a.country_id = b.country_id 
  AND COALESCE(a.subregion_id, 0) = b.subregion_key
  AND a.language_code = b.language_code 
  AND a.content_type_id = b.content_type_id
  AND a.id <> b.id;

--    c) eindeutige Constraint über subregion_key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_localized_content'
  ) THEN
    ALTER TABLE localized_contents
      ADD CONSTRAINT uq_localized_content
      UNIQUE (country_id, subregion_key, language_code, content_type_id);
  END IF;
END$$;

-- 4) Medien-Duplikate vermeiden
CREATE UNIQUE INDEX IF NOT EXISTS ux_media_unique
  ON media_assets (country_id, language_code, url);

-- 5) Sprach-Seeds (für FK-Referenzen)
INSERT INTO languages(code, name) VALUES
  ('en','English'),
  ('de','Deutsch'),
  ('es','Español'),
  ('zh','中文'),
  ('hi','हिन्दी')
ON CONFLICT DO NOTHING;

-- 6) Content-Typen (linkes Menü + Basis)
INSERT INTO content_types(key, name_en) VALUES
('overview','Overview'),
('geography','Geography'),
('demography','Demography'),
('history','History'),
('politics','Politics'),
('economy','Economy'),
('transport','Transport'),
('culture','Culture'),
('see_also','See also'),
('literature','Literature'),
('external_links','External links'),
('notes','Notes'),
('references','References')
ON CONFLICT (key) DO NOTHING;

COMMIT;
