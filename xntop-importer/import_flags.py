#!/usr/bin/env python3

from main import XNTOPImporter
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def import_flags_for_countries():
    """Import flags for specific countries"""
    target_countries = ['Angola', 'Burkina Faso', 'Eswatini']
    
    # Import flags for specific countries
    importer = XNTOPImporter()
    importer.setup_database()  # Initialize database connection
    
    for country_name in target_countries:
        logger.info(f'=== Importing flag for {country_name} ===')
        
        # Get country from database
        with importer.db.connection.cursor() as cur:
            cur.execute('SELECT id FROM countries WHERE name_en = %s', (country_name,))
            result = cur.fetchone()
            if result:
                country_id = result[0]
                importer.import_additional_images(country_id, country_name, 'de')
                logger.info(f'✅ Flag imported for {country_name}')
            else:
                logger.error(f'❌ Country {country_name} not found')
    
    importer.db.close()

if __name__ == "__main__":
    import_flags_for_countries()
