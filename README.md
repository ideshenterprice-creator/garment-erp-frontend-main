# FabricFlow ERP Frontend

Next.js 14 App Router UI for FabricFlow ERP.

## Stack

- Next.js 14, React 18, TypeScript
- TanStack Query, Zustand, Axios
- shadcn/ui + Tailwind

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to the backend API prefix, for example `http://localhost:5000/api`.

The backend must allow this origin in `FRONTEND_URL` / `CORS_ORIGIN` and issue the `refreshToken` cookie with credentials.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright (app must be running) |

## Auth

Login uses `/auth/login`. The refresh token is an httpOnly cookie. The access token lives in memory (Zustand) and is restored via `/auth/refresh` + `/auth/me`.

Protected routes are gated by `src/middleware.ts` and the dashboard `AuthGate`.

## Modules

Masters, purchase orders, purchase, inventory, production, boxing, sales, accounts, team, and notifications are wired to the backend. Global search, sales/purchase/account exports, and sales bill PDFs call backend endpoints — they are not mock downloads.

## Production

Deploy on Vercel. Set:

```
NEXT_PUBLIC_API_URL=https://<backend-host>/api
NEXT_PUBLIC_APP_URL=https://<frontend-host>
```

Do not put `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, or JWT secrets in frontend env.

Vercel production builds refuse `NEXT_PUBLIC_API_URL` values that point at localhost (`VERCEL_ENV=production`).
