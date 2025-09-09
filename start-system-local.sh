#!/bin/bash
set -euo pipefail

echo "🚀 Starting Xandhopp System (Local Mode)..."

# Build workspace packages first
echo "🔨 Building workspace packages..."
chmod +x build-workspace.sh
./build-workspace.sh

# Stop any running containers
echo "📦 Stopping existing containers..."
docker compose down || true

# Start only backend services
echo "🗄️ Starting backend services..."
docker compose up -d postgres redis clickhouse api

# Wait for services
echo "⏳ Waiting for services to be ready..."
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
curl -f http://localhost:8081/api/test/health || echo "❌ Health check failed"
curl -f http://localhost:8081/api/test/clickhouse || echo "❌ ClickHouse test failed"

echo "✅ Backend ready!"
echo "🌐 API: http://localhost:8081"
echo "🗄️ PostgreSQL: localhost:5433"
echo "📊 ClickHouse HTTP: http://localhost:8124"
echo "📊 ClickHouse Native: localhost:9003"
echo "🔴 Redis: localhost:6380"
echo "🔍 Meilisearch: http://localhost:7701"
echo "📦 MinIO: http://localhost:9004 (Console: 9005)"

echo ""
echo "📝 To start the web frontend:"
echo "cd apps/web && pnpm dev"
echo ""
echo "📝 To start the admin frontend:"
echo "cd apps/admin && pnpm dev"
