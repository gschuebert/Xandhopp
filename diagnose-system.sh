#!/bin/bash
set -euo pipefail

echo "🔍 Diagnosing Xandhopp system..."

echo ""
echo "📊 Docker container status:"
docker compose ps

echo ""
echo "🔍 Checking individual services..."

# Check PostgreSQL
echo "🗄️ PostgreSQL:"
if docker compose exec postgres pg_isready -U xandhopp -d xandhopp 2>/dev/null; then
    echo "✅ PostgreSQL is running and accessible"
else
    echo "❌ PostgreSQL issues detected"
    echo "   Logs:"
    docker compose logs postgres --tail=10
fi

# Check Redis
echo ""
echo "🔴 Redis:"
if docker compose exec redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "✅ Redis is running and accessible"
else
    echo "❌ Redis issues detected"
    echo "   Logs:"
    docker compose logs redis --tail=10
fi

# Check ClickHouse
echo ""
echo "📊 ClickHouse:"
if curl -s http://localhost:8124/ping 2>/dev/null | grep -q ok; then
    echo "✅ ClickHouse is running and accessible"
else
    echo "❌ ClickHouse issues detected"
    echo "   Logs:"
    docker compose logs clickhouse --tail=10
fi

# Check Meilisearch
echo ""
echo "🔍 Meilisearch:"
if curl -s http://localhost:7701/health 2>/dev/null | grep -q ok; then
    echo "✅ Meilisearch is running and accessible"
else
    echo "❌ Meilisearch issues detected"
    echo "   Logs:"
    docker compose logs meilisearch --tail=10
fi

# Check API
echo ""
echo "🔧 API:"
if curl -s http://localhost:8081/api/test/health 2>/dev/null | grep -q ok; then
    echo "✅ API is running and accessible"
else
    echo "❌ API issues detected"
    echo "   Logs:"
    docker compose logs api --tail=20
fi

echo ""
echo "🌐 Port usage:"
echo "Port 5433 (PostgreSQL): $(lsof -i :5433 2>/dev/null | wc -l) connections"
echo "Port 6380 (Redis): $(lsof -i :6380 2>/dev/null | wc -l) connections"
echo "Port 8124 (ClickHouse): $(lsof -i :8124 2>/dev/null | wc -l) connections"
echo "Port 7701 (Meilisearch): $(lsof -i :7701 2>/dev/null | wc -l) connections"
echo "Port 8081 (API): $(lsof -i :8081 2>/dev/null | wc -l) connections"

echo ""
echo "💡 Recommendations:"
echo "1. If API is failing, try starting it manually:"
echo "   cd apps/symfony-api && php -S localhost:8081 -t public"
echo ""
echo "2. If services are not starting, check Docker resources:"
echo "   docker system df"
echo "   docker system prune -f"
echo ""
echo "3. For fresh start:"
echo "   docker compose down --volumes"
echo "   ./start-minimal.sh"
