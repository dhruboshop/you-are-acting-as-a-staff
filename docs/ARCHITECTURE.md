# Architecture

Zappy is a low-cost SaaS for 20-50 local shops.

## Runtime

- Flutter Android app for shop owners.
- Express TypeScript API on Render.
- Supabase Auth for Google login.
- Supabase Postgres for data.
- Evolution API for WhatsApp messaging.

Google login and WhatsApp connection are deliberately separate. A shop owner authenticates with Google through Supabase. A shop connects WhatsApp through Evolution API using a per-shop instance stored in `whatsapp_connections`.

## Data Flow

1. Owner signs in with Google.
2. API validates the Supabase JWT.
3. Owner creates a shop.
4. API generates a QR URL for public registration.
5. Customer scans QR and submits name, WhatsApp number, and consent.
6. Owner manages customers and loyalty points.
7. Owner connects WhatsApp through Evolution API.
8. Owner previews and sends festival campaigns.

## Free-Tier Choices

- No Redis, queue worker, Kubernetes, local containers, or local database required.
- PostgreSQL connection pool is capped at 5.
- CSV export streams a compact result set for small shop databases.
- Images are stored as URLs to avoid unnecessary backend storage.
- Campaigns send sequentially, which is adequate for 20-50 shops and avoids worker infrastructure.
