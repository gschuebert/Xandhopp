# Simple data test
Write-Host "Testing ClickHouse connection..." -ForegroundColor Green

try {
    $result = docker exec portalis-clickhouse-1 clickhouse-client --host 127.0.0.1 --port 9000 --query "SELECT 1"
    Write-Host "ClickHouse response: $result" -ForegroundColor White
    
    if ($result -eq "1") {
        Write-Host "ClickHouse is working!" -ForegroundColor Green
        
        # Apply schema
        Write-Host "Applying schema..." -ForegroundColor Cyan
        Get-Content "packages\db-clickhouse\schema.sql" | docker exec -i portalis-clickhouse-1 clickhouse-client --host 127.0.0.1 --port 9000 --multiquery
        
        Write-Host "Schema applied successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "ClickHouse not ready: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Portal will work with demo data!" -ForegroundColor Cyan
}
