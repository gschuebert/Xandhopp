#!/bin/bash
set -euo pipefail

echo "🧹 Cleaning up and starting fresh..."

# Stop all containers and remove them
echo "🛑 Stopping and removing all containers..."
docker compose down --remove-orphans --volumes

# Remove any dangling containers
echo "🧹 Removing dangling containers..."
docker container prune -f

# Check which ports are in use
echo "🔍 Checking port usage..."
echo "Port 5433 (PostgreSQL): $(lsof -i :5433 2>/dev/null || echo 'Free')"
echo "Port 6380 (Redis): $(lsof -i :6380 2>/dev/null || echo 'Free')"
echo "Port 8124 (ClickHouse HTTP): $(lsof -i :8124 2>/dev/null || echo 'Free')"
echo "Port 9003 (ClickHouse Native): $(lsof -i :9003 2>/dev/null || echo 'Free')"
echo "Port 7701 (Meilisearch): $(lsof -i :7701 2>/dev/null || echo 'Free')"
echo "Port 9004 (MinIO): $(lsof -i :9004 2>/dev/null || echo 'Free')"
echo "Port 9005 (MinIO Console): $(lsof -i :9005 2>/dev/null || echo 'Free')"
echo "Port 8081 (API): $(lsof -i :8081 2>/dev/null || echo 'Free')"

echo ""
echo "🚀 Starting services with clean state..."

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

# Check final status
echo "📊 Final service status:"
docker compose ps

echo ""
echo "✅ All services started successfully!"
echo "🌐 API: http://localhost:8081"
echo "🗄️ PostgreSQL: localhost:5433"
echo "🔴 Redis: localhost:6380"
echo "📊 ClickHouse HTTP: http://localhost:8124"
echo "📊 ClickHouse Native: localhost:9003"
echo "🔍 Meilisearch: http://localhost:7701"
echo "📦 MinIO: http://localhost:9004 (Console: 9005)"
