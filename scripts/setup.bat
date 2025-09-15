@echo off
echo 🚀 Setting up Portalis development environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo ✅ Docker is running

REM Install dependencies
echo 📦 Installing dependencies...
call pnpm install

REM Start Docker services
echo 🐳 Starting Docker services...
call docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Setup database
echo 🗄️ Setting up database...
call docker-compose exec -T api php bin/console doctrine:database:create --if-not-exists
call docker-compose exec -T api php bin/console doctrine:migrations:migrate -n
call docker-compose exec -T api php bin/console app:seed:demo

REM Generate API types
echo 🔧 Generating API types...
timeout /t 5 /nobreak >nul
call pnpm --filter @xandhopp/shared run generate:openapi

echo.
echo 🎉 Setup complete!
echo.
echo Access your applications:
echo • Web App: http://localhost:3000
echo • Admin Panel: http://localhost:3001 (admin@xandhopp.com / admin)
echo • API Docs: http://localhost:8080/docs
echo.
echo Useful commands:
echo • pnpm run docker:up    - Start services
echo • pnpm run docker:down  - Stop services
echo • pnpm run docker:logs  - View logs
echo • pnpm dev              - Start development servers
pause
