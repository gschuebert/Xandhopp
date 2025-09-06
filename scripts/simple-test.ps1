# Simple test for Portalis system
Write-Host "Testing Portalis System..." -ForegroundColor Green

Write-Host "1. Checking Docker containers..." -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "2. Testing Web App..." -ForegroundColor Cyan
try {
    $response = curl -Uri "http://localhost:3000/en" -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Portal is working!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Web app not responding" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Portalis Portal Status:" -ForegroundColor Green
Write-Host "- Main Portal: http://localhost:3000/en" -ForegroundColor White
Write-Host "- Germany: http://localhost:3000/country/DE" -ForegroundColor White
Write-Host "- Spain: http://localhost:3000/country/ES" -ForegroundColor White
Write-Host ""
Write-Host "The portal works with demo data - ClickHouse is optional!" -ForegroundColor Cyan
