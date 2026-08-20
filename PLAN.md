# AJV Clone — Project Plan

Replica of **https://ai-jv.world/** — a two-sided land joint-venture platform
(landowners × developers/investors). Goal: match the original closely in both
content and design, including the authenticated app.

---

## 1. Confirmed Scope

**Full clone** — public marketing/intelligence site **and** the authenticated app.

### A. Public site (no auth, no DB — static data files)
- `/` home (hero, 4 stats, 6 feature cards, role flows, country grid, footer)
- `/how-it-works`
- `/countries` + `/countries/[code]` — 12 country intelligence sheets
  (AE, SA, EG, GB, DE, FR, ES, PT, IN, PK, CN, US)
- `/structures` — 53 JV structures in 3 groups (Private 21 · Hybrid · Government/PPP)
- `/login`, `/register` (register = role picker Owner/Developer + country)
- 9-language UI switcher (EN, AR, DE, FR, ES, PT, ZH, HI, UR)

### B. Authenticated app (auth + DB + logic)
- Roles: **Owner**, **Developer/Investor**, **Admin** (`/owner`, `/developer`, `/admin`)
- Owner: 7-step plot listing wizard, Plot Passport™ (5-tier verification),
  benchmarked offers, approve-who-sees-it privacy, deal room
- Developer: define mandate once, matched underwriting-ready plots, model/propose/close
- Shared: AI Feasibility Studio (residual valuation), Structure Simulator,
  JV Fit Score™ matching engine, anonymous-until-matched, deal rooms, offers/messaging
- Admin: console (PIN-gated login path)

### Decisions
- **i18n**: UI strings translatable in 9 langs; market corpus stays English (matches original).
- **Content**: country + structure corpus scraped verbatim from the live site.
  ⚠️ Reuses original expert copy — user-directed; revisit before any public launch.
- **Fidelity**: visually match design (fonts, gold/atlas palette, "contour" texture).
- **Deploy**: Vercel.

---

## 2. Finalized Architecture

Single **Next.js 15 (App Router) + TypeScript** project on Vercel. No separate backend.

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router, React, TypeScript |
| Styling | Tailwind CSS (replicate design tokens: bone/ink/gold/atlas/field palette) |
| Public content | Static TS/JSON data files (12 countries, 53 structures) — **no DB** |
| Database | PostgreSQL (Neon/Supabase) + **Prisma** |
| Auth | Auth.js (NextAuth): credentials + email magic-link + admin PIN, role-based |
| Server logic | Server Actions + Route Handlers (`app/api/...`) |
| i18n | next-intl, 9 locales, UI strings only |
| AI | Deterministic math for valuations/scores; **Claude (optional)** for plain-word explanations. Core works without an API key. |
| File storage | Vercel Blob (plot photos/docs for Plot Passport) |
| Deploy | Vercel + hosted Postgres |

Design tokens observed in original: `bg-bone-50`, `text-ink`, `text-gold-500`,
`text-atlas-950`, `text-field-600`, `font-display`, `font-mono-data`, `.contour` texture.

---

## 3. Phased Delivery

### Phase 0 — Scaffold & design system
- `create-next-app` (TS, Tailwind, App Router), ESLint/Prettier
- Replicate design tokens, fonts, `.contour` texture, color palette
- Shared layout: header (nav + language switcher), footer, 404 page
- **Deliverable**: empty themed shell matching original chrome

### Phase 1 — Public site (static, no DB)
- Extract verbatim corpus → `data/countries.ts`, `data/structures.ts`
- Build `/`, `/how-it-works`, `/countries`, `/countries/[code]`, `/structures`
- next-intl scaffolding + 9-language UI switcher (EN complete, others stubbed)
- **Deliverable**: pixel-matched public site, fully browsable, deployable

### Phase 2 — Auth & accounts
- Prisma schema: User, Account, Session, roles (OWNER/DEVELOPER/ADMIN)
- `/register` (role + country), `/login` (password + magic-link + admin PIN)
- Session middleware; `/owner` `/developer` `/admin` redirect-to-login gating
- Empty role dashboards
- **Deliverable**: working signup/login/logout, role routing

### Phase 3 — Owner flow
- 7-step plot listing wizard (draft → publish)
- Plot Passport™ 5-tier verification model + doc/photo upload (Vercel Blob)
- Owner dashboard: my plots, status, incoming offers, privacy controls
- **Deliverable**: owner can list & manage a plot end-to-end

### Phase 4 — Developer flow + matching
- Mandate builder (once); developer dashboard
- **JV Fit Score™** two-sided scoring engine (deterministic, explainable)
- Matched-plots feed (anonymous-until-matched)
- **Deliverable**: developer defines mandate, receives scored matches

### Phase 5 — Deal room, offers, feasibility & simulator
- Deal room (per-match): messaging, offers, benchmarked-offer comparison
- AI Feasibility Studio: residual land valuation (math) + optional Claude explanation
- Structure Simulator / Recommender (ranks the 53 structures vs an opportunity)
- **Deliverable**: parties negotiate, model, and close in one deal room

### Phase 6 — Admin & polish
- Admin console (users, plots, verification queue, moderation)
- Remaining i18n locale strings, RTL for AR/UR
- Accessibility, responsive QA, SEO/meta parity, production deploy to Vercel
- **Deliverable**: full production clone

---

## 4. Open items to revisit
- Exact internals of the gated app are inferred (couldn't view behind login) —
  refine Phases 3–6 as we build.
- Which of the 9 languages get real translations vs stubs (default: EN real, rest stub).
- Real Anthropic API key for LLM explanations (optional; core runs without).
