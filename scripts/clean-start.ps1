# PowerShell script to cleanly start the web app
Write-Host "Clean starting Portalis Web App..." -ForegroundColor Green

# Kill any processes on ports 3000
Write-Host "Cleaning up ports..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | ForEach-Object { 
            $processId = (Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Id
            if ($processId) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped process $processId on port 3000" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "Port 3000 is clean" -ForegroundColor Green
}

# Clean Next.js cache
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path "apps\web\.next") {
    Remove-Item -Recurse -Force "apps\web\.next" -ErrorAction SilentlyContinue
    Write-Host "Cleared .next directory" -ForegroundColor Green
}

# Wait a moment
Start-Sleep -Seconds 2

# Start fresh
Write-Host "Starting Web App with clean state..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; Write-Host 'Starting CLEAN Web App...' -ForegroundColor Green; pnpm dev"

Write-Host ""
Write-Host "Web App starting with fixed configuration!" -ForegroundColor Green
Write-Host ""
Write-Host "Test URLs (wait 10-15 seconds):" -ForegroundColor Cyan
Write-Host "- http://localhost:3000 (redirects to /simple)" -ForegroundColor White
Write-Host "- http://localhost:3000/simple (main page)" -ForegroundColor White
Write-Host "- http://localhost:3000/test (basic test)" -ForegroundColor White
Write-Host ""
Write-Host "The reload loop should be FIXED now!" -ForegroundColor Green
