#!/bin/bash
set -e

echo "Seeding the database..."
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

npx prisma db seed
echo "Seeding complete!"
