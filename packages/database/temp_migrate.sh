#!/bin/bash

# Replace pooler with direct connection
DIRECT_URL=$(echo $DATABASE_URL | sed 's/pooler\.supabase\.com:6543/db\.xqysbuqrgwbjmfjszzah\.supabase\.co:5432/')

# Export and run migrate
export DATABASE_URL="$DIRECT_URL"

echo "Using direct connection..."
echo "Running db push..."

npx prisma db push --skip-generate --schema=./prisma/schema.prisma

echo "Done!"
