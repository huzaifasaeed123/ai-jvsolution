# Coding Standards & Workflow

Applies to both `frontend/` and `backend/`. These are enforced in code review.

## Language & typing

- **TypeScript strict mode** on both apps. No `any` unless justified with a comment.
- Prefer explicit return types on exported functions/services.
- Validate at boundaries: DTOs (backend), zod schemas (frontend forms).

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Files (backend) | kebab-case + role suffix | `create-opportunity.dto.ts`, `opportunities.service.ts` |
| Files (frontend components) | PascalCase | `OpportunityCard.tsx` |
| Files (frontend non-component) | kebab-case | `api-client.ts`, `use-opportunities.ts` |
| Classes / Components | PascalCase | `OpportunitiesService`, `OpportunityCard` |
| Variables / functions | camelCase | `createOpportunity` |
| Constants / enums | UPPER_SNAKE / PascalCase | `ACCESS_LEVELS`, `Role.OWNER` |
| DB models (Prisma) | PascalCase singular | `Opportunity`, `Offer` |
| DB fields | camelCase | `ownerId`, `createdAt` |
| Routes | plural kebab | `/opportunities`, `/access-requests` |

## Folder-by-feature (both apps)

Group code by **domain feature**, not by technical type. A feature owns its
components/services/dtos/tests. This is what makes "add modules later" painless.

## Git workflow

- **Never commit to `main` directly.** Branch per task.
- Branch names: `feat/opportunities-crud`, `fix/auth-refresh`, `chore/ci`, `docs/roadmap`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- One PR = one focused change. PR must pass lint + typecheck + tests before merge.
- Commit/push only when asked; keep commits small and reviewable.

## Testing

- Backend: unit tests for services (business logic), e2e for critical flows
  (auth, create opportunity, submit offer, reveal/NDA, access control).
- Frontend: component tests for interactive UI; keep server-render logic thin.
- **Critical workflows must have tests** (spec §42): auth, permissions, reveal, offers, financial engines.

## Security rules (hard requirements)

- **Authorization is server-side only.** Frontend hides UI, backend enforces access.
- Passwords hashed (argon2/bcrypt). JWT secrets from env. Refresh-token rotation.
- Input validated & sanitized at the API boundary; parameterized queries (Prisma handles).
- Rate-limit auth endpoints. CORS locked to known origins.
- Secrets never in code or git — only `.env` (committed as `.env.example` without values).
- Sensitive actions audited (who, what, when, IP).
- Documents: signed URLs, expiry, watermark, permission check on every access.

## Error handling

- Backend: typed exceptions → global filter → consistent error envelope:
  `{ statusCode, error, message, timestamp, path }`.
- Frontend: feature `api.ts` throws typed errors; UI shows friendly messages; log details server-side.
- Never expose internal errors/stack traces to the client.

## AI & financial-engine governance (spec §37, §42)

- Every AI/engine output stores: **inputs, formula/model version, assumptions, confidence, timestamp, sources**.
- Mark AI estimates clearly in UI. Separate "official data" from "AI analysis".
- Never fabricate missing data — return "unavailable" with reason.
- Government requirements preserve original wording + citation (source, clause, page, version, date).

## Config & environment

- Every env var documented in `.env.example` with a comment.
- No hard-coded URLs, brand names, currencies, or country data.
- Typed config loader (backend `config/`, frontend `lib/config.ts`).

## Definition of Done (per task)

- [ ] Types strict, no stray `any`
- [ ] DTO/zod validation at boundary
- [ ] Server-side authz + roles/access level
- [ ] Tests for the logic added
- [ ] Audit log for sensitive actions
- [ ] No hard-coded secrets/brand/numbers
- [ ] Lint + typecheck pass
- [ ] Docs/README updated if behavior changed
