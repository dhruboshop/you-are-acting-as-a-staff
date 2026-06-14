# Retail WhatsApp Loyalty

Production-oriented SaaS for local retail shops to collect QR registrations, manage loyalty points, and send festival WhatsApp greetings through Evolution API.

## What Is Included

- Flutter Material 3 Android app in `mobile/`.
- Node.js Express TypeScript API in `backend/`.
- Supabase SQL migration and RLS policies in `supabase/migrations/`.
- Optional Docker files for deployment experiments.
- Beginner guides in `docs/`.

## Low-Resource Development

No Docker, local PostgreSQL, Redis, Kubernetes, Android emulator, or local containers are required.

Backend:

```sh
cd backend
npm install
npm run dev
```

Tests:

```sh
cd backend
npm test
```

Flutter app on a real Android phone:

```sh
cd mobile
flutter pub get
flutter run \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key \
  --dart-define=GOOGLE_CLIENT_ID=your-google-client-id \
  --dart-define=API_BASE_URL=http://YOUR_COMPUTER_LAN_IP:8080
```

## Production Services

- Supabase: Auth and Postgres.
- Render: backend API.
- Evolution API: WhatsApp connection and message sending.

## Verification Status In This Workspace

- `npm --workspace backend run build`: passing.
- `npm --workspace backend run lint`: passing.
- `npm --workspace backend test`: passing.
- `npm audit --workspace backend --audit-level=high`: passing.
- Flutter commands could not be executed here because the Flutter SDK is not installed in this environment.
