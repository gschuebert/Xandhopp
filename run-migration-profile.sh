#!/bin/bash
set -euo pipefail

echo "🚀 Starting PostgreSQL and running profile migration..."

# Start PostgreSQL
echo "📦 Starting PostgreSQL..."
docker compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run the migration
echo "🔄 Running profile migration..."
cd apps/symfony-api
DATABASE_URL="postgresql://xandhopp:xandhopp@localhost:5433/xandhopp?serverVersion=15&charset=utf8" php bin/console doctrine:migrations:migrate --no-interaction

echo "✅ Profile migration completed successfully!"
echo ""
echo "📋 New fields added to users table:"
echo "   - Profile fields: firstName, lastName, dateOfBirth, nationality, currentCountry, currentCity"
echo "   - Professional fields: profession, company, website, linkedin, bio"
echo "   - Address fields: addressLine1, addressLine2, city, state, postalCode, country"
echo "   - Preferences: preferredLanguage, timezone, emailNotifications, marketingEmails, profilePublic"
echo ""
echo "🎉 Registration and profile system is now ready!"
