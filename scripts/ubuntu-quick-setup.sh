#!/bin/bash
# Quick Ubuntu Setup Script for Portalis

echo "🚀 Setting up Portalis on Ubuntu/WSL..."

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
echo "📦 Installing pnpm..."
npm install -g pnpm

# Install dependencies
echo "📦 Installing project dependencies..."
pnpm install

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Apply ClickHouse schema
echo "📊 Applying ClickHouse schema..."
docker exec -i portalis-clickhouse-1 clickhouse-client --multiquery < packages/db-clickhouse/schema.sql

# Test ClickHouse
echo "🔍 Testing ClickHouse..."
docker exec portalis-clickhouse-1 clickhouse-client --query "SHOW TABLES FROM portalis"

echo ""
echo "✅ Setup completed!"
echo ""
echo "🌍 Start the services:"
echo "  pnpm --filter @portalis/web dev"
echo "  pnpm --filter @portalis/admin dev" 
echo "  pnpm run ingestion:dev"
echo ""
echo "🎯 Then visit: http://localhost:3000/en"
