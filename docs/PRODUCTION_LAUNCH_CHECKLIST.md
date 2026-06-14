# Production Launch Checklist

- Supabase migration applied.
- Supabase Google provider enabled.
- Render backend deployed.
- `/health` returns `status: ok`.
- Evolution API URL and key configured.
- Android release keystore created.
- APK built with production `API_BASE_URL`.
- Test owner can sign in with Google.
- Test shop can be created.
- QR registration adds a customer.
- Loyalty add and deduct both work.
- WhatsApp session connects.
- Festival campaign preview is correct.
- Test campaign sends to an opted-in customer.
- Backup command tested with `DATABASE_URL`.
