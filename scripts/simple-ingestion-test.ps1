# Simple test script for ingestion worker
Write-Host "Testing Portalis Ingestion System..." -ForegroundColor Green

# Check if ClickHouse is running
Write-Host "1. Checking ClickHouse status..." -ForegroundColor Cyan
try {
    $result = docker exec xandhopp-clickhouse-1 clickhouse-client --query "SELECT 1" 2>$null
    if ($result -eq "1") {
        Write-Host "✓ ClickHouse is running" -ForegroundColor Green
    } else {
        Write-Host "⚠ ClickHouse not ready yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ ClickHouse not available" -ForegroundColor Red
}

# Check Redis
Write-Host "2. Checking Redis status..." -ForegroundColor Cyan
try {
    docker exec xandhopp-redis-1 redis-cli ping | Out-Null
    Write-Host "✓ Redis is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Redis not available" -ForegroundColor Red
}

# Test web app API
Write-Host "3. Testing Web App APIs..." -ForegroundColor Cyan
try {
    $health = curl -Uri "http://localhost:3000/api/health" -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Health API responding" -ForegroundColor Green
} catch {
    Write-Host "⚠ Web app not responding on port 3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "System Status:" -ForegroundColor Cyan
Write-Host "- Portal: http://localhost:3000/en" -ForegroundColor White
Write-Host "- Countries: http://localhost:3000/country/DE" -ForegroundColor White
Write-Host ""
Write-Host "To start data collection (when ClickHouse is ready):" -ForegroundColor Yellow
Write-Host "  pnpm run ingestion:dev" -ForegroundColor White
Write-Host ""
Write-Host "The portal works without ClickHouse - it shows demo data!" -ForegroundColor Green
