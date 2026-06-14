# Render Deployment

## 1. Create Web Service

Screenshot placeholder: `docs/screenshots/render-new-web-service.png`

1. Push this repository to GitHub.
2. In Render, create a new Web Service.
3. Select the repository.
4. Runtime: Node.
5. Build command:

```sh
./scripts/render-build.sh
```

6. Start command:

```sh
./scripts/render-start.sh
```

## 2. Environment Variables

Add every value from `.env.example`. Use Supabase hosted database values. Do not paste secrets into code.

## 3. Auto Deploy

1. In Render, open the backend service.
2. Open Settings.
3. Confirm Auto Deploy is enabled for the `main` branch.

Render deploys automatically when GitHub receives a push. GitHub Actions does not trigger Render.

## 4. Health Check

Set health check path:

```text
/health
```
