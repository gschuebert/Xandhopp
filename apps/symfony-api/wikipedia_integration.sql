-- Wikidata-ID am Land speichern
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS wikidata_id VARCHAR(32) UNIQUE;

-- optionale Tabelle, um pro Sprache den echten Wikipedia-Titel zu cachen
CREATE TABLE IF NOT EXISTS wikipedia_titles (
  country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (country_id, language_code)
);

-- Content-Typen für linke Spalte ergänzen (falls noch nicht drin)
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
