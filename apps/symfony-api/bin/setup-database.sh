#!/usr/bin/env bash
set -euo pipefail

echo "Setting up database for Xandhopp..."

# Set database URL
export DATABASE_URL='postgresql://xandhopp:xandhopp@localhost:5433/xandhopp'

# Create database if it doesn't exist
echo "Creating database..."
php bin/console doctrine:database:create --if-not-exists

# Run migrations
echo "Running migrations..."
php bin/console doctrine:migrations:migrate -n

# Seed freemium data
echo "Seeding freemium data..."
php bin/console app:seed:freemium

echo "Database setup completed!"
