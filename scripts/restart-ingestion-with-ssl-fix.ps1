# PowerShell script to restart ingestion worker with SSL fixes
Write-Host "🔄 Restarting Portalis Ingestion Worker with SSL Fixes" -ForegroundColor Green

# Kill existing ingestion worker processes
Write-Host "Stopping existing ingestion workers..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.CommandLine -like "*ingestion-worker*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Set environment variables for SSL fix
Write-Host "Setting SSL development environment..." -ForegroundColor Cyan
$env:NODE_ENV = "development"
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
$env:LOG_LEVEL = "info"

Write-Host "⚠️ SSL certificate verification disabled for development" -ForegroundColor Yellow
Write-Host "✓ Environment configured for development mode" -ForegroundColor Green
Write-Host ""

# Start ingestion worker
Write-Host "Starting Portalis Ingestion Worker..." -ForegroundColor Green
pnpm --filter @xandhopp/ingestion-worker dev
