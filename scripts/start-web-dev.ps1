# PowerShell script to start the web frontend
Write-Host "🚀 Starting Portalis Web Frontend" -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:NODE_ENV = "development"
$env:NEXT_PUBLIC_API_URL = "http://localhost:8080"

Write-Host "✓ Environment configured for development" -ForegroundColor Green
Write-Host "📍 API URL: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🌐 Web URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Navigate to web app and start
Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
Set-Location "apps/web"
pnpm dev
