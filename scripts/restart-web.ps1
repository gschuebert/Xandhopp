# PowerShell script to restart the web development server
Write-Host "Restarting Web App development server..." -ForegroundColor Green

# Stop any existing processes on port 3000
Write-Host "Stopping any processes on port 3000..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | ForEach-Object { 
            $processId = (Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Id
            if ($processId) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped process $processId" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "No processes found on port 3000" -ForegroundColor Green
}

Start-Sleep -Seconds 2

# Start the web app
Write-Host "Starting Web App..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; Write-Host 'Starting Web App on http://localhost:3000...' -ForegroundColor Cyan; pnpm dev"

Write-Host ""
Write-Host "Web App is starting..." -ForegroundColor Green
Write-Host "Access it at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Test URLs:" -ForegroundColor Cyan
Write-Host "- http://localhost:3000/test" -ForegroundColor White
Write-Host "- http://localhost:3000/en" -ForegroundColor White
Write-Host "- http://localhost:3000/de" -ForegroundColor White
