#!/usr/bin/env python3
"""
Meilisearch Setup Script for Xandhopp
Creates search index and populates it with sample data
"""

import requests
import json
import sys
import os

# Configuration
MEILISEARCH_URL = os.getenv('MEILISEARCH_URL', 'http://localhost:7701')
MEILISEARCH_API_KEY = os.getenv('MEILISEARCH_API_KEY', '91RkaSPLkqMRqx9zv7IkI46fp3OWZR5O5aJuYulPMqjfyLulJI8twoPfXVDRqBT7kmr5qomSqvG6BFO19o3gtBIFcxQYP9irQKd7SzgiJyFKRk1br')
INDEX_NAME = 'search'

# Sample search data
SEARCH_DATA = [
    {
        "id": "germany",
        "title": "Germany",
        "description": "Relocate to Germany - visa requirements, cost of living, and job opportunities",
        "type": "country",
        "url": "/en/countries/germany",
        "locale": "en",
        "tags": ["europe", "schengen", "work-permit", "visa"],
        "content": "Germany is one of the most popular destinations for international relocation. The country offers various visa options including work permits, student visas, and family reunification."
    },
    {
        "id": "canada",
        "title": "Canada",
        "description": "Move to Canada - Express Entry, provincial programs, and lifestyle",
        "type": "country",
        "url": "/en/countries/canada",
        "locale": "en",
        "tags": ["north-america", "express-entry", "provincial-nominee", "work-permit"],
        "content": "Canada is known for its welcoming immigration policies and high quality of life. The Express Entry system is the main pathway for skilled workers."
    },
    {
        "id": "australia",
        "title": "Australia",
        "description": "Relocate to Australia - skilled migration, work visas, and quality of life",
        "type": "country",
        "url": "/en/countries/australia",
        "locale": "en",
        "tags": ["oceania", "skilled-migration", "work-visa", "points-system"],
        "content": "Australia is a popular destination for skilled migrants. The country uses a points-based system for immigration."
    },
    {
        "id": "netherlands",
        "title": "Netherlands",
        "description": "Relocate to Netherlands - 30% ruling, work permits, and expat life",
        "type": "country",
        "url": "/en/countries/netherlands",
        "locale": "en",
        "tags": ["europe", "schengen", "30-percent-ruling", "work-permit"],
        "content": "The Netherlands is a popular destination for international workers, especially in tech and finance. The 30% ruling provides significant tax benefits for expats."
    },
    {
        "id": "switzerland",
        "title": "Switzerland",
        "description": "Move to Switzerland - work permits, taxes, and quality of life",
        "type": "country",
        "url": "/en/countries/switzerland",
        "locale": "en",
        "tags": ["europe", "work-permit", "high-salary", "quality-of-life"],
        "content": "Switzerland offers some of the highest salaries in Europe and excellent quality of life. The country has a complex permit system but offers great opportunities for skilled workers."
    },
    {
        "id": "visa-requirements",
        "title": "Visa Requirements",
        "description": "Complete guide to visa requirements for different countries",
        "type": "guide",
        "url": "/en/guides/visa-requirements",
        "locale": "en",
        "tags": ["visa", "requirements", "documentation", "process"],
        "content": "Understanding visa requirements is crucial for international relocation. Different countries have various visa categories including work permits, student visas, tourist visas, and family reunification."
    },
    {
        "id": "cost-of-living",
        "title": "Cost of Living Calculator",
        "description": "Compare cost of living between countries and cities",
        "type": "feature",
        "url": "/en/compare/cost-of-living",
        "locale": "en",
        "tags": ["cost-of-living", "calculator", "comparison", "expenses"],
        "content": "Cost of living varies significantly between countries and cities. Major expenses include housing, food, transportation, healthcare, and education."
    },
    {
        "id": "tax-comparison",
        "title": "Tax Comparison",
        "description": "Compare tax systems and rates across different countries",
        "type": "feature",
        "url": "/en/compare/taxes",
        "locale": "en",
        "tags": ["taxes", "comparison", "tax-system", "rates"],
        "content": "Tax systems vary greatly between countries. Some countries have progressive tax systems, while others have flat rates. Understanding tax obligations is crucial for financial planning."
    },
    {
        "id": "healthcare-systems",
        "title": "Healthcare Systems",
        "description": "Compare healthcare systems and insurance requirements",
        "type": "feature",
        "url": "/en/compare/healthcare",
        "locale": "en",
        "tags": ["healthcare", "insurance", "medical", "comparison"],
        "content": "Healthcare systems vary between countries. Some offer universal healthcare, while others rely on private insurance. Understanding healthcare coverage and costs is essential for international relocation planning."
    },
    {
        "id": "relocation-checklist",
        "title": "Relocation Checklist",
        "description": "Step-by-step checklist for international relocation",
        "type": "guide",
        "url": "/en/guides/relocation-checklist",
        "locale": "en",
        "tags": ["checklist", "relocation", "steps", "planning"],
        "content": "International relocation involves many steps and considerations. Our checklist covers visa applications, housing, banking, healthcare, education, and cultural adaptation."
    },
    # German entries
    {
        "id": "germany-de",
        "title": "Deutschland",
        "description": "Nach Deutschland umziehen - Visabestimmungen, Lebenshaltungskosten und Jobmöglichkeiten",
        "type": "country",
        "url": "/de/countries/germany",
        "locale": "de",
        "tags": ["europa", "schengen", "arbeitserlaubnis", "visum"],
        "content": "Deutschland ist ein beliebtes Ziel für internationale Umzüge. Das Land bietet viele Möglichkeiten für Fachkräfte und Studenten."
    },
    {
        "id": "canada-de",
        "title": "Kanada",
        "description": "Nach Kanada auswandern - Express Entry, Provinzprogramme und Lebensstil",
        "type": "country",
        "url": "/de/countries/canada",
        "locale": "de",
        "tags": ["nordamerika", "express-entry", "provinz-nominee", "arbeitserlaubnis"],
        "content": "Kanada ist bekannt für sein Einwanderungssystem und die hohe Lebensqualität. Express Entry ist der Hauptweg für qualifizierte Einwanderer."
    },
    {
        "id": "australia-de",
        "title": "Australien",
        "description": "Nach Australien auswandern - Fachkräfteeinwanderung, Arbeitsvisa und Lebensqualität",
        "type": "country",
        "url": "/de/countries/australia",
        "locale": "de",
        "tags": ["ozeanien", "fachkräfteeinwanderung", "arbeitsvisum", "punkte-system"],
        "content": "Australien verwendet ein Punkte-basiertes System für die Einwanderung. Das Land sucht qualifizierte Fachkräfte in verschiedenen Bereichen."
    },
    {
        "id": "visa-requirements-de",
        "title": "Visabestimmungen",
        "description": "Vollständiger Leitfaden zu Visabestimmungen für verschiedene Länder",
        "type": "guide",
        "url": "/de/guides/visa-requirements",
        "locale": "de",
        "tags": ["visum", "bestimmungen", "dokumentation", "prozess"],
        "content": "Das Verständnis der Visabestimmungen ist entscheidend für internationale Umzüge. Verschiedene Länder haben unterschiedliche Visakategorien."
    },
    {
        "id": "cost-of-living-de",
        "title": "Lebenshaltungskosten Rechner",
        "description": "Lebenshaltungskosten zwischen Ländern und Städten vergleichen",
        "type": "feature",
        "url": "/de/compare/cost-of-living",
        "locale": "de",
        "tags": ["lebenshaltungskosten", "rechner", "vergleich", "ausgaben"],
        "content": "Die Lebenshaltungskosten variieren erheblich zwischen Ländern und Städten. Unser Rechner hilft Ihnen, Kosten zu vergleichen und Ihr Budget zu planen."
    }
]

