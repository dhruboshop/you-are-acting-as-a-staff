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

Migrations are deployed from GitHub Actions. Do not paste SQL manually.

1. Add the Supabase GitHub secrets listed in `docs/GITOPS_DEPLOYMENT.md`.
2. Push to `main`.
3. Open GitHub Actions.
4. Confirm `GitOps Deploy` or `Supabase Migrations` finishes successfully.

## 4. Optional Seed

Seed data is optional and should not be run in production. For development-only seed data, create a migration or a controlled script and commit it to Git.
