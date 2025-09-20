"""
Test script for progress tracking functionality
"""

import os
import logging
from main import XNTOPImporter

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_progress_tracking():
    """Test the progress tracking functionality"""
    logger.info("=== Testing Progress Tracking ===")
    
    # Create importer instance
    importer = XNTOPImporter()
    
    # Test progress tracker methods
    logger.info("Testing ProgressTracker methods...")
    
    # Test marking operations
    importer.progress.mark_operation_completed("DEU", "en")
    importer.progress.mark_operation_completed("DEU", "de")
    
    # Test checking operations
    assert importer.progress.is_operation_completed("DEU", "en") == True
    assert importer.progress.is_operation_completed("DEU", "fr") == False
    
    # Test country completion
    importer.progress.mark_country_completed("DEU")
    assert importer.progress.is_country_completed("DEU") == True
    assert importer.progress.is_country_completed("FRA") == False
    
    # Test progress summary
    summary = importer.progress.get_progress_summary(125, 625)
    logger.info(f"Progress summary: {summary}")
    
    # Test save/load
    importer.progress.save_progress()
    logger.info("Progress saved successfully")
    
    # Load in new instance
    new_importer = XNTOPImporter()
    assert new_importer.progress.is_country_completed("DEU") == True
    assert new_importer.progress.is_operation_completed("DEU", "en") == True
    
    logger.info("✅ All progress tracking tests passed!")
    
    # Clean up test file
    if os.path.exists('import_progress.json'):
        os.remove('import_progress.json')
        logger.info("Test progress file cleaned up")

if __name__ == "__main__":
    test_progress_tracking()
