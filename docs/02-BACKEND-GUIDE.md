# Backend Guide (NestJS)

The backend is a **modular monolith**: one NestJS app, many self-contained feature
modules. Adding a new spec feature = adding one module, without touching others.

## Folder structure

```
backend/
├─ src/
│  ├─ main.ts                     # bootstrap (CORS, global pipes, swagger)
│  ├─ app.module.ts               # root module — imports all feature modules
│  │
│  ├─ common/                     # cross-cutting, shared by all modules
│  │  ├─ guards/                  # JwtAuthGuard, RolesGuard, AccessLevelGuard
│  │  ├─ decorators/              # @CurrentUser, @Roles, @AccessLevel, @Public
│  │  ├─ interceptors/            # logging, response shaping, audit
│  │  ├─ filters/                 # global exception filter
│  │  ├─ pipes/                   # validation
│  │  └─ dto/                     # shared DTOs (pagination, etc.)
│  │
│  ├─ config/                     # typed config (env schema + loader)
│  │
│  ├─ prisma/                     # PrismaService (DB client wrapper)
│  │
│  └─ modules/                    # ★ ONE FOLDER PER FEATURE
│     ├─ auth/
│     ├─ users/
│     ├─ companies/
│     ├─ opportunities/
│     ├─ mandates/
│     ├─ matching/
│     ├─ dataroom/
│     ├─ feasibility/
│     ├─ estimate/
│     ├─ valuation/
│     ├─ structures/
│     ├─ offers/
│     ├─ duediligence/
│     ├─ consortium/
│     ├─ tenders/
│     ├─ notifications/
│     └─ ... (add here)
│
├─ prisma/
│  ├─ schema.prisma               # ALL models
│  └─ migrations/
├─ test/                          # e2e tests
├─ .env / .env.example
└─ package.json
```

## Anatomy of ONE module (the template we always follow)

Example: `modules/opportunities/`

```
opportunities/
├─ opportunities.module.ts        # wires controller + service + repo
├─ opportunities.controller.ts    # HTTP routes only, auth guards, calls service
├─ opportunities.service.ts       # business logic
├─ opportunities.repository.ts    # Prisma queries only
├─ dto/
│  ├─ create-opportunity.dto.ts   # input validation (class-validator)
│  ├─ update-opportunity.dto.ts
│  └─ query-opportunity.dto.ts    # filters/pagination
├─ entities/
│  └─ opportunity.entity.ts       # response shape / serialization
└─ opportunities.service.spec.ts  # unit tests
```

### Layer rules (enforced in review)

| Layer | May do | May NOT do |
|---|---|---|
| Controller | read request, apply guards, call **one** service method, return DTO | contain business logic, touch Prisma |
| Service | business logic, call repos & other services, calculations | read `req`/`res`, build HTTP responses |
| Repository | Prisma reads/writes for **its own** module's tables | contain business rules |
| DTO | validate & type input/output | any logic |

Cross-module data access goes **service → service**, never repo → other module's tables.

## Standard REST shape per module

```
GET    /opportunities            list (paginated, filtered)
GET    /opportunities/:id        one
POST   /opportunities            create
PATCH  /opportunities/:id        update
DELETE /opportunities/:id        soft-delete
```

Sub-resources nest: `POST /opportunities/:id/access-requests`, `GET /opportunities/:id/offers`.

## Guards & authorization (server-side, always)

```ts
@Post()
@Roles('OWNER', 'ADMIN')                 // role check
@UseGuards(JwtAuthGuard, RolesGuard)
create(@CurrentUser() user, @Body() dto: CreateOpportunityDto) {
  return this.service.create(user, dto);
}
```

- `JwtAuthGuard` — validates token, attaches `user`.
- `RolesGuard` — checks `@Roles(...)`.
- `AccessLevelGuard` — checks data-room / reveal access level (§27).
- `@Public()` decorator marks routes that skip auth (login, public listings).

## Validation

- Every request body → a **DTO** with `class-validator` decorators.
- Global `ValidationPipe({ whitelist: true, transform: true })` in `main.ts`.
- Reject unknown fields; never trust client input.

## Errors

- Throw Nest `HttpException` subclasses (`NotFoundException`, `ForbiddenException`…).
- A global exception filter shapes them into a consistent JSON error envelope.
- Never leak stack traces or DB errors to clients.

## Audit & AI rules (spec-critical)

- Sensitive actions (reveal, download, print, approve, sign) → write an **AuditLog** row via an interceptor/service.
- AI/financial engine results → store `{ inputs, formulaVersion, assumptions, confidence, generatedAt }`.
- Never persist a computed financial output without its inputs + version.

## Checklist — "how to add a new module"

1. `nest g module modules/<name>` + `nest g controller` + `nest g service`.
2. Add `repository` + `dto/` + `entities/`.
3. Add Prisma model(s) → `npx prisma migrate dev`.
4. Wire guards & roles.
5. Write service unit tests + one e2e happy path.
6. Register module in `app.module.ts`.
7. Document endpoints (Swagger decorators auto-generate `/api/docs`).
