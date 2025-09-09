#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting Xandhopp System..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Function to stop containers using specific ports
stop_port_containers() {
    local port=$1
    echo "🛑 Stopping containers using port $port..."
    docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" | grep ":$port->" | awk '{print $1}' | xargs -r docker stop
}

# Check and free up required ports
echo "🔍 Checking required ports..."
required_ports=(5432 6379 8123 8080 3000 8025 7700)

for port in "${required_ports[@]}"; do
    if ! check_port $port; then
        stop_port_containers $port
        sleep 2
    fi
done

# Start services one by one
echo "📦 Starting PostgreSQL..."
docker compose up -d postgres
sleep 5

echo "📦 Starting Redis..."
docker compose up -d redis
sleep 3

echo "📦 Starting ClickHouse..."
docker compose up -d clickhouse
sleep 5

echo "📦 Starting Meilisearch..."
docker compose up -d meilisearch
sleep 3

echo "📦 Starting MailHog..."
docker compose up -d mailhog
sleep 3

# Setup database
echo "🗄️ Setting up database..."
cd apps/symfony-api
export DATABASE_URL='postgresql://xandhopp:xandhopp@localhost:5433/xandhopp'

# Create database
echo "Creating database..."
php bin/console doctrine:database:create --if-not-exists

# Run migrations
echo "Running migrations..."
php bin/console doctrine:migrations:migrate -n

# Seed freemium data
echo "Seeding freemium data..."
php bin/console app:seed:freemium

cd ../..

# Start API
echo "🔧 Starting Symfony API..."
docker compose up -d api
sleep 10

# Test API
echo "🧪 Testing API..."
sleep 5
curl -s http://localhost:8080/api/test/health || echo "API not ready yet"

# Start Web
echo "🌐 Starting Next.js Web..."
docker compose up -d web

echo "✅ System startup completed!"
echo ""
echo "🌐 Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - API: http://localhost:8080"
echo "  - ClickHouse: http://localhost:8123"
echo "  - MailHog: http://localhost:8025"
echo "  - Meilisearch: http://localhost:7700"
echo ""
echo "🧪 Test endpoints:"
echo "  - Health: http://localhost:8080/api/test/health"
echo "  - ClickHouse: http://localhost:8080/api/test/clickhouse"
