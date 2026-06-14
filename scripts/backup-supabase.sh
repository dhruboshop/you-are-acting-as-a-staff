#!/usr/bin/env sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

mkdir -p backups
timestamp="$(date +%Y%m%d-%H%M%S)"
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges > "backups/supabase-$timestamp.dump"
echo "Created backups/supabase-$timestamp.dump"
