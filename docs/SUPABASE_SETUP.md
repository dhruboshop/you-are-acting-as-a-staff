# Supabase Setup

## 1. Create Account

Screenshot placeholder: `docs/screenshots/supabase-new-project.png`

1. Go to Supabase.
2. Create a free account.
3. Create a new project.
4. Save the project password in a password manager.

## 2. Get Project Values

Screenshot placeholder: `docs/screenshots/supabase-api-settings.png`

1. Open Project Settings.
2. Open API.
3. Copy Project URL into `SUPABASE_URL`.
4. Copy anon public key into `SUPABASE_ANON_KEY`.
5. Copy service role key into `SUPABASE_SERVICE_ROLE_KEY`.

## 3. Run Migrations

1. Open SQL Editor.
2. Paste `supabase/migrations/001_initial_schema.sql`.
3. Click Run.

## 4. Optional Seed

After signing in once, copy your user ID from Authentication > Users. Replace the UUID in `supabase/seed.sql`, then run it in SQL Editor.
