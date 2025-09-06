Write-Host "Starting Portalis System..." -ForegroundColor Green

Write-Host "1. Starting Docker services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "2. Waiting for services..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host "3. Building connectors..." -ForegroundColor Cyan
pnpm --filter @portalis/connectors build

Write-Host "4. Starting web applications..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; pnpm dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\admin; pnpm dev"

Write-Host ""
Write-Host "System started!" -ForegroundColor Green
Write-Host "Web App: http://localhost:3000/simple" -ForegroundColor White
Write-Host "Admin App: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "To start ingestion worker:" -ForegroundColor Yellow
Write-Host "  pnpm run ingestion:dev" -ForegroundColor White
