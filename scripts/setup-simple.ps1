# PowerShell setup script for Windows (simplified version)
Write-Host "Setting up Portalis development environment (simplified)..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Start Docker services (backend only)
Write-Host "Starting backend services..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Setup database
Write-Host "Setting up database..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml exec -T api php bin/console doctrine:database:create --if-not-exists
docker-compose -f docker-compose.simple.yml exec -T api php bin/console doctrine:migrations:migrate -n
docker-compose -f docker-compose.simple.yml exec -T api php bin/console app:seed:demo

# Generate API types
Write-Host "Generating API types..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
pnpm --filter @portalis/shared run generate:openapi

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend services are running:" -ForegroundColor Cyan
Write-Host "- API: http://localhost:8080" -ForegroundColor White
Write-Host "- API Docs: http://localhost:8080/docs" -ForegroundColor White
Write-Host "- Database: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "To start frontend applications:" -ForegroundColor Cyan
Write-Host "- pnpm dev (starts both web and admin)" -ForegroundColor White
Write-Host ""
Write-Host "Access URLs after running 'pnpm dev':" -ForegroundColor Cyan
Write-Host "- Web App: http://localhost:3000" -ForegroundColor White
Write-Host "- Admin Panel: http://localhost:3001 (admin@portalis.com / admin)" -ForegroundColor White
