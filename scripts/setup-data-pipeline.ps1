# PowerShell script to set up the complete Portalis data pipeline
Write-Host "Setting up Portalis Data Pipeline..." -ForegroundColor Green

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-CommandExists "docker")) {
    Write-Host "Error: Docker is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if (-not (Test-CommandExists "pnpm")) {
    Write-Host "Error: pnpm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "Please edit .env.local with your configuration" -ForegroundColor Cyan
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Build packages
Write-Host "Building packages..." -ForegroundColor Yellow
pnpm --filter @portalis/connectors build

# Start infrastructure services
Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
docker-compose up -d postgres redis meilisearch minio clickhouse

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Set up ClickHouse schema
Write-Host "Setting up ClickHouse schema..." -ForegroundColor Yellow
try {
    $containerName = docker ps --filter "name=clickhouse" --format "{{.Names}}" | Select-Object -First 1
    if ($containerName) {
        Get-Content "packages\db-clickhouse\schema.sql" | docker exec -i $containerName clickhouse-client --multiquery
        Write-Host "ClickHouse schema applied successfully" -ForegroundColor Green
    } else {
        Write-Host "Warning: ClickHouse container not found" -ForegroundColor Red
    }
} catch {
    Write-Host "Warning: Failed to apply ClickHouse schema - $($_.Exception.Message)" -ForegroundColor Red
}

# Set up PostgreSQL (existing)
Write-Host "Setting up PostgreSQL database..." -ForegroundColor Yellow
try {
    pnpm run db:create
    pnpm run db:migrate
    Write-Host "PostgreSQL database set up successfully" -ForegroundColor Green
} catch {
    Write-Host "Warning: PostgreSQL setup failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Start the ingestion worker in background
Write-Host "Starting ingestion worker..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Starting Ingestion Worker...' -ForegroundColor Green; pnpm run ingestion:dev"

# Start frontend applications
Write-Host "Starting frontend applications..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start web app
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\web'; Write-Host 'Starting Web App...' -ForegroundColor Green; pnpm dev"

# Start admin app
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\admin'; Write-Host 'Starting Admin App...' -ForegroundColor Green; pnpm dev"

Write-Host ""
Write-Host "Portalis Data Pipeline Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Services starting up:" -ForegroundColor Cyan
Write-Host "- Web App: http://localhost:3000" -ForegroundColor White
Write-Host "- Admin App: http://localhost:3001" -ForegroundColor White
Write-Host "- API Health: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "- ClickHouse UI: https://localhost:8443 (may take a minute)" -ForegroundColor White
Write-Host ""
Write-Host "Data API Endpoints:" -ForegroundColor Cyan
Write-Host "- Countries: http://localhost:3000/api/countries" -ForegroundColor White
Write-Host "- Country Snapshot: http://localhost:3000/api/country/DE/snapshot" -ForegroundColor White
Write-Host "- Indicators: http://localhost:3000/api/country/DE/indicators" -ForegroundColor White
Write-Host "- Air Quality: http://localhost:3000/api/country/DE/airquality" -ForegroundColor White
Write-Host ""
Write-Host "Wait 2-3 minutes for initial data ingestion to complete." -ForegroundColor Yellow
Write-Host "Use 'pnpm run data:health' to check system status." -ForegroundColor Cyan
