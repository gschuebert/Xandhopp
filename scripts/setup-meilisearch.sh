#!/bin/bash
set -euo pipefail

echo "🚀 Setting up Meilisearch for Xandhopp..."

# Configuration
MEILISEARCH_URL="http://localhost:7701"
MEILISEARCH_API_KEY="91RkaSPLkqMRqx9zv7IkI46fp3OWZR5O5aJuYulPMqjfyLulJI8twoPfXVDRqBT7kmr5qomSqvG6BFO19o3gtBIFcxQYP9irQKd7SzgiJyFKRk1brstop
"
INDEX_NAME="search"

# Check if Meilisearch is running
echo "🔍 Checking if Meilisearch is running..."
if ! curl -s "$MEILISEARCH_URL/health" > /dev/null; then
    echo "❌ Meilisearch is not running!"
    echo "💡 Start Meilisearch with: docker compose up -d meilisearch"
    exit 1
fi
echo "✅ Meilisearch is running"

# Create index
echo "📝 Creating search index..."
curl -s -X POST "$MEILISEARCH_URL/indexes" \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "'$INDEX_NAME'",
    "primaryKey": "id"
  }' || echo "ℹ️  Index might already exist"

# Configure searchable attributes
echo "⚙️  Configuring searchable attributes..."
curl -s -X PUT "$MEILISEARCH_URL/indexes/$INDEX_NAME/settings/searchable-attributes" \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '["title", "description", "content", "tags"]'

# Configure filterable attributes
echo "⚙️  Configuring filterable attributes..."
curl -s -X PUT "$MEILISEARCH_URL/indexes/$INDEX_NAME/settings/filterable-attributes" \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '["type", "locale", "tags"]'

# Configure sortable attributes
echo "⚙️  Configuring sortable attributes..."
curl -s -X PUT "$MEILISEARCH_URL/indexes/$INDEX_NAME/settings/sortable-attributes" \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '["title", "type"]'

# Add sample documents
echo "📄 Adding sample documents..."
curl -s -X POST "$MEILISEARCH_URL/indexes/$INDEX_NAME/documents" \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
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
      "id": "visa-requirements",
      "title": "Visa Requirements",
      "description": "Complete guide to visa requirements for different countries",
      "type": "guide",
      "url": "/en/guides/visa-requirements",
      "locale": "en",
      "tags": ["visa", "requirements", "documentation", "process"],
      "content": "Understanding visa requirements is crucial for international relocation. Different countries have various visa categories."
    },
    {
      "id": "cost-of-living",
      "title": "Cost of Living Calculator",
      "description": "Compare cost of living between countries and cities",
      "type": "feature",
      "url": "/en/compare/cost-of-living",
      "locale": "en",
      "tags": ["cost-of-living", "calculator", "comparison", "expenses"],
      "content": "Cost of living varies significantly between countries and cities. Our calculator helps you compare costs and plan your budget."
    },
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
  ]'

# Get index statistics
echo "📊 Getting index statistics..."
STATS=$(curl -s -X GET "$MEILISEARCH_URL/indexes/$INDEX_NAME/stats" \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY")

echo "📈 Index Statistics:"
echo "$STATS" | grep -o '"numberOfDocuments":[0-9]*' | sed 's/"numberOfDocuments"://' | xargs -I {} echo "   - Number of documents: {}"

# Test search
echo "🔍 Testing search functionality..."
echo "   Testing query: 'germany'"
SEARCH_RESULT=$(curl -s -X POST "$MEILISEARCH_URL/indexes/$INDEX_NAME/search" \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"q": "germany", "limit": 1}')

echo "$SEARCH_RESULT" | grep -o '"title":"[^"]*"' | sed 's/"title":"//' | sed 's/"//' | xargs -I {} echo "   - Found: {}"

echo "   Testing query: 'deutschland'"
SEARCH_RESULT_DE=$(curl -s -X POST "$MEILISEARCH_URL/indexes/$INDEX_NAME/search" \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"q": "deutschland", "limit": 1}')

echo "$SEARCH_RESULT_DE" | grep -o '"title":"[^"]*"' | sed 's/"title":"//' | sed 's/"//' | xargs -I {} echo "   - Found: {}"

echo ""
echo "🎉 Meilisearch setup completed successfully!"
echo ""
echo "🔗 You can now:"
echo "   - Use the search form in the header"
echo "   - Access Meilisearch dashboard at: $MEILISEARCH_URL"
echo "   - Test the search API at: /api/search"
echo ""
echo "💡 To add more documents, use the Node.js script:"
echo "   node scripts/setup-meilisearch.js"
