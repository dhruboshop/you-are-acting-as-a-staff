# Android Build

Use a real Android phone for testing.

## Check Toolchain

```sh
flutter doctor
flutter devices
```

If your phone is missing, enable USB debugging and accept the trust prompt on the phone.

## Run

```sh
cd mobile
flutter pub get
flutter run \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key \
  --dart-define=GOOGLE_CLIENT_ID=your-google-client-id \
  --dart-define=API_BASE_URL=http://YOUR_COMPUTER_LAN_IP:8080
```

## Release APK

```sh
flutter test
flutter analyze
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key \
  --dart-define=GOOGLE_CLIENT_ID=your-google-client-id \
  --dart-define=API_BASE_URL=https://api.yourdomain.com
```

For Play Store distribution, create a release keystore and add `android/key.properties`. Without it, the build file falls back to debug signing so a founder can still create a test APK.
