# PowerShell script to start the complete Portalis system
Write-Host "🌍 Starting Portalis Data Pipeline System" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Step 1: Start infrastructure
Write-Host ""
Write-Host "1. Starting infrastructure services..." -ForegroundColor Cyan
docker-compose up -d postgres redis meilisearch minio clickhouse

# Step 2: Wait a bit for services to start
Write-Host ""
Write-Host "2. Waiting for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Step 3: Set up PostgreSQL (existing)
Write-Host ""
Write-Host "3. Setting up PostgreSQL..." -ForegroundColor Cyan
try {
    pnpm run db:create
    pnpm run db:migrate
    Write-Host "✓ PostgreSQL ready" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PostgreSQL setup failed (may already exist)" -ForegroundColor Yellow
}

# Step 4: Build packages
Write-Host ""
Write-Host "4. Building packages..." -ForegroundColor Cyan
pnpm --filter @portalis/connectors build

# Step 5: Start ClickHouse schema in background
Write-Host ""
Write-Host "5. Setting up ClickHouse (in background)..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location "D:\dev\Portalis"
    powershell -File ".\scripts\clickhouse-wait.ps1"
} -Name "ClickHouseSetup"

# Step 6: Start applications
Write-Host ""
Write-Host "6. Starting applications..." -ForegroundColor Cyan

# Start ingestion worker
Write-Host "Starting Ingestion Worker..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Portalis Ingestion Worker' -ForegroundColor Green; pnpm run ingestion:dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start web app
Write-Host "Starting Web App..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\web'; Write-Host 'Portalis Web App' -ForegroundColor Green; pnpm dev"

# Start admin app
Write-Host "Starting Admin App..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\admin'; Write-Host 'Portalis Admin App' -ForegroundColor Green; pnpm dev"

Write-Host ""
Write-Host "🎉 Portalis System Starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "- Web App: http://localhost:3000/simple" -ForegroundColor White
Write-Host "- Admin App: http://localhost:3001" -ForegroundColor White
Write-Host "- API Health: http://localhost:3000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Data APIs (available once ClickHouse is ready):" -ForegroundColor Cyan
Write-Host "- Countries: http://localhost:3000/api/countries" -ForegroundColor White
Write-Host "- Country Data: http://localhost:3000/api/country/DE/snapshot" -ForegroundColor White
Write-Host ""
Write-Host "Background Tasks:" -ForegroundColor Cyan
Write-Host "- ClickHouse setup running in background" -ForegroundColor White
Write-Host "- Ingestion worker will start collecting data" -ForegroundColor White
Write-Host ""
Write-Host "Check ClickHouse setup status:" -ForegroundColor Yellow
Write-Host "  Get-Job -Name 'ClickHouseSetup'" -ForegroundColor White
Write-Host "  Receive-Job -Name 'ClickHouseSetup'" -ForegroundColor White
Write-Host ""
Write-Host "Wait 2-3 minutes for initial data collection to complete." -ForegroundColor Green