# JV Solution

Global AI platform for private, semi-government & government joint ventures,
infrastructure, PPP, concessions and investment opportunities.

> Upgraded, original platform inspired by the UX *patterns* of ai-jv.world — **not a copy**.
> Original brand, content and code. See [`docs/`](docs/) for the full architecture.

## Structure

```
17-Ai-JV/
├─ frontend/   Next.js 16 web app (App Router, TS, Tailwind)  → SEO + UI (BFF)
├─ backend/    NestJS 11 API (TS, Prisma, PostgreSQL)         → all business logic
├─ docs/       architecture & coding guidelines (read first)
└─ PLAN.md
```

Two independent apps, one language (TypeScript), talking over REST — so the same
API serves the web app today and a mobile app later.

## Documentation (read in order)

| Doc | Purpose |
|---|---|
| [docs/00-OVERVIEW.md](docs/00-OVERVIEW.md) | What we're building, core loop, principles |
| [docs/01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md) | Stack, request flow, auth, envs |
| [docs/02-BACKEND-GUIDE.md](docs/02-BACKEND-GUIDE.md) | NestJS module pattern, how to add a module |
| [docs/03-FRONTEND-GUIDE.md](docs/03-FRONTEND-GUIDE.md) | Next.js conventions, server/client, data fetching |
| [docs/04-CODING-STANDARDS.md](docs/04-CODING-STANDARDS.md) | Naming, git, testing, security, DoD |
| [docs/05-DATABASE.md](docs/05-DATABASE.md) | Prisma models, entity groups, phasing |
| [docs/06-ROADMAP.md](docs/06-ROADMAP.md) | Phased delivery plan |

## Getting started (dev)

```bash
# backend  → http://localhost:4000
cd backend
cp .env.example .env        # fill values
npm install
npm run start:dev

# frontend → http://localhost:3000
cd frontend
cp .env.example .env.local  # fill values
npm install
npm run dev
```

Requires Node 20+ and a PostgreSQL database.

## Golden rules

- Authorization is **server-side only**.
- No hard-coded brand, URLs, or statistics — all config/DB driven.
- Financial/AI outputs store inputs + version + assumptions + confidence.
- Build one module fully (controller→service→repo→dto→tests) before the next.
- `opportunities` is the template module — mirror it for every new feature.
