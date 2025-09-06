# Migrate Portalis to WSL Ubuntu
Write-Host "🚀 Migrating Portalis to WSL Ubuntu..." -ForegroundColor Green

# Stop current processes
Write-Host "⏹️ Stopping current processes..." -ForegroundColor Yellow
try {
    Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    docker-compose down
} catch {
    Write-Host "Processes stopped" -ForegroundColor Gray
}

# Create destination directory in WSL
Write-Host "📁 Creating destination directory..." -ForegroundColor Cyan
wsl -d Ubuntu -e bash -c "sudo mkdir -p /var/www && sudo chown $USER:$USER /var/www"

# Copy project to WSL
Write-Host "📦 Copying project files to WSL Ubuntu..." -ForegroundColor Cyan
Write-Host "Source: D:\dev\Portalis" -ForegroundColor Gray
Write-Host "Destination: \\wsl.localhost\Ubuntu\var\www\Portalis" -ForegroundColor Gray

# Use robocopy for better Windows to WSL transfer
robocopy "D:\dev\Portalis" "\\wsl.localhost\Ubuntu\var\www\Portalis" /E /XD node_modules .next dist .git /XF *.log

Write-Host ""
Write-Host "✅ Project copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next steps in WSL Ubuntu:" -ForegroundColor Cyan
Write-Host "1. Open Ubuntu terminal" -ForegroundColor White
Write-Host "2. cd /var/www/Portalis" -ForegroundColor White
Write-Host "3. chmod +x scripts/ubuntu-quick-setup.sh" -ForegroundColor White
Write-Host "4. ./scripts/ubuntu-quick-setup.sh" -ForegroundColor White
Write-Host ""
Write-Host "🌍 Then your portal will work perfectly!" -ForegroundColor Green