def make_request(endpoint, method='GET', data=None):
    """Make a request to Meilisearch API"""
    url = f"{MEILISEARCH_URL}{endpoint}"
    headers = {
        'Authorization': f'Bearer {MEILISEARCH_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=data)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        return response.json() if response.content else {}
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        raise

def check_meilisearch():
    """Check if Meilisearch is running"""
    try:
        make_request('/health')
        return True
    except:
        return False

def create_index():
    """Create the search index"""
    print('🔍 Creating search index...')
    
    try:
        make_request('/indexes', 'POST', {
            'uid': INDEX_NAME,
            'primaryKey': 'id'
        })
        print('✅ Search index created successfully')
    except Exception as e:
        if 'already exists' in str(e):
            print('ℹ️  Search index already exists')
        else:
            raise

def configure_index():
    """Configure the search index"""
    print('⚙️  Configuring search index...')
    
    # Configure searchable attributes
    make_request(f'/indexes/{INDEX_NAME}/settings/searchable-attributes', 'PUT', 
                ['title', 'description', 'content', 'tags'])
    
    # Configure filterable attributes
    make_request(f'/indexes/{INDEX_NAME}/settings/filterable-attributes', 'PUT', 
                ['type', 'locale', 'tags'])
    
    # Configure sortable attributes
    make_request(f'/indexes/{INDEX_NAME}/settings/sortable-attributes', 'PUT', 
                ['title', 'type'])
    
    # Configure ranking rules
    make_request(f'/indexes/{INDEX_NAME}/settings/ranking-rules', 'PUT', 
                ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'])
    
    print('✅ Search index configured successfully')

def add_documents():
    """Add documents to the search index"""
    print('📄 Adding documents to search index...')
    
    make_request(f'/indexes/{INDEX_NAME}/documents', 'POST', SEARCH_DATA)
    print(f'✅ Added {len(SEARCH_DATA)} documents to search index')

def get_index_stats():
    """Get index statistics"""
    print('📊 Getting index statistics...')
    
    stats = make_request(f'/indexes/{INDEX_NAME}/stats')
    print('📈 Index Statistics:')
    print(f'   - Number of documents: {stats.get("numberOfDocuments", 0)}')
    print(f'   - Index size: {stats.get("indexSize", "unknown")}')
    print(f'   - Last update: {stats.get("lastUpdate", "unknown")}')

def test_search():
    """Test search functionality"""
    print('🔍 Testing search functionality...')
    
    test_queries = ['germany', 'visa', 'cost of living', 'taxes']
    
    for query in test_queries:
        results = make_request(f'/indexes/{INDEX_NAME}/search', 'POST', {
            'q': query,
            'limit': 3
        })
        
        hits = results.get('hits', [])
        print(f'   Query: "{query}" - Found {len(hits)} results')
        if hits:
            print(f'     Top result: {hits[0].get("title", "Unknown")}')

def main():
    """Main setup function"""
    print('🚀 Setting up Meilisearch for Xandhopp...')
    print(f'📍 Meilisearch URL: {MEILISEARCH_URL}')
    print(f'🔑 API Key: {MEILISEARCH_API_KEY[:10]}...')
    print('')
    
    if not check_meilisearch():
        print('❌ Meilisearch is not running!')
        print('💡 Start Meilisearch with: docker compose up -d meilisearch')
        sys.exit(1)
    
    try:
        create_index()
        configure_index()
        add_documents()
        get_index_stats()
        test_search()
        
        print('')
        print('🎉 Meilisearch setup completed successfully!')
        print('')
        print('🔗 You can now:')
        print('   - Use the search form in the header')
        print(f'   - Access Meilisearch dashboard at: {MEILISEARCH_URL}')
        print('   - Test the search API at: /api/search')
        
    except Exception as e:
        print(f'❌ Setup failed: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()
