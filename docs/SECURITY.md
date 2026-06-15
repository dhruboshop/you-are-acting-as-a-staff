# Security

## Authentication

Shop-owner login uses Supabase Auth with Google Sign-In. The backend validates the Supabase access token on every protected route with `supabase.auth.getUser(token)`.

WhatsApp connection is separate. Evolution API credentials are backend-only environment variables and are never sent to the web app.

## Authorization

Every owner route joins through `shops.owner_user_id`. A user can only manage shops, customers, loyalty transactions, campaigns, and WhatsApp connections belonging to their own Supabase user ID.

Supabase RLS policies are included in `supabase/migrations/001_initial_schema.sql` for direct database safety. The backend should use the Supabase database connection string and should not expose service-role credentials to the app.

## Input Validation

The API uses Zod schemas for request validation:

- Shop create/edit.
- Customer public registration.
- Loyalty point changes.
- WhatsApp connect requests.
- Campaign create/preview/send.

## Rate Limiting

The API applies global rate limiting with `express-rate-limit`. For 20-50 shops this keeps memory usage low while protecting public registration and login-adjacent endpoints from basic abuse.

## XSS Protection

The backend returns JSON and CSV only. Helmet sets browser security headers. The Flutter app renders data as native text widgets rather than injecting HTML.

## CSRF Strategy

The API uses bearer tokens in the `Authorization` header, not cookies. Because browsers do not automatically attach these tokens cross-site, classic cookie CSRF is avoided. CORS is restricted in production.

## Secrets

Keep these only in `.env`, Render environment variables, or Supabase configuration:

- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `EVOLUTION_API_KEY`
- `DATABASE_URL`

Do not commit `.env`.

## Backups

Use `scripts/backup-supabase.sh` from a trusted machine with `DATABASE_URL` set. Store backup dumps outside the repository.
