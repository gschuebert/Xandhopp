#!/bin/bash
set -euo pipefail

echo "🚀 Starting minimal Xandhopp system..."

# Stop all containers first
echo "🛑 Stopping existing containers..."
docker compose down || true

# Start only the essential services that work
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

# Check status
echo "📊 Service status:"
docker compose ps

echo ""
echo "✅ Essential services started:"
echo "🗄️ PostgreSQL: localhost:5433"
echo "🔴 Redis: localhost:6380"
echo "📊 ClickHouse HTTP: http://localhost:8124"
echo "🔍 Meilisearch: http://localhost:7701"

echo ""
echo "🧪 Testing services..."

# Test PostgreSQL
echo "🗄️ Testing PostgreSQL..."
if docker compose exec postgres pg_isready -U xandhopp -d xandhopp > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL not ready"
fi

# Test Redis
echo "🔴 Testing Redis..."
if docker compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis not ready"
fi

# Test ClickHouse
echo "📊 Testing ClickHouse..."
if curl -s http://localhost:8124/ping > /dev/null 2>&1; then
    echo "✅ ClickHouse is ready"
else
    echo "❌ ClickHouse not ready"
fi

# Test Meilisearch
echo "🔍 Testing Meilisearch..."
if curl -s http://localhost:7701/health > /dev/null 2>&1; then
    echo "✅ Meilisearch is ready"
else
    echo "❌ Meilisearch not ready"
fi

echo ""
echo "📝 Next steps:"
echo "1. Setup database: cd apps/symfony-api && export DATABASE_URL='postgresql://xandhopp:xandhopp@localhost:5433/xandhopp' && php bin/console doctrine:database:create --if-not-exists && php bin/console doctrine:migrations:migrate -n && php bin/console app:seed:freemium"
echo "2. Setup search index: ./scripts/setup-meilisearch.sh"
echo "3. Start web app: cd apps/web && pnpm dev"
echo "4. Start API manually: cd apps/symfony-api && php -S localhost:8081 -t public"
