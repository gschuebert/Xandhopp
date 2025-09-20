#!/usr/bin/env python3

import os
import sys
sys.path.append(os.path.dirname(__file__))

from import_full_article import *
import logging

def reimport_with_flags():
    """Reimport to get flags and coats of arms correctly categorized"""
    target_countries = ['Angola', 'Burkina Faso', 'Eswatini']
    
    log.info(f"Reimporting with correct flag/coat categorization: {', '.join(target_countries)}")
    
    with db() as conn:
        ensure_aux_schema(conn)
        ct_ids = load_content_type_ids(conn)
        countries = get_countries(conn)
        
        # Find target countries
        target_country_objs = []
        for country in countries:
            if country['name_en'] in target_countries:
                target_country_objs.append(country)
        
        log.info(f"Found {len(target_country_objs)} countries to process")
        
        for country in target_country_objs:
            log.info(f"\n=== Processing {country['name_en']} ===")
            
            # Import for German language
            try:
                import_one_country_language(conn, country, 'de', ct_ids)
                log.info(f"✅ Successfully reimported {country['name_en']} (de)")
            except Exception as e:
                log.error(f"❌ Error reimporting {country['name_en']} (de): {e}")

if __name__ == "__main__":
    reimport_with_flags()

