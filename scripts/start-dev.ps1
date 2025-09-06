# PowerShell script to start development servers
Write-Host "Starting Portalis development servers..." -ForegroundColor Green

# Start web app in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; Write-Host 'Starting Web App on http://localhost:3000...' -ForegroundColor Cyan; pnpm dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start admin app in new window  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\admin; Write-Host 'Starting Admin App on http://localhost:3001...' -ForegroundColor Cyan; pnpm dev"

Write-Host ""
Write-Host "Development servers starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Access your applications:" -ForegroundColor Cyan
Write-Host "- Web App: http://localhost:3000" -ForegroundColor White
Write-Host "- Admin App: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Note: The servers are starting in separate windows." -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
