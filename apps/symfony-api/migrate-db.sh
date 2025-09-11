#!/bin/bash

# Set database URL for migration
export DATABASE_URL="postgresql://xandhopp:xandhopp@localhost:5433/xandhopp?serverVersion=15&charset=utf8"

# Run migration
cd apps/symfony-api
php bin/console doctrine:migrations:migrate --no-interaction

echo "Migration completed!"
