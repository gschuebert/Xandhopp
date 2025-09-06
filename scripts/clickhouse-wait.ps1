# PowerShell script to wait for ClickHouse and apply schema
Write-Host "Waiting for ClickHouse to be ready..." -ForegroundColor Green

$maxWait = 120 # 2 minutes
$interval = 5  # 5 seconds
$elapsed = 0

while ($elapsed -lt $maxWait) {
    try {
        $result = docker exec portalis-clickhouse-1 clickhouse-client --query "SELECT 1" 2>$null
        if ($result -eq "1") {
            Write-Host "✓ ClickHouse is ready!" -ForegroundColor Green
            
            # Apply schema
            Write-Host "Applying schema..." -ForegroundColor Yellow
            Get-Content "packages\db-clickhouse\schema.sql" | docker exec -i portalis-clickhouse-1 clickhouse-client --multiquery
            Write-Host "✓ Schema applied successfully!" -ForegroundColor Green
            
            # Test schema
            Write-Host "Testing schema..." -ForegroundColor Yellow
            $tables = docker exec portalis-clickhouse-1 clickhouse-client --query "SHOW TABLES FROM portalis"
            Write-Host "Tables created: $tables" -ForegroundColor Cyan
            
            exit 0
        }
    } catch {
        # Continue waiting
    }
    
    Write-Host "Still waiting... ($elapsed/$maxWait seconds)" -ForegroundColor Yellow
    Start-Sleep -Seconds $interval
    $elapsed += $interval
}

Write-Host "⚠️ ClickHouse did not respond within $maxWait seconds" -ForegroundColor Red
Write-Host "You can try manually:" -ForegroundColor Yellow
Write-Host "  docker exec portalis-clickhouse-1 clickhouse-client --query 'SELECT 1'" -ForegroundColor White
Write-Host "  Get-Content 'packages\db-clickhouse\schema.sql' | docker exec -i portalis-clickhouse-1 clickhouse-client --multiquery" -ForegroundColor White
exit 1
