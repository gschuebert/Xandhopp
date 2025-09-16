-- ================
-- Demo-Inhalte: Panama
-- ================

-- Sprachen
INSERT INTO languages (code, name) VALUES 
('en', 'English') ON CONFLICT DO NOTHING;
INSERT INTO languages (code, name) VALUES 
('de', 'Deutsch') ON CONFLICT DO NOTHING;

-- Inhaltstypen
INSERT INTO content_types (key, name_en) VALUES
('overview', 'General Overview'),
('visa', 'Visa Information'),
('cost_of_living', 'Cost of Living'),
('economy', 'Economy'),
('culture', 'Culture') 
ON CONFLICT DO NOTHING;

-- Land: Panama
INSERT INTO countries (iso_code, name_en, continent, has_subregions, slug_en, slug_de)
VALUES ('PAN', 'Panama', 'America', FALSE, 'panama', 'panama')
RETURNING id;

-- Wir gehen davon aus, dass Panama die ID = 1 bekommen hat
-- Falls nicht, bitte durch die echte ID ersetzen

-- Inhalte für Panama (EN & DE)
INSERT INTO localized_contents (
    country_id, language_code, content_type_id, content, source_url
) VALUES
-- English
(1, 'en', 1, 'Panama is a country in Central America, famous for the Panama Canal.', 'https://en.wikipedia.org/wiki/Panama'),
(1, 'en', 2, 'Visitors from many countries can enter Panama visa-free for up to 180 days.', 'https://en.wikipedia.org/wiki/Visa_policy_of_Panama'),
(1, 'en', 3, 'Panama has a relatively low cost of living compared to the US.', 'https://en.wikipedia.org/wiki/Panama'),
-- German
(1, 'de', 1, 'Panama ist ein Land in Mittelamerika, bekannt für den Panamakanal.', 'https://de.wikipedia.org/wiki/Panama'),
(1, 'de', 2, 'Für viele Staatsbürger ist die Einreise nach Panama bis zu 180 Tage visafrei möglich.', 'https://de.wikipedia.org/wiki/Visumpflicht'),
(1, 'de', 3, 'Die Lebenshaltungskosten in Panama sind vergleichsweise niedrig.', 'https://de.wikipedia.org/wiki/Panama');

-- Strukturierte Daten (Infobox-Daten)
INSERT INTO country_facts (
    country_id, language_code, key, value, unit
) VALUES
(1, 'en', 'population', '4.3 million', 'people'),
(1, 'en', 'area', '75,420', 'km²'),
(1, 'en', 'gdp_nominal', '76.5 billion', 'USD'),
(1, 'de', 'bevölkerung', '4,3 Millionen', 'Menschen'),
(1, 'de', 'fläche', '75.420', 'km²'),
(1, 'de', 'bip_nominal', '76,5 Milliarden', 'USD');

-- Medien (z. B. Flagge)
INSERT INTO media_assets (
    country_id, language_code, title, type, url, attribution, source_url
) VALUES
(1, 'en', 'Flag of Panama', 'flag', 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Flag_of_Panama.svg', 'Wikipedia Commons', 'https://en.wikipedia.org/wiki/Panama'),
(1, 'de', 'Flagge von Panama', 'flag', 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Flag_of_Panama.svg', 'Wikipedia Commons', 'https://de.wikipedia.org/wiki/Panama');
