# PowerShell script to set up ClickHouse on Windows
Write-Host "Setting up ClickHouse for Portalis..." -ForegroundColor Green

# Start ClickHouse
Write-Host "Starting ClickHouse..." -ForegroundColor Yellow
pnpm run ch:init

# Wait for ClickHouse to be ready
Write-Host "Waiting for ClickHouse to start..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

do {
    $attempt++
    Write-Host "Attempt $attempt/$maxAttempts..." -ForegroundColor Cyan
    
    try {
        $result = docker exec portalis-clickhouse-1 clickhouse-client --query "SELECT 1" 2>$null
        if ($result -eq "1") {
            $ready = $true
            Write-Host "ClickHouse is ready!" -ForegroundColor Green
            break
        }
    } catch {
        # Continue waiting
    }
    
    if ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
    }
} while ($attempt -lt $maxAttempts -and -not $ready)

if (-not $ready) {
    Write-Host "ClickHouse did not start within expected time. Trying schema anyway..." -ForegroundColor Yellow
}

# Apply schema
Write-Host "Applying ClickHouse schema..." -ForegroundColor Yellow
try {
    Get-Content "packages\db-clickhouse\schema.sql" | docker exec -i portalis-clickhouse-1 clickhouse-client --multiquery
    Write-Host "Schema applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "Schema application failed. ClickHouse might need more time." -ForegroundColor Red
    Write-Host "You can retry later with: Get-Content 'packages\db-clickhouse\schema.sql' | docker exec -i portalis-clickhouse-1 clickhouse-client --multiquery" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "ClickHouse setup completed!" -ForegroundColor Green
Write-Host "You can now:" -ForegroundColor Cyan
Write-Host "- Test connection: docker exec portalis-clickhouse-1 clickhouse-client --query 'SELECT 1'" -ForegroundColor White
Write-Host "- Start ingestion worker: pnpm run ingestion:dev" -ForegroundColor White
Write-Host "- Start web app: pnpm run dev" -ForegroundColor White
