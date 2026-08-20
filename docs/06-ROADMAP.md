# Build Roadmap

Phased so a working product exists early and modules layer on cleanly. Each phase is
shippable. Order maps to the spec's own 5 phases.

## Phase 0 — Foundations (setup) ✅ in progress
- Scaffold `frontend/` (Next.js) + `backend/` (NestJS).
- Prisma + Postgres wired; base config, env, lint, CI.
- Design system + brand tokens; base layout (header/footer/nav, i18n, RTL).
- Auth module skeleton (JWT), common guards/decorators.
- **Done when:** both apps run, a public page renders, `/auth/register` + `/auth/login` work end-to-end.

## Phase 1 — Core two-sided platform
- Public site: home (dual CTA), how-it-works, country intelligence, structures library (original content, dynamic stats).
- Auth complete: register by role, login, refresh, roles/access levels.
- Opportunities: create (guided steps), list/search/filter, opportunity detail (public vs confidential).
- Opportunity Passport verification tiers (T0–T5).
- Mandates: developer/investor mandate creation.
- Matching v1: deterministic explainable Fit Score.
- Access flow: request → owner approve → NDA → reveal + audit log + watermark.
- Basic Data Room (folders/docs/permissions).
- Role dashboards (owner/developer/investor/admin) with real data.
- **Done when:** owner lists → developer matched → requests access → NDA → deal room. (spec §43 core)

## Phase 2 — Intelligence & deal depth
- Full Data Room (48-folder taxonomy, versioning, granular access, expiry).
- Due Diligence Centre (items, risk ratings, workflow).
- AI Feasibility engine (cash flow, IRR/NPV/DSCR, scenarios) — deterministic + stored inputs.
- AI Estimate engine (cost model by unit/spec).
- AI Valuation engine (residual/DCF/comparable).
- AI JV Structure Recommender (ranks structures, decision matrix).
- Investor dashboards (KPI cards + charts + 0–100 scores).
- Offers submission + comparison.
- Payments/subscriptions (Stripe).

## Phase 3 — Government, PPP & tenders
- Government / semi-gov / PPP / concession / infrastructure opportunity types.
- Tender & Bid Room (RFQ/RFP/ITT, submissions, evaluation, preferred bidder).
- Swiss Challenge & unsolicited proposals.
- Consortium formation (members, roles, equity, agreements, e-sign).
- Legal Forms & Agreements library.

## Phase 4 — AI assistants & integrations
- AI Opportunity Chatbot (RAG over approved docs, citations, access-aware) — pgvector + Claude.
- Live AI Avatar (voice/lip-sync, multilingual, governed).
- ai-homes.world integration (distribution, broker/investor matching).
- ai-agi.world integration (macro/country/city intelligence + scores).
- Global broker/agency/investor network + advanced matching.

## Phase 5 — Delivery lifecycle
- Project delivery, milestones, operations, concession lifecycle, handback.
- Full audit/reporting, white-label, data-residency options.

---

## Immediate next steps (this session / next)
1. Finish Phase 0 scaffold: Prisma init, env files, base config, CI.
2. Design tokens + base layout + i18n scaffolding.
3. Auth module (backend) + register/login pages (frontend) end-to-end.
4. First real module — `opportunities` — as the reference implementation others copy.

## Working agreement
- Build **one module fully** (controller→service→repo→dto→tests + frontend feature) before the next.
- `opportunities` is the **template module**; every later module mirrors its structure.
- Confirm each phase's scope before starting it.
