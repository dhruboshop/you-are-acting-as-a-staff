# Zappy Uptime Strategy

Zappy uses free-tier-friendly uptime checks to reduce Render cold starts. Do not add server-side self-pinging loops, paid uptime services, Redis, queues, or extra servers for MVP.

## What To Ping

- Backend: `https://api.zappy.rest/health`
- Evolution API: `https://wa.zappy.rest/`

## Option A: cron-job.org

1. Create a free account at cron-job.org.
2. Create one cron job for `https://api.zappy.rest/health`.
3. Set the schedule to every 10 minutes.
4. Use `GET`.
5. Set timeout to 20 seconds.
6. Create a second cron job for `https://wa.zappy.rest/`.
7. Set the same 10 minute schedule.
8. Enable failure email alerts.

This option is easiest for a non-technical founder because it does not consume GitHub Actions minutes.

## Option B: GitHub Actions

This repository includes `.github/workflows/uptime-ping.yml`.

It runs every 10 minutes and pings:

- `https://api.zappy.rest/health`
- `https://wa.zappy.rest/`

Manual test:

1. Open GitHub.
2. Go to Actions.
3. Open `Uptime Ping`.
4. Click `Run workflow`.
5. Confirm both curl steps pass.

## Expected Behavior

- `https://api.zappy.rest/health` should return HTTP 200 with JSON.
- `https://wa.zappy.rest/` should return HTTP 200 or another healthy Evolution API response.

## Failure Handling

If the backend ping fails:

1. Open Render backend logs.
2. Confirm the service is deployed and listening on the expected port.
3. Check `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`.

If the Evolution ping fails:

1. Open Render Evolution logs.
2. Check whether the service restarted or exceeded memory.
3. Confirm `AUTHENTICATION_API_KEY`, `SERVER_URL`, and database variables are configured.

## Free-Tier Safety

This strategy sends only lightweight HTTP GET requests every 10 minutes. It does not send WhatsApp messages, create instances, run database migrations, or trigger campaign sends.
