# Frontend Guide (Next.js 15, App Router)

The web app is a **BFF + UI layer**. It renders pages (SEO-friendly) and calls the
NestJS API for all data and business logic. It contains **no business rules**.

## Folder structure

```
frontend/
├─ src/
│  ├─ app/                        # ROUTES (file-based)
│  │  ├─ (public)/                # SEO pages: home, how-it-works, countries, structures
│  │  ├─ (auth)/                  # login, register, forgot-password
│  │  ├─ (dashboard)/             # authenticated area
│  │  │  ├─ layout.tsx            # sidebar/nav + auth gate
│  │  │  ├─ owner/
│  │  │  ├─ developer/
│  │  │  ├─ investor/
│  │  │  ├─ government/
│  │  │  └─ admin/
│  │  ├─ api/                     # Next route handlers (BFF: cookie/session, token refresh)
│  │  ├─ layout.tsx               # root layout (fonts, providers, dir=ltr/rtl)
│  │  └─ not-found.tsx
│  │
│  ├─ features/                   # ★ UI grouped by domain (mirrors backend modules)
│  │  ├─ opportunities/
│  │  │  ├─ components/           # OpportunityCard, OpportunityFilters…
│  │  │  ├─ hooks/                # useOpportunities (client data)
│  │  │  └─ api.ts                # typed calls to backend endpoints
│  │  ├─ mandates/
│  │  ├─ dataroom/
│  │  └─ ...
│  │
│  ├─ components/                 # generic reusable UI (shadcn/ui + custom)
│  │  └─ ui/
│  ├─ lib/                        # apiClient, auth helpers, utils, constants
│  ├─ i18n/                       # next-intl config + message catalogs (9 langs)
│  ├─ styles/                     # tailwind globals, design tokens
│  └─ types/                      # shared TS types (mirror backend DTOs until `shared/` exists)
│
├─ public/                        # static assets (brand logo via env)
├─ .env.local / .env.example
└─ package.json
```

## Server vs Client Components (the key discipline)

- **Default = Server Component.** Fetch data server-side, render HTML. No `useState`/`useEffect`.
- Add `'use client'` **only** when you need interactivity (forms, modals, charts, filters).
- Keep client components small — push data-fetching up into server components.

```tsx
// Server Component — reads data on the server, SEO-friendly
export default async function OpportunitiesPage() {
  const items = await opportunitiesApi.list();      // server-side fetch w/ token
  return <OpportunityList items={items} />;          // list can be client if interactive
}
```

## Talking to the backend

- One typed wrapper: `src/lib/apiClient.ts` — base URL from `process.env.NEXT_PUBLIC_API_URL`,
  attaches JWT, handles 401 → refresh, throws typed errors.
- Each feature has `features/<name>/api.ts` with functions like `list()`, `getById()`, `create()`.
- **No `fetch` scattered in components.** Always go through the feature api module.

## Data fetching rules

| Need | Use |
|---|---|
| Initial page data, SEO | Server Component `await` |
| User-specific dashboard data | Server Component with token from cookies |
| Interactive refetch / mutations | Client Component + hook (TanStack Query optional) |
| Forms | Server Action **or** client submit → feature `api.ts` |

## Routing conventions

- Route groups `(public)`, `(auth)`, `(dashboard)` organize without affecting URLs.
- `layout.tsx` per group for shared chrome; `loading.tsx` + `error.tsx` per segment.
- Dynamic routes: `app/(dashboard)/opportunities/[id]/page.tsx`.

## i18n & RTL (foundational)

- `next-intl`; all user-facing strings from message catalogs — **no hard-coded copy**.
- 9 locales: en, ar, de, fr, es, pt, zh, hi, ur.
- `dir="rtl"` for ar/ur set on `<html>` from the active locale.
- Market/domain corpus may stay English initially (like reference), but UI strings translate.

## Styling / design system

- Tailwind + shadcn/ui. Design tokens (colors, spacing, fonts) in `styles` + tailwind config.
- Original premium brand — institutional, strong typography, light/dark, WCAG-aware.
- Brand name & logo come from env/config, never hard-coded.

## Component rules

- Presentational components are dumb (props in, UI out).
- Data/logic lives in server components, hooks, or feature `api.ts`.
- Reuse `components/ui/*`; do not re-implement buttons/inputs per feature.
