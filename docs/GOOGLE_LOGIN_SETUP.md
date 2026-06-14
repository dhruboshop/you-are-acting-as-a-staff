# Google Login Setup

## 1. Google Cloud

Screenshot placeholder: `docs/screenshots/google-oauth-client.png`

1. Open Google Cloud Console.
2. Create or select a project.
3. Configure OAuth consent screen.
4. Create an OAuth client for Android.
5. Add the Android package name: `com.retailwhatsapployalty.app`.
6. Add the SHA-1 certificate fingerprint from your debug or release keystore.

## 2. Supabase Auth

1. In Supabase, open Authentication > Providers.
2. Enable Google.
3. Paste the Google client ID and secret.
4. Save.

## 3. Flutter

Pass the web/server client ID to Flutter:

```sh
flutter run --dart-define=GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
