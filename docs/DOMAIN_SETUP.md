# Domain Setup

## Backend Domain

1. In Render, open your API service.
2. Open Settings > Custom Domains.
3. Add `api.yourdomain.com`.
4. Render shows DNS records.
5. Add those records at your domain provider.

## App API URL

Build the APK with:

```sh
flutter build apk --release --dart-define=API_BASE_URL=https://api.yourdomain.com
```
