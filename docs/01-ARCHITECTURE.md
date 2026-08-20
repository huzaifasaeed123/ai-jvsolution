# System Architecture

## Stack (Option 2 — chosen)

| Layer | Technology | Notes |
|---|---|---|
| Web frontend | **Next.js 15 (App Router) + TypeScript** | SSR/SSG for SEO on public pages; dashboards render per-user |
| UI | **Tailwind CSS + shadcn/ui** | original premium brand; LTR + RTL |
| Backend API | **NestJS + TypeScript** | modular: Module → Controller → Service → Repository |
| ORM | **Prisma** | typed DB access, migrations |
| Database | **PostgreSQL** | relational; `pgvector` extension for AI RAG later |
| Auth | **JWT (access + refresh)** issued by NestJS | consumed by web + future mobile |
| File storage | **S3-compatible** (AWS S3 / Supabase Storage) | data-room docs, versions, watermarks |
| Search | Postgres FTS → **Meilisearch/Typesense** (later) | opportunity/mandate filtering |
| AI | **Claude API** + pgvector | chatbot/avatar (Phase 4); engines are deterministic TS |
| Payments | **Stripe** (Phase 2+) | subscriptions & fees |
| Web hosting | **Vercel** | frontend |
| API hosting | **Render / Railway / Fly.io / AWS** | NestJS + Postgres |

**One language end-to-end: TypeScript.** Web, API, and future React Native mobile
all share the same typed contracts.

---

## Two independent apps (monorepo-lite)

```
17-Ai-JV/
├─ frontend/     Next.js 15 web app  (its own package.json, deploy)
├─ backend/      NestJS API          (its own package.json, deploy)
├─ shared/       (later) shared TS types / DTOs consumed by both
├─ docs/         architecture & guidelines (this folder)
└─ PLAN.md
```

Run them separately in dev:
- `cd backend && npm run start:dev`   → API on `http://localhost:4000`
- `cd frontend && npm run dev`        → Web on `http://localhost:3000`

They are decoupled and talk over **HTTP (REST)** so the same API serves the future
mobile app and third-party integrations.

---

## Request flow (end to end)

```
┌────────────┐      HTTPS/REST (JSON)      ┌─────────────────────────────┐
│  Web       │  ───────────────────────▶   │  NestJS API                 │
│  (Next.js) │                             │                             │
│            │   Server Components fetch    │  Controller  (route + auth  │
│  Future    │   server-side; Client        │      │        guard)        │
│  Mobile    │   Components via api client   │      ▼                     │
│  (RN)      │  ◀───────────────────────    │  Service     (business      │
└────────────┘        JSON responses        │      │        logic)        │
                                            │      ▼                     │
                                            │  Repository  (Prisma)       │
                                            │      │                     │
                                            │      ▼                     │
                                            │  PostgreSQL                 │
                                            └─────────────────────────────┘
```

**Layer responsibilities (backend):**
- **Controller** — HTTP only: parse request, validate DTO, enforce auth/roles, return response. No business logic.
- **Service** — all business logic, orchestration, calculations. Framework-agnostic.
- **Repository** — all DB access via Prisma. Nothing else queries the DB.
- **DTO / Schema** — request/response shape + validation (class-validator / Zod).

**Never skip a layer.** A controller never calls Prisma directly; a service never
reads `req`/`res`.

---

## How the frontend talks to the backend

Two patterns, both allowed:

1. **Server Components / Route Handlers (preferred for reads):** Next.js server code
   calls the API with the user's token → renders HTML. Good for SEO + no data leak to client.
2. **Client Components (for interactivity):** use a typed `apiClient` (fetch wrapper)
   that attaches the JWT and calls the NestJS API.

Next.js here acts as a **BFF (backend-for-frontend)** — rendering + light glue — while
**NestJS owns all business logic and data**. This keeps the door open for mobile.

---

## Auth flow (JWT, shared across clients)

```
Login → NestJS verifies credentials → issues accessToken (short) + refreshToken (long)
Web stores tokens in httpOnly cookies (via Next.js route handler) 
Mobile stores tokens in secure storage
Every API call → Authorization: Bearer <accessToken>
Access expired → call /auth/refresh with refreshToken → new access token
NestJS guards enforce role + access-level on every protected route (server-side)
```

Access levels (spec §27): Public → Registered → Verified → NDA → Due Diligence →
Full Transaction. Enforced by a `@AccessLevel()` guard on the backend.

---

## Environments & config

- All config via **environment variables** (`.env`) — no hard-coded URLs, brand, keys.
- `frontend/.env.local` and `backend/.env` (both have `.env.example` committed).
- Domain/brand/logo/languages/country packs configurable → new-domain deploy needs no code change (spec §39).
