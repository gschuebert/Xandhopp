# PowerShell script to start Portalis locally (without Docker for frontend)
Write-Host "Starting Portalis development environment locally..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Start supporting services (database, etc.)
Write-Host "Starting supporting services..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d postgres redis meilisearch minio

# Wait a bit for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Symfony API locally
Write-Host "Starting Symfony API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\symfony-api; php -S localhost:8080 -t public"

# Wait for API to start
Start-Sleep -Seconds 5

# Setup database (try a few times)
Write-Host "Setting up database..." -ForegroundColor Yellow
$maxAttempts = 3
$attempt = 1

while ($attempt -le $maxAttempts) {
    try {
        Write-Host "Database setup attempt $attempt..." -ForegroundColor Yellow
        
        # Create database
        Set-Location apps\symfony-api
        php bin\console doctrine:database:create --if-not-exists
        
        # Run migrations
        php bin\console doctrine:migrations:migrate -n
        
        # Seed demo data
        php bin\console app:seed:demo
        
        Set-Location ..\..
        Write-Host "Database setup successful!" -ForegroundColor Green
        break
    }
    catch {
        Write-Host "Database setup attempt $attempt failed, retrying..." -ForegroundColor Yellow
        $attempt++
        Start-Sleep -Seconds 5
    }
}

if ($attempt -gt $maxAttempts) {
    Write-Host "Database setup failed after $maxAttempts attempts" -ForegroundColor Red
}

# Generate API types
Write-Host "Generating API types..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
try {
    pnpm --filter @portalis/shared run generate:openapi
    Write-Host "API types generated successfully!" -ForegroundColor Green
}
catch {
    Write-Host "API type generation failed - you can run this manually later" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor Cyan
Write-Host "- Symfony API: http://localhost:8080" -ForegroundColor White
Write-Host "- API Docs: http://localhost:8080/docs" -ForegroundColor White
Write-Host "- PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "- Redis: localhost:6379" -ForegroundColor White
Write-Host "- Meilisearch: localhost:7700" -ForegroundColor White
Write-Host "- MinIO: localhost:9000" -ForegroundColor White
Write-Host ""
Write-Host "To start frontend applications, open new terminals and run:" -ForegroundColor Cyan
Write-Host "- Terminal 1: cd apps\web && pnpm dev" -ForegroundColor White
Write-Host "- Terminal 2: cd apps\admin && pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "Or run 'pnpm dev' from the root to start both frontends" -ForegroundColor Cyan
