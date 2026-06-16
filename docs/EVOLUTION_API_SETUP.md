# Evolution API Setup

Evolution API is responsible only for WhatsApp connection and messaging.

## 1. Prepare Evolution API

Screenshot placeholder: `docs/screenshots/evolution-api-dashboard.png`

1. Deploy Evolution API using your preferred host.
2. Create or copy the API key.
3. Note the base URL.

## 2. Backend Environment

Set:

```env
EVOLUTION_API_URL=https://wa.zappy.rest
EVOLUTION_API_KEY=your-api-key
```

## 3. Connect Shop WhatsApp

1. Open the mobile app.
2. Open a shop.
3. Tap WhatsApp.
4. Tap Connect or reconnect.
5. Scan the QR shown by Evolution API tooling if required.
