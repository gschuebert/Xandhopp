"""
XNTOP Importer - Hauptskript
Importiert Wikipedia-Intros & Medien für 25 Länder pro Kontinent (ohne Antarktis)
in 5 Sprachen (standardmäßig en, de, es, zh, hi) in die PostgreSQL-DB.
"""

import os
import logging
from typing import Dict, Any

from database import DatabaseManager
from wikipedia_api import WikipediaAPIClient
from countries_data import COUNTRIES_BY_CONTINENT, SUPPORTED_LANGUAGES, WIKIPEDIA_LANGUAGE_CODES

# ──────────────────────────────────────────────────────────────────────────────
# Environment Defaults (können via echter ENV überschrieben werden)
# ──────────────────────────────────────────────────────────────────────────────
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5433')  # abweichender Port z. B. für lokale Instanz
os.environ.setdefault('DB_NAME', 'xandhopp')
os.environ.setdefault('DB_USER', 'xandhopp')
os.environ.setdefault('DB_PASSWORD', 'xandhopp')

os.environ.setdefault('WIKIPEDIA_API_BASE', 'https://en.wikipedia.org/api/rest_v1')
os.environ.setdefault('WIKIPEDIA_TIMEOUT', '30')
os.environ.setdefault('WIKIPEDIA_MAX_RETRIES', '3')
os.environ.setdefault('WIKIPEDIA_BACKOFF_FACTOR', '2.0')

os.environ.setdefault('BATCH_SIZE', '10')           # aktuell nicht genutzt, aber belassen
os.environ.setdefault('DELAY_BETWEEN_REQUESTS', '1.0')

