# PowerShell script to test both apps
Write-Host "Testing Portalis applications..." -ForegroundColor Green

Write-Host ""
Write-Host "Testing Web App (Port 3000)..." -ForegroundColor Cyan
try {
    $webResponse = Invoke-WebRequest -Uri "http://localhost:3000/test" -UseBasicParsing -TimeoutSec 5
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "✅ Web App is running on http://localhost:3000" -ForegroundColor Green
        Write-Host "   Test page: http://localhost:3000/test" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Web App is not responding on port 3000" -ForegroundColor Red
    Write-Host "   Make sure to start it with: cd apps\web && pnpm dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Testing Admin App (Port 3001)..." -ForegroundColor Cyan
try {
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5
    if ($adminResponse.StatusCode -eq 200) {
        Write-Host "✅ Admin App is running on http://localhost:3001" -ForegroundColor Green
        Write-Host "   Login: admin@portalis.com / admin" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Admin App is not responding on port 3001" -ForegroundColor Red
    Write-Host "   Make sure to start it with: cd apps\admin && pnpm dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Manual start commands:" -ForegroundColor Cyan
Write-Host "Web App:   cd apps\web && pnpm dev" -ForegroundColor White
Write-Host "Admin App: cd apps\admin && pnpm dev" -ForegroundColor White
