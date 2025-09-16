"""
Datenbankverbindung und -operationen für XNTOP Importer
"""

import psycopg2
import psycopg2.extras
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self, host: str, port: int, database: str, user: str, password: str):
        self.connection_params = {
            'host': host,
            'port': port,
            'database': database,
            'user': user,
            'password': password
        }
        self.connection = None
    
    def connect(self):
        """Stellt Verbindung zur Datenbank her"""
        try:
            self.connection = psycopg2.connect(**self.connection_params)
            self.connection.autocommit = False
            logger.info("Datenbankverbindung erfolgreich hergestellt")
        except psycopg2.Error as e:
            logger.error(f"Fehler bei Datenbankverbindung: {e}")
            raise
    
    def disconnect(self):
        """Schließt Datenbankverbindung"""
        if self.connection:
            self.connection.close()
            logger.info("Datenbankverbindung geschlossen")
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Führt SELECT-Query aus und gibt Ergebnisse zurück"""
        try:
            with self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        except psycopg2.Error as e:
            logger.error(f"Fehler bei Query-Ausführung: {e}")
            raise
    
    def execute_insert(self, query: str, params: tuple = None) -> int:
        """Führt INSERT-Query aus und gibt ID zurück"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                self.connection.commit()
                return cursor.fetchone()[0] if cursor.description else 0
        except psycopg2.Error as e:
            self.connection.rollback()
            logger.error(f"Fehler bei INSERT: {e}")
            raise
    
    def execute_upsert(self, query: str, params: tuple = None) -> int:
        """Führt UPSERT-Query aus und gibt ID zurück"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                self.connection.commit()
                return cursor.fetchone()[0] if cursor.description else 0
        except psycopg2.Error as e:
            self.connection.rollback()
            logger.error(f"Fehler bei UPSERT: {e}")
            raise
    
    def upsert_language(self, code: str, name: str) -> str:
        """Fügt Sprache hinzu oder aktualisiert sie"""
        query = """
        INSERT INTO languages (code, name) 
        VALUES (%s, %s) 
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
        RETURNING code
        """
        result = self.execute_upsert(query, (code, name))
        return code  # Sprachen haben code als Primary Key
    
    def upsert_content_type(self, key: str, name_en: str) -> int:
        """Fügt Content-Type hinzu oder aktualisiert ihn"""
        query = """
        INSERT INTO content_types (key, name_en) 
        VALUES (%s, %s) 
        ON CONFLICT (key) DO UPDATE SET name_en = EXCLUDED.name_en
        RETURNING id
        """
        return self.execute_upsert(query, (key, name_en))
    
    def upsert_country(self, iso_code: str, name_en: str, continent: str, 
                      has_subregions: bool = False, slug_en: str = None, slug_de: str = None) -> int:
        """Fügt Land hinzu oder aktualisiert es"""
        query = """
        INSERT INTO countries (iso_code, name_en, continent, has_subregions, slug_en, slug_de) 
        VALUES (%s, %s, %s, %s, %s, %s) 
        ON CONFLICT (iso_code) DO UPDATE SET 
            name_en = EXCLUDED.name_en,
            continent = EXCLUDED.continent,
            has_subregions = EXCLUDED.has_subregions,
            slug_en = EXCLUDED.slug_en,
            slug_de = EXCLUDED.slug_de,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
        """
        return self.execute_upsert(query, (iso_code, name_en, continent, has_subregions, slug_en, slug_de))
    
    def upsert_localized_content(self, country_id: int, language_code: str, 
                                content_type_id: int, content: str, source_url: str = None) -> int:
        """Fügt lokalisierten Inhalt hinzu oder aktualisiert ihn"""
        query = """
        INSERT INTO localized_contents (country_id, language_code, content_type_id, content, source_url) 
        VALUES (%s, %s, %s, %s, %s) 
        ON CONFLICT (country_id, subregion_id, language_code, content_type_id) 
        DO UPDATE SET 
            content = EXCLUDED.content,
            source_url = EXCLUDED.source_url,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
        """
        return self.execute_upsert(query, (country_id, language_code, content_type_id, content, source_url))
    
    def upsert_media_asset(self, country_id: int, language_code: str, title: str, 
                          asset_type: str, url: str, attribution: str = None, source_url: str = None) -> int:
        """Fügt Medien-Asset hinzu oder aktualisiert es"""
        query = """
        INSERT INTO media_assets (country_id, language_code, title, type, url, attribution, source_url) 
        VALUES (%s, %s, %s, %s, %s, %s, %s) 
        RETURNING id
        """
        return self.execute_upsert(query, (country_id, language_code, title, asset_type, url, attribution, source_url))
    
    def log_sync(self, country_id: int, language_code: str, source: str, status: str):
        """Loggt Synchronisations-Status"""
        query = """
        INSERT INTO sync_logs (country_id, language_code, source, status) 
        VALUES (%s, %s, %s, %s)
        """
        self.execute_insert(query, (country_id, language_code, source, status))
    
    def get_country_by_iso(self, iso_code: str) -> Optional[Dict[str, Any]]:
        """Holt Land anhand ISO-Code"""
        query = "SELECT * FROM countries WHERE iso_code = %s"
        results = self.execute_query(query, (iso_code,))
        return results[0] if results else None
    
    def get_content_type_by_key(self, key: str) -> Optional[Dict[str, Any]]:
        """Holt Content-Type anhand Key"""
        query = "SELECT * FROM content_types WHERE key = %s"
        results = self.execute_query(query, (key,))
        return results[0] if results else None
