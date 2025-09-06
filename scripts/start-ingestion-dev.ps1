# PowerShell script to start Ingestion Worker with development settings
Write-Host "🔧 Starting Portalis Ingestion Worker (Development Mode)" -ForegroundColor Green

# Set development environment variables
$env:NODE_ENV = "development"
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"  # Disable SSL verification for development
$env:LOG_LEVEL = "info"

# Optional: Set API keys if available
if ($env:OPENAQ_API_KEY) {
    Write-Host "✓ OpenAQ API key configured" -ForegroundColor Green
} else {
    Write-Host "⚠️ OpenAQ API key not set - air quality data disabled" -ForegroundColor Yellow
}

Write-Host "⚠️ SSL certificate verification disabled for development" -ForegroundColor Yellow
Write-Host ""

# Start the ingestion worker
Write-Host "Starting ingestion worker..." -ForegroundColor Cyan
pnpm --filter @portalis/ingestion-worker dev
