#!/bin/bash
set -euo pipefail

echo "🔧 Running database migration with correct connection..."

# Set the correct database URL
export DATABASE_URL="postgresql://xandhopp:xandhopp@localhost:5433/xandhopp?serverVersion=15&charset=utf8"

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL status..."
if ! docker compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL is not running. Starting it..."
    docker compose up -d postgres
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 10
fi

# Test database connection
echo "🔍 Testing database connection..."
if ! docker compose exec postgres psql -U xandhopp -d xandhopp -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Cannot connect to database. Please check if PostgreSQL is running on port 5433"
    exit 1
fi

echo "✅ Database connection successful"

# Run migration
echo "🚀 Running migration..."
cd apps/symfony-api
php bin/console doctrine:migrations:migrate --no-interaction

echo "✅ Migration completed successfully!"
