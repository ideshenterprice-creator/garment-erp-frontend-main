# FabricFlow ERP — Production Deployment

Frontend deployment notes. Full database, storage, CORS, and email steps live in the backend `PRODUCTION_DEPLOYMENT.md`.

## Vercel

1. Import `garment-erp-frontend-main`.
2. Framework preset: Next.js.
3. Environment variables:

```
NEXT_PUBLIC_API_URL=https://<backend-host>/api
NEXT_PUBLIC_APP_URL=https://<this-vercel-domain>
```

On Vercel, `NEXT_PUBLIC_API_URL` must be the public HTTPS backend, not `localhost`. Production builds fail if this is missing or still points at localhost.

Current production frontend:

`https://garment-erp-frontend-ivory.vercel.app`

That origin is allowlisted in the backend CORS helper. Also set backend:

```
FRONTEND_URL=https://garment-erp-frontend-ivory.vercel.app
APP_URL=https://garment-erp-frontend-ivory.vercel.app
CORS_ORIGIN=https://garment-erp-frontend-ivory.vercel.app
COOKIE_SAMESITE=none
```

Redeploy this frontend after setting `NEXT_PUBLIC_API_URL`. The currently published Vercel build still contains a fake login and hardcoded party rows; it does **not** write to Supabase until this repo is deployed.

4. Deploy. Do not add database URLs, JWT secrets, Resend keys, or `SUPABASE_SERVICE_ROLE_KEY`.

## After deploy

Confirm the backend `FRONTEND_URL` / `CORS_ORIGIN` match this Vercel origin (no trailing slash mismatch).

Then verify login, dashboard, masters, purchase, inventory, production, boxing, sales, accounts, team, notifications, search, exports, and logout.
