# Meilisearch Setup for Xandhopp

This guide explains how to create and configure a Meilisearch search index for the Xandhopp platform.

## Prerequisites

1. **Meilisearch running**: Make sure Meilisearch is started
   ```bash
   docker compose up -d meilisearch
   ```

2. **Check Meilisearch status**:
   ```bash
   curl http://localhost:7701/health
   ```

## Setup Options

### Option 1: Bash Script (Recommended)
```bash
# Make executable and run
chmod +x scripts/setup-meilisearch.sh
./scripts/setup-meilisearch.sh
```

### Option 2: Node.js Script
```bash
# Install dependencies (if needed)
npm install node-fetch

# Run the script
node scripts/setup-meilisearch.js
```

### Option 3: Python Script
```bash
# Install dependencies (if needed)
pip install requests

# Run the script
python3 scripts/setup-meilisearch.py
```

## What the Scripts Do

### 1. Create Search Index
- Creates a new index named `search`
- Sets `id` as the primary key

### 2. Configure Index Settings
- **Searchable attributes**: `title`, `description`, `content`, `tags`
- **Filterable attributes**: `type`, `locale`, `tags`
- **Sortable attributes**: `title`, `type`
- **Ranking rules**: Optimized for relevance

### 3. Add Sample Data
Adds 10 sample documents including:
- **Countries**: Germany, Canada, Australia, Netherlands, Switzerland
- **Features**: Cost of Living, Tax Comparison, Healthcare Systems
- **Guides**: Visa Requirements, Relocation Checklist

### 4. Test Search
Tests the search functionality with sample queries:
- "germany"
- "visa"
- "cost of living"
- "taxes"

## Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Create Index
```bash
curl -X POST 'http://localhost:7701/indexes' \
  -H 'Authorization: Bearer xandhopp-search-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "uid": "search",
    "primaryKey": "id"
  }'
```

### 2. Configure Searchable Attributes
```bash
curl -X PUT 'http://localhost:7701/indexes/search/settings/searchable-attributes' \
  -H 'Authorization: Bearer xandhopp-search-key' \
  -H 'Content-Type: application/json' \
  -d '["title", "description", "content", "tags"]'
```

### 3. Configure Filterable Attributes
```bash
curl -X PUT 'http://localhost:7701/indexes/search/settings/filterable-attributes' \
  -H 'Authorization: Bearer xandhopp-search-key' \
  -H 'Content-Type: application/json' \
  -d '["type", "locale", "tags"]'
```

### 4. Add Documents
```bash
curl -X POST 'http://localhost:7701/indexes/search/documents' \
  -H 'Authorization: Bearer xandhopp-search-key' \
  -H 'Content-Type: application/json' \
  -d '[{
    "id": "germany",
    "title": "Germany",
    "description": "Relocate to Germany - visa requirements, cost of living, and job opportunities",
    "type": "country",
    "url": "/en/countries/germany",
    "locale": "en",
    "tags": ["europe", "schengen", "work-permit", "visa"],
    "content": "Germany is one of the most popular destinations for international relocation..."
  }]'
```

## Testing the Search

### 1. Test via API
```bash
curl -X POST 'http://localhost:7701/indexes/search/search' \
  -H 'Authorization: Bearer xandhopp-search-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "q": "germany",
    "limit": 5
  }'
```

### 2. Test via Web Interface
- Open http://localhost:7701 in your browser
- Use the search interface to test queries

### 3. Test via Frontend
- Start the web application: `cd apps/web && pnpm dev`
- Use the search form in the header
- Try searching for: "germany", "visa", "cost of living"

## Adding More Content

### 1. Add Individual Documents
```bash
curl -X POST 'http://localhost:7701/indexes/search/documents' \
  -H 'Authorization: Bearer xandhopp-search-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "new-country",
    "title": "New Country",
    "description": "Description here",
    "type": "country",
    "url": "/en/countries/new-country",
    "locale": "en",
    "tags": ["tag1", "tag2"],
    "content": "Full content here..."
  }'
```

### 2. Bulk Import
```bash
curl -X POST 'http://localhost:7701/indexes/search/documents' \
  -H 'Authorization: Bearer xandhopp-search-key' \
  -H 'Content-Type: application/json' \
  -d @your-data.json
```

## Index Management

### View Index Stats
```bash
curl -X GET 'http://localhost:7701/indexes/search/stats' \
  -H 'Authorization: Bearer xandhopp-search-key'
```

### Delete Index
```bash
curl -X DELETE 'http://localhost:7701/indexes/search' \
  -H 'Authorization: Bearer xandhopp-search-key'
```

### Update Documents
```bash
curl -X PUT 'http://localhost:7701/indexes/search/documents' \
  -H 'Authorization: Bearer xandhopp-search-key' \
  -H 'Content-Type: application/json' \
  -d '[{
    "id": "existing-doc",
    "title": "Updated Title",
    "description": "Updated description"
  }]'
```

## Troubleshooting

### Meilisearch Not Running
```bash
# Check if container is running
docker ps | grep meilisearch

# Start Meilisearch
docker compose up -d meilisearch

# Check logs
docker compose logs meilisearch
```

### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/setup-meilisearch.sh
chmod +x scripts/setup-meilisearch.py
```

### API Key Issues
- Default key: `xandhopp-search-key`
- Check docker-compose.yml for MEILI_MASTER_KEY
- Ensure Authorization header is correct

### Index Already Exists
- Scripts handle this gracefully
- To recreate: delete index first, then run setup

## Production Considerations

### 1. Security
- Change default API key in production
- Use environment variables for sensitive data
- Consider IP whitelisting

### 2. Performance
- Monitor index size and query performance
- Consider pagination for large result sets
- Use filters to limit search scope

### 3. Data Management
- Set up regular backups
- Monitor disk usage
- Plan for data growth

## Environment Variables

```bash
# Optional: Override defaults
export MEILISEARCH_URL="http://localhost:7701"
export MEILISEARCH_API_KEY="xandhopp-search-key"
```

## Next Steps

1. **Add more content**: Import real country and guide data
2. **Implement search analytics**: Track popular searches
3. **Add search suggestions**: Implement autocomplete
4. **Optimize ranking**: Fine-tune search relevance
5. **Add faceted search**: Filter by country, type, etc.

## Support

- **Meilisearch Docs**: https://docs.meilisearch.com/
- **API Reference**: https://docs.meilisearch.com/reference/api/
- **Community**: https://github.com/meilisearch/meilisearch
