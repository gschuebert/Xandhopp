# PowerShell script to test the Portalis data pipeline
Write-Host "Testing Portalis Data Pipeline..." -ForegroundColor Green

# Function to test an endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -ErrorAction Stop
        Write-Host "✓ $Name - OK" -ForegroundColor Green
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✓ $Name - OK (Status: $statusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ $Name - FAILED (Status: $statusCode)" -ForegroundColor Red
            return $false
        }
    }
}

# Function to test service health
function Test-ServiceHealth {
    param(
        [string]$Name,
        [string]$Host,
        [int]$Port,
        [int]$TimeoutSeconds = 5
    )
    
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $result = $tcpClient.BeginConnect($Host, $Port, $null, $null)
        $success = $result.AsyncWaitHandle.WaitOne($TimeoutSeconds * 1000)
        
        if ($success -and $tcpClient.Connected) {
            Write-Host "✓ $Name - Service is running" -ForegroundColor Green
            $tcpClient.Close()
            return $true
        } else {
            Write-Host "✗ $Name - Service not reachable" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ $Name - Connection failed" -ForegroundColor Red
        return $false
    }
}

Write-Host ""
Write-Host "1. Testing Infrastructure Services..." -ForegroundColor Cyan

$services = @(
    @{ Name = "PostgreSQL"; Host = "localhost"; Port = 5432 },
    @{ Name = "Redis"; Host = "localhost"; Port = 6379 },
    @{ Name = "ClickHouse HTTP"; Host = "localhost"; Port = 8123 },
    @{ Name = "Meilisearch"; Host = "localhost"; Port = 7700 },
    @{ Name = "MinIO"; Host = "localhost"; Port = 9000 }
)

$serviceResults = @()
foreach ($service in $services) {
    $result = Test-ServiceHealth -Name $service.Name -Host $service.Host -Port $service.Port
    $serviceResults += $result
}

Write-Host ""
Write-Host "2. Testing Application Services..." -ForegroundColor Cyan

$appResults = @()
$appResults += Test-Endpoint -Name "Web App" -Url "http://localhost:3000/simple"
$appResults += Test-Endpoint -Name "Admin App" -Url "http://localhost:3001"

Write-Host ""
Write-Host "3. Testing Data API Endpoints..." -ForegroundColor Cyan

$apiResults = @()
$apiResults += Test-Endpoint -Name "Health Check" -Url "http://localhost:3000/api/health"
$apiResults += Test-Endpoint -Name "Countries List" -Url "http://localhost:3000/api/countries"

Write-Host ""
Write-Host "4. Testing ClickHouse Data..." -ForegroundColor Cyan

try {
    # Test if we can reach ClickHouse directly
    $chResponse = Invoke-RestMethod -Uri "http://localhost:8123/ping" -Method GET -ErrorAction Stop
    Write-Host "✓ ClickHouse Direct - OK" -ForegroundColor Green
    
} catch {
    Write-Host "✗ ClickHouse Direct - FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Summary" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

$totalServices = $serviceResults.Count
$healthyServices = ($serviceResults | Where-Object { $_ -eq $true }).Count

$totalApps = $appResults.Count
$healthyApps = ($appResults | Where-Object { $_ -eq $true }).Count

$totalApis = $apiResults.Count
$healthyApis = ($apiResults | Where-Object { $_ -eq $true }).Count

Write-Host "Infrastructure: $healthyServices/$totalServices services healthy" -ForegroundColor $(if ($healthyServices -eq $totalServices) { "Green" } else { "Yellow" })
Write-Host "Applications: $healthyApps/$totalApps apps running" -ForegroundColor $(if ($healthyApps -eq $totalApps) { "Green" } else { "Yellow" })
Write-Host "APIs: $healthyApis/$totalApis endpoints responding" -ForegroundColor $(if ($healthyApis -eq $totalApis) { "Green" } else { "Yellow" })

if ($healthyServices -eq $totalServices -and $healthyApps -eq $totalApps -and $healthyApis -eq $totalApis) {
    Write-Host ""
    Write-Host "🎉 All systems operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "- Wait for ingestion worker to collect initial data" -ForegroundColor White
    Write-Host "- Check data endpoints: pnpm run data:countries" -ForegroundColor White
    Write-Host "- View country snapshot: pnpm run data:snapshot" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️ Some issues detected. Check the logs above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Cyan
    Write-Host "- Run: docker-compose up -d" -ForegroundColor White
    Write-Host "- Wait longer for services to start" -ForegroundColor White
    Write-Host "- Check .env.local configuration" -ForegroundColor White
}