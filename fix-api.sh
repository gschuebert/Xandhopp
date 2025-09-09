#!/bin/bash
set -euo pipefail

echo "🔧 Fixing Symfony API Docker build..."

# Stop existing API container
echo "🛑 Stopping existing API container..."
docker compose stop api || true
docker compose rm -f api || true

# Remove old API image
echo "🧹 Removing old API image..."
docker rmi portalis-api:latest 2>/dev/null || true

# Clean up any orphaned containers
echo "🧹 Cleaning up orphaned containers..."
docker compose down --remove-orphans || true

# Build new API image
echo "🔨 Building new API image..."
docker compose build --no-cache api

# Start dependencies first
echo "🚀 Starting dependencies..."
docker compose up -d postgres redis clickhouse meilisearch

# Wait for dependencies
echo "⏳ Waiting for dependencies..."
sleep 15

# Start API
echo "🚀 Starting API..."
docker compose up -d api

# Wait for API to start
echo "⏳ Waiting for API to start..."
sleep 15

# Test API
echo "🧪 Testing API..."
if curl -s http://localhost:8081/api/test/health > /dev/null 2>&1; then
    echo "✅ API is working!"
    
    # Test additional endpoints
    echo "🧪 Testing ClickHouse endpoint..."
    if curl -s http://localhost:8081/api/test/clickhouse > /dev/null 2>&1; then
        echo "✅ ClickHouse integration working!"
    else
        echo "⚠️  ClickHouse integration not working"
    fi
else
    echo "❌ API still not working. Checking logs..."
    docker compose logs api --tail=30
fi

echo ""
echo "📊 Container status:"
docker compose ps

echo ""
echo "🌐 Service URLs:"
echo "   API: http://localhost:8081"
echo "   PostgreSQL: localhost:5433"
echo "   Redis: localhost:6380"
echo "   ClickHouse: http://localhost:8124"
echo "   Meilisearch: http://localhost:7701"
