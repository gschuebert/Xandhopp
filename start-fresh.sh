#!/bin/bash
set -euo pipefail

echo "🔄 Starting fresh with all new ports..."

# Stop all containers
echo "🛑 Stopping all containers..."
docker compose down --remove-orphans

# Start services one by one
echo "🗄️ Starting PostgreSQL..."
docker compose up -d postgres

echo "⏳ Waiting for PostgreSQL..."
sleep 8

echo "🔴 Starting Redis..."
docker compose up -d redis

echo "⏳ Waiting for Redis..."
sleep 3

echo "📊 Starting ClickHouse..."
docker compose up -d clickhouse

echo "⏳ Waiting for ClickHouse..."
sleep 5

echo "🔍 Starting Meilisearch..."
docker compose up -d meilisearch

echo "⏳ Waiting for Meilisearch..."
sleep 3

echo "📦 Starting MinIO..."
docker compose up -d minio

echo "⏳ Waiting for MinIO..."
sleep 3

echo "🔧 Starting API..."
docker compose up -d api

echo "⏳ Waiting for API..."
sleep 10

# Check status
echo "📊 Service status:"
docker compose ps

echo ""
echo "✅ All services started with new ports:"
echo "🌐 API: http://localhost:8081"
echo "🗄️ PostgreSQL: localhost:5433"
echo "🔴 Redis: localhost:6380"
echo "📊 ClickHouse HTTP: http://localhost:8124"
echo "📊 ClickHouse Native: localhost:9003"
echo "🔍 Meilisearch: http://localhost:7701"
echo "📦 MinIO: http://localhost:9004 (Console: 9005)"

echo ""
echo "🧪 Testing API..."
curl -f http://localhost:8081/api/test/health || echo "❌ Health check failed"
curl -f http://localhost:8081/api/test/clickhouse || echo "❌ ClickHouse test failed"

echo ""
echo "📝 To start frontend apps:"
echo "cd apps/web && pnpm dev"
echo "cd apps/admin && pnpm dev"
