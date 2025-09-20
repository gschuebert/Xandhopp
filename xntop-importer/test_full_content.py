#!/usr/bin/env python3

"""
Test script to verify that the Wikipedia API now fetches full content instead of mobile summaries
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from wikipedia_api import WikipediaAPIClient

def test_full_content():
    """Test fetching full content for Italy"""
    client = WikipediaAPIClient("https://de.wikipedia.org", timeout=30)
    
    print("=== Testing Full Content Fetch for Italy ===")
    
    # Test with Italy
    data = client.get_country_data("Italien", "de")
    
    if data and data.get("extract"):
        extract = data["extract"]
        print(f"✅ Successfully fetched content for Italy")
        print(f"📏 Content length: {len(extract)} characters")
        print(f"📝 First 200 characters: {extract[:200]}...")
        
        # Check if we got the full content (should be much longer than mobile summary)
        if len(extract) > 500:
            print("✅ Content appears to be full desktop version (length > 500 chars)")
        else:
            print("❌ Content appears to be mobile summary (length < 500 chars)")
            
        # Check for specific content that should be in full version
        if "Italienische Republik" in extract:
            print("✅ Contains full official name 'Italienische Republik'")
        if "Apenninhalbinsel" in extract:
            print("✅ Contains detailed geographical information")
        if "Risorgimento" in extract:
            print("✅ Contains historical information")
            
    else:
        print("❌ Failed to fetch content for Italy")
        
    print("\n=== Testing with Montenegro ===")
    
    # Test with Montenegro
    data2 = client.get_country_data("Montenegro", "de")
    
    if data2 and data2.get("extract"):
        extract2 = data2["extract"]
        print(f"✅ Successfully fetched content for Montenegro")
        print(f"📏 Content length: {len(extract2)} characters")
        print(f"📝 First 200 characters: {extract2[:200]}...")
    else:
        print("❌ Failed to fetch content for Montenegro")

if __name__ == "__main__":
    test_full_content()
