# GitOps Deployment

This project treats Git as the source of truth for application code, backend deployment, Android builds, and Supabase schema migrations.

No SQL should be pasted manually into Supabase after the initial project exists. Database changes must be committed as SQL files under `supabase/migrations/`.

## Target Flow

```text
git push
↓
CI
↓
Run backend tests and lint
↓
Validate Supabase migrations
↓
Deploy Supabase schema
↓
Deploy Render backend
↓
Build Android APK artifacts
```

## One-Time Manual Setup

Only these steps are manual:

1. Create a Supabase project.
2. Create a Render Web Service connected to this GitHub repository.
3. Create a Render deploy hook.
4. Add GitHub repository secrets.
5. Configure Supabase Auth Google provider in the Supabase dashboard.

Do not manually paste migration SQL into the Supabase SQL editor.

## Supabase CLI Setup

Install Supabase CLI locally only if you want to create or inspect migrations from your laptop. CI installs it automatically using `supabase/setup-cli@v2`.

macOS:

```sh
brew install supabase/tap/supabase
supabase --version
```

Login:

```sh
supabase login
```

Link the project:

```sh
supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
```

Create a new migration:

```sh
supabase migration new add_some_change
```

Edit the generated SQL file in `supabase/migrations/`, commit it, and push.

## GitHub Secrets

Add these under GitHub repository Settings > Secrets and variables > Actions.

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
SUPABASE_DB_PASSWORD
RENDER_DEPLOY_HOOK_URL
```

`SUPABASE_PROJECT_ID` is the project ref, visible in the Supabase project URL.

`SUPABASE_ACCESS_TOKEN` comes from Supabase account access tokens.

`SUPABASE_DB_PASSWORD` is the database password set when the Supabase project was created.

`RENDER_DEPLOY_HOOK_URL` comes from Render service deploy hooks.

## Render Environment Variables

Render stores production backend runtime secrets. GitHub Actions should not copy application secrets into files.

Set these in Render:

```text
PORT
NODE_ENV
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID
JWT_SECRET
EVOLUTION_API_URL
EVOLUTION_API_KEY
API_BASE_URL
APP_NAME
LOG_LEVEL
```

Use `.env.example` only as the contract for required keys.

## Workflows

### `gitops-deploy.yml`

Full ordered pipeline:

1. Backend install/build/test/lint.
2. `.env.example` contract validation.
3. Supabase migration dry run.
4. Supabase remote schema lint.
5. Supabase migration deploy.
6. Render backend deploy hook.
7. Android debug and release APK builds.
8. APK artifact upload.

### `supabase-migrations.yml`

Schema-only GitOps workflow. It runs when `supabase/**` changes:

1. Link Supabase project.
2. Validate pending migrations with `supabase db push --dry-run`.
3. Lint remote schema.
4. Deploy migrations with `supabase db push`.

### `render-deploy.yml`

Backend deployment workflow. It runs after `Supabase Migrations` succeeds, or manually via `workflow_dispatch`.

## Migration Rules

- Never edit an already-applied migration.
- Always add a new timestamped migration.
- Keep migrations idempotent where possible.
- Do not use Supabase dashboard changes as the source of truth.
- If a dashboard change is made accidentally, capture it as a migration before continuing.

## Rollback Strategy

Supabase migrations are forward-only in CI. To revert a bad schema change:

1. Create a new migration that reverses the bad change.
2. Push to `main`.
3. Let GitHub Actions deploy the corrective migration.

Do not manually edit production schema unless there is an incident and the manual change is immediately captured in Git.

## Verification

Before push:

```sh
npm install
npm run build
npm test
npm run lint
```

CI then verifies:

```sh
supabase db push --dry-run --linked
supabase db lint --linked --schema public --level warning --fail-on error
flutter pub get
flutter analyze
flutter test
flutter build apk --debug
flutter build apk --release
```

## Notes For Low-Resource Machines

Local Docker is not required.

Local PostgreSQL is not required.

Local Supabase containers are not required.

The hosted Supabase project is the database target. GitHub Actions runs migration deployment remotely.
