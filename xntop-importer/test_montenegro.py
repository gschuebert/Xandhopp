"""
Test Montenegro import specifically
"""

import os
import logging
from main import XNTOPImporter

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_montenegro_import():
    """Test importing Montenegro specifically"""
    logger.info("=== Testing Montenegro Import ===")
    
    # Create importer
    importer = XNTOPImporter()
    
    try:
        importer.db.connect()
        
        # Setup database
        overview_type_id = importer.setup_database()
        
        # Montenegro data
        montenegro_data = {
            "name": "Montenegro", 
            "iso": "MNE", 
            "wikipedia_slug": "Montenegro"
        }
        
        # Import Montenegro
        logger.info("Importing Montenegro...")
        importer.import_country_data(montenegro_data, "Europe", overview_type_id)
        
        logger.info("✅ Montenegro import completed!")
        
        # Check what was imported
        logger.info("Checking imported data...")
        
        # Check country
        countries = importer.db.execute_query(
            "SELECT * FROM countries WHERE iso_code = 'MNE'"
        )
        logger.info(f"Countries found: {len(countries)}")
        
        # Check content
        contents = importer.db.execute_query(
            "SELECT * FROM localized_contents WHERE country_id = (SELECT id FROM countries WHERE iso_code = 'MNE')"
        )
        logger.info(f"Content entries found: {len(contents)}")
        
        # Check media
        media = importer.db.execute_query(
            "SELECT * FROM media_assets WHERE country_id = (SELECT id FROM countries WHERE iso_code = 'MNE')"
        )
        logger.info(f"Media assets found: {len(media)}")
        
        for m in media:
            logger.info(f"  - {m['type']}: {m['title']} ({m['url'][:60]}...)")
        
        importer.print_statistics()
        
    except Exception as e:
        logger.error(f"Error during Montenegro import: {e}")
        raise
    finally:
        importer.db.disconnect()

if __name__ == "__main__":
    test_montenegro_import()
