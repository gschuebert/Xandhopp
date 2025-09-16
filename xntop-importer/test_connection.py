"""
Test-Skript für Datenbankverbindung und Wikipedia API
"""

import os
import logging
from database import DatabaseManager
from wikipedia_api import WikipediaAPIClient

# Umgebungsvariablen direkt setzen (ohne dotenv)
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5433')
os.environ.setdefault('DB_NAME', 'xandhopp')
os.environ.setdefault('DB_USER', 'xandhopp')
os.environ.setdefault('DB_PASSWORD', 'xandhopp')

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_connection():
    """Testet Datenbankverbindung"""
    logger.info("Teste Datenbankverbindung...")
    
    try:
        db = DatabaseManager(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 5433)),
            database=os.getenv('DB_NAME', 'xandhopp'),
            user=os.getenv('DB_USER', 'xandhopp'),
            password=os.getenv('DB_PASSWORD', 'xandhopp')
        )
        
        db.connect()
        
        # Teste Tabellen
        tables = db.execute_query("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('countries', 'languages', 'content_types', 'localized_contents')
            ORDER BY table_name
        """)
        
        logger.info(f"✅ Datenbankverbindung erfolgreich")
        logger.info(f"Gefundene Tabellen: {[t['table_name'] for t in tables]}")
        
        db.disconnect()
        return True
        
    except Exception as e:
        logger.error(f"❌ Datenbankverbindung fehlgeschlagen: {e}")
        return False

def test_wikipedia_api():
    """Testet Wikipedia API"""
    logger.info("Teste Wikipedia API...")
    
    try:
        api = WikipediaAPIClient("https://en.wikipedia.org/api/rest_v1")
        
        # Teste mit Deutschland
        data = api.get_country_data("Germany", "en")
        
        if data:
            logger.info(f"✅ Wikipedia API erfolgreich")
            logger.info(f"Titel: {data.get('title', 'N/A')}")
            logger.info(f"Extract-Länge: {len(data.get('extract', ''))} Zeichen")
            if data.get('thumbnail'):
                logger.info(f"Thumbnail: {data['thumbnail']}")
            logger.info(f"Verfügbare Felder: {list(data.keys())}")
        else:
            logger.warning("⚠️  Wikipedia API antwortet, aber keine Daten erhalten")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Wikipedia API Test fehlgeschlagen: {e}")
        return False

def main():
    """Hauptfunktion"""
    logger.info("=== XNTOP Importer - Verbindungstest ===")
    
    # Teste Datenbank
    db_ok = test_database_connection()
    
    # Teste Wikipedia API
    api_ok = test_wikipedia_api()
    
    # Zusammenfassung
    logger.info("\n=== TEST-ERGEBNISSE ===")
    logger.info(f"Datenbank: {'✅ OK' if db_ok else '❌ FEHLER'}")
    logger.info(f"Wikipedia API: {'✅ OK' if api_ok else '❌ FEHLER'}")
    
    if db_ok and api_ok:
        logger.info("\n🎉 Alle Tests erfolgreich! Sie können den Import starten.")
        return True
    else:
        logger.error("\n💥 Einige Tests fehlgeschlagen. Bitte überprüfen Sie die Konfiguration.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
