# PowerShell setup script for Windows
Write-Host "Setting up Portalis development environment..." -ForegroundColor Green

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

# Start Docker services
Write-Host "Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Setup database
Write-Host "Setting up database..." -ForegroundColor Yellow
docker-compose exec -T api php bin/console doctrine:database:create --if-not-exists
docker-compose exec -T api php bin/console doctrine:migrations:migrate -n
docker-compose exec -T api php bin/console app:seed:demo

# Generate API types
Write-Host "Generating API types..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
pnpm --filter @portalis/shared run generate:openapi

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your applications:" -ForegroundColor Cyan
Write-Host "- Web App: http://localhost:3000" -ForegroundColor White
Write-Host "- Admin Panel: http://localhost:3001 (admin@portalis.com / admin)" -ForegroundColor White
Write-Host "- API Docs: http://localhost:8080/docs" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "- pnpm run docker:up    - Start services" -ForegroundColor White
Write-Host "- pnpm run docker:down  - Stop services" -ForegroundColor White
Write-Host "- pnpm run docker:logs  - View logs" -ForegroundColor White
Write-Host "- pnpm dev              - Start development servers" -ForegroundColor White