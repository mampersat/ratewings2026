#!/usr/bin/env bash
# Sync local Postgres DB to production (Railway).
# WARNING: This DESTROYS all prod data and replaces it with local data.
#
# Usage:
#   PROD_DB_URL=postgresql://... ./scripts/sync-db-to-prod.sh
#
# Or set PROD_DB_URL in .env.local and run without args.

set -e

# Load PROD_DB_URL from .env.local if not set
if [ -z "$PROD_DB_URL" ]; then
  if [ -f .env.local ]; then
    export $(grep '^PROD_DB_URL=' .env.local | xargs)
  fi
fi

if [ -z "$PROD_DB_URL" ]; then
  echo "Error: PROD_DB_URL is not set."
  echo "Add PROD_DB_URL=postgresql://... to .env.local or pass it as an env var."
  exit 1
fi

echo "⚠️  This will OVERWRITE the production database with your local data."
read -p "Type 'yes' to continue: " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "Dumping local DB..."
docker exec ratewings-db pg_dump \
  -U ratewings \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  ratewings > /tmp/ratewings-local.sql

echo "Restoring to production..."
docker run --rm -i postgres:16 \
  psql "$PROD_DB_URL" < /tmp/ratewings-local.sql

rm /tmp/ratewings-local.sql

echo "Done. Production DB is now a copy of local."
