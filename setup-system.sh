#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Setting up Xandhopp System..."

# Step 1: Start Docker services
echo "📦 Starting Docker services..."
docker compose up -d postgres redis clickhouse

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Step 2: Setup database
echo "🗄️ Setting up database..."
cd apps/symfony-api
chmod +x bin/setup-database.sh
./bin/setup-database.sh

# Step 3: Start Symfony API
echo "🔧 Starting Symfony API..."
cd ../..
docker compose up -d api

# Wait for API to be ready
echo "⏳ Waiting for API to be ready..."
sleep 15

# Step 4: Test endpoints
echo "🧪 Testing endpoints..."

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:8080/api/test/health | jq .

# Test ClickHouse
echo "Testing ClickHouse..."
curl -s http://localhost:8080/api/test/clickhouse | jq .

# Test prelaunch endpoint
echo "Testing prelaunch endpoint..."
curl -s -X POST http://localhost:8080/api/prelaunch/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","locale":"en","country_interest":"DE"}' | jq .

# Step 5: Start Next.js frontend
echo "🌐 Starting Next.js frontend..."
docker compose up -d web

echo "✅ System setup completed!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:8080"
echo "📊 ClickHouse: http://localhost:8123"
echo "📧 MailHog: http://localhost:8025"
echo ""
echo "🧪 Test endpoints:"
echo "  - Health: http://localhost:8080/api/test/health"
echo "  - ClickHouse: http://localhost:8080/api/test/clickhouse"
echo "  - Prelaunch: POST http://localhost:8080/api/prelaunch/signup"
