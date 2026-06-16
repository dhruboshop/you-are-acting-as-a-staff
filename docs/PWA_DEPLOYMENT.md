# Zappy PWA Deployment

This guide is the operating path for the mobile-first Zappy web app.

## Architecture

- `web/`: Next.js 15, TypeScript, Tailwind CSS, shadcn-style components, PWA manifest, service worker.
- `backend/`: Existing Node.js/Express API deployed on Render.
- `supabase/migrations/`: Database schema managed from Git.
- `supabase/migrations/002_growth_pwa_schema.sql`: PWA growth tables for customers, WhatsApp instances, AI variants, templates, and queue records.

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy web environment values:

   ```bash
   cp web/.env.example web/.env.local
   ```

3. Set these values in `web/.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

4. Start the backend:

   ```bash
   npm run dev
   ```

5. Start the PWA:

   ```bash
   npm run dev:web
   ```

6. Open:

   ```text
   http://localhost:3001
   ```

## Supabase

1. Create one Supabase project.
2. Add the repository secrets required by `.github/workflows/gitops-deploy.yml`.
3. Run migrations from Git with the Supabase CLI workflow.
4. Do not paste SQL manually except during emergency recovery.

Required Supabase tables for the PWA:

- `shops`
- `customers`
- `campaigns`
- `campaign_messages`
- `message_templates`
- `message_variants`
- `whatsapp_connections`
- `campaign_queue`

## Render Backend

Render continues to deploy the existing backend from GitHub.

Required environment variables:

```bash
PORT=
NODE_ENV=production
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
JWT_SECRET=
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
GROQ_API_KEY=
API_BASE_URL=
WEB_APP_URL=
APP_NAME=Zappy
LOG_LEVEL=info
```

## Vercel Web App

1. Import the GitHub repository in Vercel.
2. Set the root directory to:

   ```text
   web
   ```

3. Set install command:

   ```bash
   npm install
   ```

4. Set build command:

   ```bash
   npm run build
   ```

5. Set output directory:

   ```text
   .next
   ```

6. Add environment variables:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_API_BASE_URL=https://your-render-backend.onrender.com
   NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
   ```

## PWA Validation

Validate on real devices:

- Android Chrome opens and installs with Add to Home Screen.
- iPhone Safari opens and saves with Add to Home Screen.
- Tablet browsers render the dashboard, QR, customers, and campaign screens.
- Offline mode shows cached shell assets.

## First Merchant Launch Path

1. Deploy Supabase migrations.
2. Deploy backend on Render.
3. Deploy web app on Vercel.
4. Confirm Google login opens.
5. Create a shop.
6. Choose a theme.
7. Connect WhatsApp with pairing-code flow.
8. Open QR screen and test public registration.
9. Create one campaign and approve an AI-generated message.
10. Queue a small test send before onboarding live customers.
