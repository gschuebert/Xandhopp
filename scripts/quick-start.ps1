# Quick start script for Portalis
Write-Host "Starting Portalis Portal..." -ForegroundColor Green

# Kill any existing processes on ports 3000-3010
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
for ($port = 3000; $port -le 3010; $port++) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        $pid = $process.OwningProcess
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped process on port $port" -ForegroundColor Yellow
    }
}

# Wait a moment
Start-Sleep -Seconds 2

# Start web app
Write-Host "Starting web app..." -ForegroundColor Cyan
Set-Location "apps\web"
Start-Process powershell -ArgumentList "-Command", "pnpm dev" -WindowStyle Minimized

# Wait for startup
Start-Sleep -Seconds 5

# Check which port it's running on
Write-Host "Checking available ports..." -ForegroundColor Cyan
for ($port = 3000; $port -le 3010; $port++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/en" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Portal is running on http://localhost:$port/en" -ForegroundColor Green
            Write-Host "✅ Germany: http://localhost:$port/country/DE" -ForegroundColor Green
            Write-Host "✅ Spain: http://localhost:$port/country/ES" -ForegroundColor Green
            break
        }
    } catch {
        # Port not responding, continue
    }
}

Write-Host "Done! Portal should be accessible now." -ForegroundColor Green
