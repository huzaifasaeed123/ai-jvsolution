# JV Solution — Project Overview

**Working brand name:** JV Solution (configurable — final brand/domain TBD by client).
**Reference (patterns only, not to be copied):** ai-jv.world
**Nature:** Global AI-powered platform connecting opportunity owners (landowners,
governments, semi-government) with capital & capability (developers, investors, banks,
contractors, consultants, operators) for JV / PPP / concession / infrastructure deals.

> We are building an **upgraded, original** platform inspired by the reference site's
> UX *patterns* — NOT a copy. Original brand, original content, original code.
> Statistics are dynamic (DB/admin driven), never hard-coded.

---

## The core loop (what the whole platform is built around)

1. Owner lists an **Opportunity** (sensitive details hidden).
2. Platform verifies it → **Opportunity Passport** (Tier 0–5).
3. Capital side defines a **Mandate** (what they want to fund/build).
4. **Matching engine** scores Opportunity ↔ Mandate with explanation.
5. **AI tools** analyse it — Feasibility, Estimate, Valuation, Structure Recommender.
6. Interested party **requests access** → owner approves → **NDA** → reveal (audited, watermarked).
7. Parties work in a secure **Data Room / Deal Room** — docs, Q&A, meetings.
8. **Offers** submitted & compared → deal **closes** → project delivery.

Everything else in the spec is either a **tool supporting this loop** or a **new
opportunity category** (government, PPP, infrastructure) layered on top.

---

## Feature buckets (44 spec sections → 7 groups)

| # | Bucket | Contains |
|---|---|---|
| 1 | Marketplace & Listings | opportunities, search/filter, opportunity pages, mandates |
| 2 | Matching | JV Fit Score, mandate↔opportunity scoring |
| 3 | AI Engines | Feasibility, Estimate, Valuation, Structure Recommender |
| 4 | Secure Data Room | 48-folder tree, access levels, NDA, watermark, audit |
| 5 | Deal Workflow | due diligence, legal templates, consortiums, offers, tenders/bids |
| 6 | AI Assistants | RAG chatbot (cited), live avatar |
| 7 | Platform | dashboards, notifications, security, i18n/RTL, payments, integrations |

---

## Delivery phases (see `06-ROADMAP.md` for detail)

- **Phase 1** — Core two-sided platform: auth, roles, opportunities, mandates, matching, basic data room. *(build now)*
- **Phase 2** — Full Data Room, Due Diligence, AI Feasibility/Estimate/Valuation, investor dashboards.
- **Phase 3** — Government/PPP/concession, tenders & bids, consortiums.
- **Phase 4** — AI chatbot + avatar, ai-homes.world / ai-agi.world integrations, global matching.
- **Phase 5** — Project delivery, operations, concession lifecycle, handback.

---

## Non-negotiable principles

- **Server-side authorization always** — never trust the frontend for permissions.
- **Financial engines store inputs + formula version + assumptions** — never hard-code outputs.
- **All AI outputs carry provenance + confidence** — cite source, show data date, mark estimates.
- **Documents are versioned + permission-controlled.**
- **Audit trail** for reveals, downloads, prints, approvals, agreements.
- **i18n + RTL foundational**, not an afterthought.
- **Brand/domain/logo configurable** via env — no hard-coded brand strings.
- **Original content** — do not reproduce reference-site copy or numbers.
