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

    # ──────────────────────────────────────────────────────────────────────────
    # Alle Kontinente/Länder importieren
    # ──────────────────────────────────────────────────────────────────────────
    def import_all_countries(self):
        """Importiert alle Länder aus allen Kontinenten (25 je Kontinent, ohne Antarktis)"""
        logger.info("Starte Import aller Länder.")

        # DB initialisieren
        overview_type_id = self.setup_database()

        # Antarctica ausschließen, pro Kontinent auf 25 begrenzen
        continents = {k: v[:25] for k, v in COUNTRIES_BY_CONTINENT.items() if k.lower() != 'antarctica'}

        total_countries = sum(len(v) for v in continents.values())
        total_operations = total_countries * len(SUPPORTED_LANGUAGES)
        logger.info(f"Importiere {total_countries} Länder in {len(SUPPORTED_LANGUAGES)} Sprachen (gesamt {total_operations} Operationen)")

        processed = 0
        for continent, countries in continents.items():
            logger.info(f"\n=== Importiere {continent} ({len(countries)} Länder) ===")
            for country_data in countries:
                try:
                    self.import_country_data(country_data, continent, overview_type_id)
                    processed += 1
                    progress = (processed / total_countries) * 100.0
                    logger.info(f"Fortschritt: {processed}/{total_countries} Länder ({progress:.1f}%)")
                except Exception as e:
                    logger.error(f"Fehler beim Import von {country_data.get('name', '?')}: {e}")
                    self.stats['errors'] += 1

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