#!/bin/bash
set -euo pipefail

echo "🚀 Starting Xandhopp System..."

# Build workspace packages first
echo "🔨 Building workspace packages..."
chmod +x build-workspace.sh
./build-workspace.sh

# Stop any running containers
echo "📦 Stopping existing containers..."
docker compose down || true

# Start core services first
echo "🗄️ Starting PostgreSQL and Redis..."
docker compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Start ClickHouse
echo "📊 Starting ClickHouse..."
docker compose up -d clickhouse

# Wait for ClickHouse
echo "⏳ Waiting for ClickHouse..."
sleep 5

# Start API (without building web/admin first)
echo "🔧 Starting API..."
docker compose up -d api

# Wait for API
echo "⏳ Waiting for API..."
sleep 15

# Setup database
echo "🗃️ Setting up database..."
cd apps/symfony-api
export DATABASE_URL='postgresql://xandhopp:xandhopp@localhost:5433/xandhopp'
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate -n
php bin/console app:seed:freemium
cd ../..

# Test API endpoints
echo "🧪 Testing API endpoints..."
curl -f http://localhost:8080/api/test/health || echo "❌ Health check failed"
curl -f http://localhost:8080/api/test/clickhouse || echo "❌ ClickHouse test failed"

echo "✅ System ready!"
echo "🌐 API: http://localhost:8080"
echo "🗄️ PostgreSQL: localhost:5433"
echo "📊 ClickHouse: http://localhost:8124"
echo "🔴 Redis: localhost:6379"

echo ""
echo "📝 To start the web frontend manually:"
echo "cd apps/web && pnpm dev"
