# FabricFlow ERP — Frontend

Frontend application for **FabricFlow**, an industrial ERP built for garment manufacturing operations — from masters and purchase through inventory, production, boxing, sales, and accounts.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query (wired for API; modules currently use mock data) |
| Tables | TanStack Table |
| State | Zustand |
| HTTP | Axios |
| Icons | Lucide React |
| Toasts | Sonner |
| Dates | date-fns |

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+

### Install

```bash
npm install
```

### Environment

Copy the example env file and adjust the API base URL when the backend is available:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint
```

## Temporary login (development)

Auth is currently local/temp until the real auth API is connected.

| Field | Value |
|-------|--------|
| Email | `abhishek@gmail.com` |
| Password | `12345678` |

Successful login sets a client auth store and cookie (`ff_auth`), then redirects into the dashboard. Middleware protects dashboard routes.

## Modules

### Implemented (UI + mock data)

| Module | Routes | Notes |
|--------|--------|--------|
| **Masters** | `/masters/party`, `/product`, `/operations`, `/gst`, `/karigar` | Parties, products, rates, GST, karigars |
| **Purchase Orders** | `/purchase-orders`, `/new`, `/[id]` | List, create, detail |
| **Purchase** | `/purchase/bills`, `/register` | Bills + purchase register |
| **Inventory** | `/inventory/stock`, `/issue/new`, `/issue/history`, `/wastage` | Stock, issue, wastage |
| **Production** | `/production`, `/production/bundles/[bundleNumber]` | 5 stage tabs + bundle tracking |

### Scaffolded (routes / placeholders)

Boxing & Dispatch, Sales, Accounts, and Team Management appear in the sidebar with route shells; full UI is pending.

## Project structure

```
src/
├── app/
│   ├── (auth)/                 # Login, accept invite
│   ├── (dashboard)/            # Authenticated ERP pages
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── common/                 # PageHeader, Pagination, EmptyState, drawers…
│   ├── layout/                 # Sidebar, Topbar, MobileSidebar
│   ├── modules/                # Feature UI (masters, purchase, inventory…)
│   └── ui/                     # shadcn primitives
├── constants/                  # routes, sidebarConfig, queryKeys
├── hooks/
├── lib/                        # axios, queryClient, utils
├── mock/                       # Mock datasets (replace with API)
├── providers/
├── services/                   # API service stubs
├── store/                      # Zustand stores
└── types/                      # Shared TypeScript types
```

Path alias: `@/*` → `src/*`

## Architecture notes

- **App Router** with route groups `(auth)` and `(dashboard)`.
- Feature UI lives under `src/components/modules/<module>/`.
- Pages stay thin: load mock (later TanStack Query), compose module components.
- Mock blocks are marked with TODOs pointing at the future service + query key, e.g.:

  ```ts
  // TODO: Replace with TanStack Query API call
  // Service: src/services/inventory.service.ts
  // Query key: QUERY_KEYS.STOCK
  ```

- Forms use **Zod** schemas and **Sonner** toasts for success/error feedback.
- Shared patterns: loading skeletons, empty states, drawer forms, status badges, pagination.

## Design system

- Primary actions: dark teal (`#1b3a3a`)
- Sidebar: dark charcoal/teal with amber/gold active accents
- Tables, filters, and drawers follow shadcn/ui patterns used across Masters → Production

## Roadmap (frontend)

1. Wire modules to the real API via `src/services/*` and TanStack Query
2. Replace temporary login with backend auth
3. Complete Boxing, Sales, Accounts, and Team UIs
4. Harden role-based access (Admin vs Team Member)

## License

Private project — all rights reserved.
