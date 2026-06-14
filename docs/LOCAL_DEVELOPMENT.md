# Local Development

Use a real Android phone connected by USB. No Android emulator, Docker, or local PostgreSQL is required.

## 1. Install Tools

Screenshot placeholder: `docs/screenshots/flutter-doctor.png`

1. Install Node.js LTS or newer.
2. Install Flutter stable.
3. Run:

```sh
flutter doctor
```

4. Fix the Android toolchain items shown by Flutter.
5. Enable Developer Options and USB debugging on your Android phone.

## 2. Create Environment File

Copy `.env.example` to `.env` and fill values from Supabase, Google, Render, and Evolution API.

## 3. Start Backend

```sh
cd backend
npm install
npm run dev
```

Open `http://localhost:8080/health`.

## 4. Start Flutter App

```sh
cd mobile
flutter pub get
flutter devices
flutter run \
  --dart-define=SUPABASE_URL=your-url \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key \
  --dart-define=GOOGLE_CLIENT_ID=your-google-client-id \
  --dart-define=API_BASE_URL=http://YOUR_COMPUTER_LAN_IP:8080
```

Use your computer LAN IP because a physical phone cannot reach `localhost` on your laptop.
