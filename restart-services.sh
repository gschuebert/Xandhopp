#!/bin/bash
set -euo pipefail

echo "🔄 Restarting all services with new port configuration..."

# Stop all containers
echo "🛑 Stopping all containers..."
docker compose down

# Remove any orphaned containers
echo "🧹 Cleaning up orphaned containers..."
docker compose down --remove-orphans

# Start services one by one
echo "🚀 Starting PostgreSQL..."
docker compose up -d postgres

echo "⏳ Waiting for PostgreSQL..."
sleep 5

echo "🚀 Starting Redis..."
docker compose up -d redis

echo "⏳ Waiting for Redis..."
sleep 3

echo "🚀 Starting ClickHouse..."
docker compose up -d clickhouse

echo "⏳ Waiting for ClickHouse..."
sleep 5

echo "🚀 Starting API..."
docker compose up -d api

echo "⏳ Waiting for API..."
sleep 10

# Check status
echo "📊 Service status:"
docker compose ps

echo ""
echo "✅ Services started with new ports:"
echo "🗄️ PostgreSQL: localhost:5433"
echo "🔴 Redis: localhost:6380"
echo "📊 ClickHouse HTTP: http://localhost:8124"
echo "📊 ClickHouse Native: localhost:9003"
echo "🔧 API: http://localhost:8081"
echo "🔍 Meilisearch: http://localhost:7701"
echo "📦 MinIO: http://localhost:9004 (Console: 9005)"
