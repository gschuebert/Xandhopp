# Demo Data Import Script for Portalis
Write-Host "🚀 Importing Demo Data into Portalis..." -ForegroundColor Green

# Wait for ClickHouse to be ready
Write-Host "⏳ Waiting for ClickHouse to be ready..." -ForegroundColor Yellow
$maxAttempts = 12
$attempt = 0

do {
    $attempt++
    try {
        $result = docker exec portalis-clickhouse-1 clickhouse-client --query "SELECT 1" 2>$null
        if ($result -eq "1") {
            Write-Host "✅ ClickHouse is ready!" -ForegroundColor Green
            break
        }
    } catch {
        # ClickHouse not ready yet
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Host "⚠️ ClickHouse not ready yet - continuing with web-only demo" -ForegroundColor Yellow
        Write-Host "The portal will work with demo data even without ClickHouse!" -ForegroundColor Cyan
        exit 0
    }
    
    Write-Host "Attempt $attempt/$maxAttempts - waiting 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
} while ($true)

# Apply schema
Write-Host "📊 Creating database schema..." -ForegroundColor Cyan
try {
    Get-Content "packages\db-clickhouse\schema.sql" | docker exec -i portalis-clickhouse-1 clickhouse-client --multiquery
    Write-Host "✅ Schema applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Schema creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify tables
Write-Host "🔍 Verifying tables..." -ForegroundColor Cyan
$tables = docker exec portalis-clickhouse-1 clickhouse-client --query "SHOW TABLES FROM portalis"
Write-Host "Created tables: $tables" -ForegroundColor White

# Import some demo data
Write-Host "📈 Importing demo data..." -ForegroundColor Cyan

# Sample indicators data
$demoIndicators = @"
INSERT INTO portalis.indicators (country_iso2, source, indicator_code, period, value, meta) VALUES
('DE', 'worldbank', 'NY.GDP.PCAP.KD', '2023-01-01', 46259.5, '{}'),
('ES', 'worldbank', 'NY.GDP.PCAP.KD', '2023-01-01', 27057.2, '{}'),
('US', 'worldbank', 'NY.GDP.PCAP.KD', '2023-01-01', 70248.6, '{}'),
('GB', 'worldbank', 'NY.GDP.PCAP.KD', '2023-01-01', 45850.4, '{}'),
('PT', 'worldbank', 'NY.GDP.PCAP.KD', '2023-01-01', 24252.9, '{}')
"@

# Sample advisories data  
$demoAdvisories = @"
INSERT INTO portalis.advisories (country_iso2, source, level, headline, url, published_at, payload) VALUES
('DE', 'us_state_dept', 1, 'Exercise normal precautions in Germany', 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/germany-travel-advisory.html', '2024-01-15 10:00:00', '{}'),
('ES', 'us_state_dept', 1, 'Exercise normal precautions in Spain', 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/spain-travel-advisory.html', '2024-01-15 10:00:00', '{}'),
('US', 'fcdo', 1, 'No specific travel restrictions', 'https://www.gov.uk/foreign-travel-advice/usa', '2024-01-15 10:00:00', '{}')
"@

try {
    echo $demoIndicators | docker exec -i portalis-clickhouse-1 clickhouse-client --multiquery
    echo $demoAdvisories | docker exec -i portalis-clickhouse-1 clickhouse-client --multiquery
    Write-Host "✅ Demo data imported successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Demo data import failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Verify data
Write-Host "🔍 Verifying imported data..." -ForegroundColor Cyan
$indicatorCount = docker exec portalis-clickhouse-1 clickhouse-client --query "SELECT COUNT(*) FROM portalis.indicators"
$advisoryCount = docker exec portalis-clickhouse-1 clickhouse-client --query "SELECT COUNT(*) FROM portalis.advisories"

Write-Host "📊 Data Summary:" -ForegroundColor White
Write-Host "  - Indicators: $indicatorCount rows" -ForegroundColor White  
Write-Host "  - Advisories: $advisoryCount rows" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Demo data import completed!" -ForegroundColor Green
Write-Host "🌍 Portal should now show live data at:" -ForegroundColor Cyan
Write-Host "   http://localhost:3004/en" -ForegroundColor White
Write-Host "   http://localhost:3004/country/DE" -ForegroundColor White