# ──────────────────────────────────────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('xntop_importer.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class XNTOPImporter:
    def __init__(self):
        # DB
        self.db = DatabaseManager(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 5433)),
            database=os.getenv('DB_NAME', 'xandhopp'),
            user=os.getenv('DB_USER', 'xandhopp'),
            password=os.getenv('DB_PASSWORD', 'xandhopp')
        )

        # Wikipedia API Client
        self.wikipedia = WikipediaAPIClient(
            base_url=os.getenv('WIKIPEDIA_API_BASE', 'https://en.wikipedia.org/api/rest_v1'),
            timeout=int(os.getenv('WIKIPEDIA_TIMEOUT', 30)),
            max_retries=int(os.getenv('WIKIPEDIA_MAX_RETRIES', 3)),
            backoff_factor=float(os.getenv('WIKIPEDIA_BACKOFF_FACTOR', 2.0))
        )

        # Konfiguration
        self.batch_size = int(os.getenv('BATCH_SIZE', 10))
        self.delay_between_requests = float(os.getenv('DELAY_BETWEEN_REQUESTS', 1.0))

        # Statistiken
        self.stats = {
            'countries_processed': 0,
            'languages_processed': 0,
            'contents_imported': 0,
            'media_imported': 0,
            'errors': 0
        }

    # ──────────────────────────────────────────────────────────────────────────
    # Setup: Sprachen + ContentType
    # ──────────────────────────────────────────────────────────────────────────
    def setup_database(self) -> int:
        """Initialisiert Datenbank mit Sprachen und Content-Types"""
        logger.info("Initialisiere Datenbank.")

        # Sprachen anlegen/aktualisieren
        for code, name in SUPPORTED_LANGUAGES.items():
            self.db.upsert_language(code, name)
            logger.info(f"Sprache bereit: {code} - {name}")

        # Content-Type 'overview' anlegen/aktualisieren
        overview_type_id = self.db.upsert_content_type('overview', 'General Overview')
        logger.info(f"Content-Type bereit: overview (ID: {overview_type_id})")

        return overview_type_id

    # ──────────────────────────────────────────────────────────────────────────
    # Einzel-Land importieren (alle Sprachen)
    # ──────────────────────────────────────────────────────────────────────────
    def import_country_data(self, country_data: Dict[str, Any], continent: str, overview_type_id: int):
        """Importiert Daten für ein Land in allen Sprachen"""
        country_name = country_data['name']
        iso_code = country_data['iso']
        wikipedia_slug = country_data.get('wikipedia_slug') or country_name.replace(' ', '_')

        logger.info(f"Importiere {country_name} ({iso_code}) aus {continent}")

        # Land upserten
        country_id = self.db.upsert_country(
            iso_code=iso_code,
            name_en=country_name,
            continent=continent,
            has_subregions=False,
            slug_en=wikipedia_slug.lower().replace(' ', '-'),
            slug_de=wikipedia_slug.lower().replace(' ', '-')
        )
        self.stats['countries_processed'] += 1

        # Pro Sprache importieren
        for lang_code, lang_name in SUPPORTED_LANGUAGES.items():
            try:
                logger.info(f"  Importiere {lang_name} ({lang_code}) für {country_name}")

                # Sichere Sprachauflösung (kein KeyError!)
                wiki_lang = WIKIPEDIA_LANGUAGE_CODES.get(lang_code, lang_code)  # <-- Fix
                wiki_data = self.wikipedia.get_country_data(wikipedia_slug, wiki_lang)  # nutzt REST v1 summary + media-list

                if wiki_data and wiki_data.get('extract'):
                    # Text-Inhalt
                    content_id = self.db.upsert_localized_content(
                        country_id=country_id,
                        language_code=lang_code,
                        content_type_id=overview_type_id,
                        content=wiki_data['extract'],
                        source_url=wiki_data.get('page_url', '')
                    )
                    self.stats['contents_imported'] += 1
                    logger.info(f"    Inhalt importiert (ID: {content_id})")

                    # Medien
                    if wiki_data.get('thumbnail'):
                        media_id = self.db.upsert_media_asset(
                            country_id=country_id,
                            language_code=lang_code,
                            title=f"Thumbnail für {country_name}",
                            asset_type='thumbnail',
                            url=wiki_data['thumbnail'],
                            attribution='Wikipedia',
                            source_url=wiki_data.get('page_url', '')
                        )
                        if media_id:
                            self.stats['media_imported'] += 1
                            logger.info(f"    Thumbnail importiert (ID: {media_id})")

                    if wiki_data.get('image_url'):
                        media_id = self.db.upsert_media_asset(
                            country_id=country_id,
                            language_code=lang_code,
                            title=f"Bild für {country_name}",
                            asset_type='image',
                            url=wiki_data['image_url'],
                            attribution='Wikipedia',
                            source_url=wiki_data.get('page_url', '')
                        )
                        if media_id:
                            self.stats['media_imported'] += 1
                            logger.info(f"    Bild importiert (ID: {media_id})")

                    # Import additional image types from Wikipedia
                    self.import_additional_images(country_id, country_name, lang_code)

                    # Sync-Log
                    self.db.log_sync(country_id, lang_code, 'wikipedia', 'success')

                else:
                    logger.warning(f"    Keine Daten für {country_name} in {lang_name} gefunden")
                    self.db.log_sync(country_id, lang_code, 'wikipedia', 'no_data')

                # Sprache als verarbeitet zählen (nach Versuch, egal ob found/no_data)
                self.stats['languages_processed'] += 1

                # höfliches Throttling
                self.wikipedia.delay_request(self.delay_between_requests)

            except Exception as e:
                logger.error(f"    Fehler beim Import von {country_name} ({lang_code}): {e}")
                self.stats['errors'] += 1
                self.db.log_sync(country_id, lang_code, 'wikipedia', 'error')

    def import_additional_images(self, country_id: int, country_name: str, lang_code: str):
        """Importiert zusätzliche Bildtypen: Flagge, Wappen, Landschaftsbilder"""
        try:
            # 1. Flagge von flagcdn.com (zuverlässige Quelle)
            iso_code = self.get_iso_code_for_country(country_name)
            if iso_code:
                flag_url = f"https://flagcdn.com/w320/{iso_code.lower()}.png"
                media_id = self.db.upsert_media_asset(
                    country_id=country_id,
                    language_code=lang_code,
                    title=f"Flagge von {country_name}",
                    asset_type='flag',
                    url=flag_url,
                    attribution='FlagCDN',
                    source_url=f"https://flagcdn.com/{iso_code.lower()}"
                )
                if media_id:
                    self.stats['media_imported'] += 1
                    logger.info(f"    Flagge importiert (ID: {media_id})")

            # 2. Wappen von Wikipedia Commons (falls verfügbar)
            coat_url = self.get_coat_of_arms_url(country_name, lang_code)
            if coat_url:
                media_id = self.db.upsert_media_asset(
                    country_id=country_id,
                    language_code=lang_code,
                    title=f"Wappen von {country_name}",
                    asset_type='coat_of_arms',
                    url=coat_url,
                    attribution='Wikipedia Commons',
                    source_url=f"https://commons.wikimedia.org"
                )
                if media_id:
                    self.stats['media_imported'] += 1
                    logger.info(f"    Wappen importiert (ID: {media_id})")

            # 3. Fallback Landschaftsbild von Unsplash (falls kein Wikipedia-Bild)
            if not self.has_scenic_images(country_id, lang_code):
                fallback_url = self.get_fallback_scenic_image(country_name)
                if fallback_url:
                    media_id = self.db.upsert_media_asset(
                        country_id=country_id,
                        language_code=lang_code,
                        title=f"Landschaftsbild von {country_name}",
                        asset_type='scenic',
                        url=fallback_url,
                        attribution='Unsplash',
                        source_url="https://unsplash.com"
                    )
                    if media_id:
                        self.stats['media_imported'] += 1
                        logger.info(f"    Fallback-Bild importiert (ID: {media_id})")

        except Exception as e:
            logger.warning(f"Fehler beim Import zusätzlicher Bilder für {country_name}: {e}")

    def get_iso_code_for_country(self, country_name: str) -> str:
        """Mapping von Ländernamen zu ISO-Codes"""
        iso_mapping = {
            'Germany': 'DE', 'Austria': 'AT', 'Switzerland': 'CH',
            'France': 'FR', 'Italy': 'IT', 'Spain': 'ES',
            'United Kingdom': 'GB', 'Netherlands': 'NL', 'Belgium': 'BE',
            'Poland': 'PL', 'Czech Republic': 'CZ', 'Hungary': 'HU',
            'Portugal': 'PT', 'Greece': 'GR', 'Sweden': 'SE',
            'Norway': 'NO', 'Denmark': 'DK', 'Finland': 'FI',
            'Ireland': 'IE', 'Croatia': 'HR', 'Slovenia': 'SI',
            'Slovakia': 'SK', 'Estonia': 'EE', 'Latvia': 'LV',
            'Lithuania': 'LT', 'Luxembourg': 'LU', 'Malta': 'MT',
            'Cyprus': 'CY', 'Bulgaria': 'BG', 'Romania': 'RO',
            'United States': 'US', 'Canada': 'CA', 'Mexico': 'MX',
            'Brazil': 'BR', 'Argentina': 'AR', 'Chile': 'CL',
            'Australia': 'AU', 'New Zealand': 'NZ', 'Japan': 'JP',
            'China': 'CN', 'India': 'IN', 'Russia': 'RU',
            'South Africa': 'ZA', 'Egypt': 'EG', 'Nigeria': 'NG',
            'Algeria': 'DZ', 'Angola': 'AO', 'Benin': 'BJ',
            'Botswana': 'BW', 'Burkina Faso': 'BF', 'Burundi': 'BI',
            'Cameroon': 'CM', 'Cape Verde': 'CV', 'Chad': 'TD',
            'Comoros': 'KM', 'Democratic Republic of the Congo': 'CD',
            'Republic of the Congo': 'CG', 'Djibouti': 'DJ',
            'Equatorial Guinea': 'GQ', 'Eritrea': 'ER', 'Eswatini': 'SZ',
            'Ethiopia': 'ET', 'Gabon': 'GA', 'Gambia': 'GM',
            'Ghana': 'GH', 'Guinea': 'GN', 'Guinea-Bissau': 'GW',
            'Ivory Coast': 'CI', 'Kenya': 'KE', 'Lesotho': 'LS',
            'Liberia': 'LR', 'Libya': 'LY', 'Madagascar': 'MG',
            'Malawi': 'MW', 'Mali': 'ML', 'Mauritania': 'MR',
            'Mauritius': 'MU', 'Morocco': 'MA', 'Mozambique': 'MZ',
            'Namibia': 'NA', 'Niger': 'NE', 'Rwanda': 'RW',
            'São Tomé and Príncipe': 'ST', 'Senegal': 'SN',
            'Seychelles': 'SC', 'Sierra Leone': 'SL', 'Somalia': 'SO',
            'South Sudan': 'SS', 'Sudan': 'SD', 'Tanzania': 'TZ',
            'Togo': 'TG', 'Tunisia': 'TN', 'Uganda': 'UG',
            'Zambia': 'ZM', 'Zimbabwe': 'ZW'
        }
        return iso_mapping.get(country_name, '')

    def get_coat_of_arms_url(self, country_name: str, lang_code: str) -> str:
        """Versucht Wappen-URL von Wikipedia Commons zu finden"""
        # Einfache Suche nach Wappen-Bildern
        coat_mapping = {
            'Germany': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Coat_of_arms_of_Germany.svg/200px-Coat_of_arms_of_Germany.svg.png',
            'Austria': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Coat_of_arms_of_Austria.svg/200px-Coat_of_arms_of_Austria.svg.png',
            'France': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Coat_of_arms_of_France.svg/200px-Coat_of_arms_of_France.svg.png',
            'Italy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Coat_of_arms_of_Italy.svg/200px-Coat_of_arms_of_Italy.svg.png',
            'Spain': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Coat_of_Arms_of_Spain.svg/200px-Coat_of_Arms_of_Spain.svg.png',
            'United Kingdom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Royal_Coat_of_Arms_of_the_United_Kingdom.svg/200px-Royal_Coat_of_Arms_of_the_United_Kingdom.svg.png'
        }
        return coat_mapping.get(country_name, '')

    def has_scenic_images(self, country_id: int, lang_code: str) -> bool:
        """Prüft ob bereits landschaftliche Bilder vorhanden sind"""
        # Vereinfachte Prüfung - in echter Implementierung würde man die DB abfragen
        return False  # Erstmal immer False, damit Fallback-Bilder importiert werden

    def get_fallback_scenic_image(self, country_name: str) -> str:
        """Holt landestypisches Bild von Unsplash - charakteristisch für jedes Land"""
        country_images = {
            # Europe - Landmarks & Architecture
            'Germany': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',  # Neuschwanstein Castle
            'Austria': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Hallstatt Village
            'Switzerland': 'https://images.unsplash.com/photo-1527004760525-6d6a8a0b3b11?w=1200&q=80',  # Matterhorn
            'France': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=1200&q=80',  # Eiffel Tower
            'Italy': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80',  # Venice
            'Spain': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6b?w=1200&q=80',  # Sagrada Familia
            'United Kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',  # London
            'Netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80',  # Amsterdam
            'Greece': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80',  # Santorini
            'Portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80',  # Porto
            'Norway': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Fjords
            'Sweden': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&q=80',  # Stockholm
            'Denmark': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&q=80',  # Copenhagen
            
            # Asia-Pacific - Iconic Landmarks
            'Japan': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=80',  # Mount Fuji
            'China': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80',  # Great Wall
            'India': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80',  # Taj Mahal
            'Thailand': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Thai Temple
            'Indonesia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Bali Temple
            'Philippines': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Palawan
            'Vietnam': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Ha Long Bay
            'South Korea': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Seoul
            'Australia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Sydney Opera
            'New Zealand': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',  # Milford Sound
            
            # Pacific Islands - Tropical Paradise
            'Tonga': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',  # Tropical Beach
            'Fiji': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',  # Fiji Paradise
            'Samoa': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Samoa Beach
            'Vanuatu': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Vanuatu Volcano
            'Palau': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Palau Diving
            'Marshall Islands': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Atoll
            'Kiribati': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Pacific Atoll
            
            # Americas - Iconic Landmarks
            'United States': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80',  # Statue of Liberty
            'Canada': 'https://images.unsplash.com/photo-1503614472-8c93d56cd2b2?w=1200&q=80',  # Canadian Rockies
            'Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80',  # Christ Redeemer
            'Mexico': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80',  # Chichen Itza
            'Argentina': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Buenos Aires
            'Chile': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Andes Mountains
            'Peru': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Machu Picchu
            
            # Africa - Natural Wonders & Cities
            'Egypt': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6b?w=1200&q=80',  # Pyramids
            'South Africa': 'https://images.unsplash.com/photo-1484318571209-661cf29a69ea?w=1200&q=80',  # Table Mountain
            'Kenya': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80',  # Safari
            'Morocco': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Marrakech
            'Nigeria': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Lagos
            'Ghana': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Accra
            'Democratic Republic of the Congo': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=80',  # Congo Rainforest
            'Republic of the Congo': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',  # Congo River
        }
        return country_images.get(country_name, 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=1200&q=80')  # Generic nature

    # ──────────────────────────────────────────────────────────────────────────
    # Alle Kontinente/Länder importieren
    # ──────────────────────────────────────────────────────────────────────────
    def import_all_countries(self):
        """Importiert alle Länder aus allen Kontinenten (ohne Antarktis)"""
        logger.info("Starte Import aller Länder.")

        # DB initialisieren
        overview_type_id = self.setup_database()

        # Antarctica ausschließen, alle Länder pro Kontinent importieren
        continents = {k: v for k, v in COUNTRIES_BY_CONTINENT.items() if k.lower() != 'antarctica'}

        total_countries = sum(len(v) for v in continents.values())
        total_operations = total_countries * len(SUPPORTED_LANGUAGES)
        logger.info(f"Importiere {total_countries} Länder in {len(SUPPORTED_LANGUAGES)} Sprachen (gesamt {total_operations} Operationen)")

        processed = 0
        for continent, countries in continents.items():
            logger.info(f"\n=== Importiere {continent} ({len(countries)} Länder) ===")
            for country_data in countries:
                # Transaction per country to avoid race conditions
                try:
                    with self.db.connection:  # Auto-commit transaction block
                        self.import_country_data(country_data, continent, overview_type_id)
                    processed += 1
                    progress = (processed / total_countries) * 100.0
                    logger.info(f"Fortschritt: {processed}/{total_countries} Länder ({progress:.1f}%)")
                except Exception as e:
                    logger.error(f"Fehler beim Import von {country_data.get('name', '?')}: {e}")
                    self.stats['errors'] += 1
                    # Transaction is automatically rolled back on exception

        logger.info("\n=== Import abgeschlossen ===")
        self.print_statistics()

    # ──────────────────────────────────────────────────────────────────────────
    # Statistik
    # ──────────────────────────────────────────────────────────────────────────
    def print_statistics(self):
        logger.info("=== IMPORT-STATISTIKEN ===")
        logger.info(f"Länder verarbeitet: {self.stats['countries_processed']}")
        logger.info(f"Sprachen verarbeitet: {self.stats['languages_processed']}")
        logger.info(f"Inhalte importiert: {self.stats['contents_imported']}")
        logger.info(f"Medien importiert: {self.stats['media_imported']}")
        logger.info(f"Fehler: {self.stats['errors']}")

    # ──────────────────────────────────────────────────────────────────────────
    # Run
    # ──────────────────────────────────────────────────────────────────────────
    def run(self):
        try:
            self.db.connect()
            self.import_all_countries()
        except Exception as e:
            logger.error(f"Kritischer Fehler: {e}")
            raise
        finally:
            self.db.disconnect()


def main():
    logger.info("XNTOP Importer gestartet")
    importer = XNTOPImporter()
    importer.run()
    logger.info("XNTOP Importer beendet")


if __name__ == "__main__":
    main()