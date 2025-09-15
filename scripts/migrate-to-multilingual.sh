#!/bin/bash

# Migration script to set up multilingual country information
# This script will:
# 1. Run the database migrations
# 2. Queue translation jobs for existing English content
# 3. Process initial translations

set -e

echo "🌍 Starting multilingual migration for Portalis..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the Portalis root directory"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    print_warning "Docker containers are not running. Starting them..."
    docker-compose up -d
    sleep 10
fi

print_status "Step 1: Running database migrations..."

# Run the new migration
docker-compose exec symfony-api php bin/console doctrine:migrations:migrate --no-interaction

if [ $? -eq 0 ]; then
    print_success "Database migrations completed successfully"
else
    print_error "Database migration failed"
    exit 1
fi

print_status "Step 2: Refreshing materialized views..."

# Refresh the views
docker-compose exec symfony-api php bin/console app:refresh-views

if [ $? -eq 0 ]; then
    print_success "Materialized views refreshed"
else
    print_warning "Failed to refresh views (this might be expected if the function doesn't exist yet)"
fi

print_status "Step 3: Checking translation providers..."

# Check if any translation providers are configured
docker-compose exec symfony-api php bin/console app:process-translations --dry-run

print_status "Step 4: Queueing translation jobs for German translations..."

# Queue translation jobs for all countries to German
docker-compose exec symfony-api php bin/console app:queue-translations de --all --method ai_openai

if [ $? -eq 0 ]; then
    print_success "Translation jobs queued successfully"
else
    print_warning "Failed to queue translation jobs (this is expected if no AI providers are configured)"
fi

print_status "Step 5: Processing translation jobs (if providers are configured)..."

# Process pending translations
docker-compose exec symfony-api php bin/console app:process-translations --limit 5

if [ $? -eq 0 ]; then
    print_success "Translation processing completed"
else
    print_warning "Translation processing failed or no jobs to process"
fi

print_status "Step 6: Testing the new multilingual API..."

# Test the API with German language
echo "Testing API with German language preference..."
curl -s -H "Accept-Language: de-DE,de;q=0.9,en;q=0.8" \
     http://localhost:8000/api/countries/germany/public | jq '.language, .overview' 2>/dev/null || echo "API test failed or jq not available"

print_success "Migration completed!"

echo ""
echo "📋 Next steps:"
echo "1. Configure AI translation providers by setting environment variables:"
echo "   - OPENAI_API_KEY for OpenAI GPT translations"
echo "   - GOOGLE_TRANSLATE_API_KEY for Google Translate"
echo "   - AZURE_TRANSLATOR_KEY for Azure Translator"
echo ""
echo "2. Run translation processing:"
echo "   docker-compose exec symfony-api php bin/console app:process-translations"
echo ""
echo "3. Monitor translation jobs:"
echo "   docker-compose exec symfony-api php bin/console app:queue-translations de --all --dry-run"
echo ""
echo "4. Test the multilingual API:"
echo "   curl -H 'Accept-Language: de' http://localhost:8000/api/countries/germany/public"
echo ""

print_success "🌍 Multilingual support is now active!"
