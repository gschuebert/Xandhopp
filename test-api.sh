#!/bin/bash
set -euo pipefail

echo "🧪 Testing API connection..."

# Test if API is running
if curl -s http://localhost:8081/api/test/health > /dev/null 2>&1; then
    echo "✅ API is running and accessible"
    
    # Test registration endpoint
    echo "🧪 Testing registration endpoint..."
    RESPONSE=$(curl -s -X POST http://localhost:8081/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}' \
        -w "%{http_code}")
    
    HTTP_CODE="${RESPONSE: -3}"
    if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "409" ]; then
        echo "✅ Registration endpoint is working (HTTP $HTTP_CODE)"
    else
        echo "❌ Registration endpoint failed (HTTP $HTTP_CODE)"
        echo "Response: $RESPONSE"
    fi
else
    echo "❌ API is not accessible at http://localhost:8081"
    echo "🔧 Starting API services..."
    docker compose up -d postgres redis clickhouse meilisearch
    sleep 10
    docker compose up -d api
    sleep 15
    
    if curl -s http://localhost:8081/api/test/health > /dev/null 2>&1; then
        echo "✅ API is now running"
    else
        echo "❌ API still not working. Check logs:"
        docker compose logs api --tail=20
    fi
fi
