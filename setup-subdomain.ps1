# PowerShell script to setup xandhopp.local subdomain
# Run this as Administrator

Write-Host "Setting up xandhopp.local subdomain..." -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges. Please run PowerShell as Administrator." -ForegroundColor Red
    exit 1
}

# Add entries to hosts file
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsPath

# Check if entries already exist
$entries = @(
    "127.0.0.1 xandhopp.local",
    "127.0.0.1 admin.xandhopp.local", 
    "127.0.0.1 api.xandhopp.local",
    "127.0.0.1 search.xandhopp.local",
    "127.0.0.1 mail.xandhopp.local",
    "127.0.0.1 storage.xandhopp.local"
)

$needsUpdate = $false
foreach ($entry in $entries) {
    if ($hostsContent -notcontains $entry) {
        $needsUpdate = $true
        break
    }
}

if ($needsUpdate) {
    Write-Host "Adding subdomain entries to hosts file..." -ForegroundColor Yellow
    
    # Create backup
    Copy-Item $hostsPath "$hostsPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    # Add entries
    Add-Content $hostsPath ""
    Add-Content $hostsPath "# Xandhopp local subdomains"
    foreach ($entry in $entries) {
        Add-Content $hostsPath $entry
        Write-Host "Added: $entry" -ForegroundColor Green
    }
    
    Write-Host "Hosts file updated successfully!" -ForegroundColor Green
} else {
    Write-Host "Subdomain entries already exist in hosts file." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Subdomain setup complete! You can now access:" -ForegroundColor Green
Write-Host "  Main App:     http://xandhopp.local" -ForegroundColor Cyan
Write-Host "  Admin:        http://admin.xandhopp.local" -ForegroundColor Cyan
Write-Host "  API:          http://api.xandhopp.local" -ForegroundColor Cyan
Write-Host "  Search:       http://search.xandhopp.local" -ForegroundColor Cyan
Write-Host "  Mail:         http://mail.xandhopp.local" -ForegroundColor Cyan
Write-Host "  Storage:      http://storage.xandhopp.local" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the services, run:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.subdomain.yml up -d" -ForegroundColor White
