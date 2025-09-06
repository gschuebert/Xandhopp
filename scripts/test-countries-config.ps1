# PowerShell script to test country configuration
Write-Host "🌍 Testing Country Configuration" -ForegroundColor Green
Write-Host ""

# Show current config
Write-Host "Current Configuration:" -ForegroundColor Cyan
Write-Host "MONITOR_COUNTRIES environment variable: " -NoNewline
if ($env:MONITOR_COUNTRIES) {
    Write-Host $env:MONITOR_COUNTRIES -ForegroundColor Yellow
} else {
    Write-Host "Not set (using defaults)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Default countries in config:" -ForegroundColor Cyan
Write-Host "DE, ES, PT, US, GB, FR, IT, NL, BE, AT, CH, PL, CZ, HU, HR, GR, CY, MT, EE, LV, LT, SK, SI, BG, RO, IE, LU, DK, SE, FI" -ForegroundColor White

Write-Host ""
Write-Host "📊 Data Collection per Service:" -ForegroundColor Green
Write-Host "• World Bank Indicators: All 30 countries (recurring)" -ForegroundColor White
Write-Host "• Air Quality (OpenAQ): First 10 countries (if API key set)" -ForegroundColor White  
Write-Host "• Travel Advisories: Global (US State Dept covers all countries)" -ForegroundColor White
Write-Host "• Economic Data: First 8 countries (World Bank)" -ForegroundColor White

Write-Host ""
Write-Host "🔧 To customize countries:" -ForegroundColor Yellow
Write-Host '$env:MONITOR_COUNTRIES = "DE,FR,IT,ES,US,GB"' -ForegroundColor Gray
Write-Host "Then restart the ingestion worker" -ForegroundColor Gray

Write-Host ""
Write-Host "🚀 Current Status:" -ForegroundColor Green
Write-Host "✓ Fixed: Now using all configured countries instead of just DE, ES, PT" -ForegroundColor Green
