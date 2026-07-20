#!/bin/bash
# Exit on error
set -e

echo "Starting Database Migration against AWS RDS..."

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

# Run the Prisma migration deploy command
echo "Running npx prisma migrate deploy..."
npx prisma migrate deploy

echo "Database migration completed successfully!"
