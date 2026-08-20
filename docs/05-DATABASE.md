# Database Design (PostgreSQL + Prisma)

Single Postgres database, accessed only through Prisma, only via each module's
repository layer. `pgvector` added in Phase 4 for AI RAG embeddings.

## Conventions

- Models: PascalCase singular (`Opportunity`). Fields: camelCase.
- Every table: `id` (cuid/uuid), `createdAt`, `updatedAt`. Soft-delete via `deletedAt` where needed.
- Foreign keys: `<relation>Id` (e.g. `ownerId`). Use Prisma relations.
- Enums for fixed sets (Role, AccessLevel, VerificationTier, OpportunityStatus…).
- Money as integer minor units + currency code (never float). Multi-currency ready.
- Migrations committed; never edit a shipped migration — add a new one.

## Entity groups (spec §36 → ~70 entities, phased)

**Identity & org**
User, Company, Role, Permission, Membership, Subscription, Payment

**Geography & reference**
Country, City, CountryIntelligence, CityIntelligence, JvStructure, OpportunityType

**Opportunities (core)**
Opportunity, OpportunityOwner, GovernmentEntity, OpportunityField (public vs confidential),
VerificationRecord (Passport tier), Mandate (developer/investor)

**Data Room & access**
Folder, Document, DocumentVersion, AccessRequest, NdaRecord, RevealApproval,
AccessGrant, AuditLog, Watermark

**AI & financial engines**
FeasibilityModel, EstimateModel, Valuation, Scenario, CashFlow, Score,
EngineRun (inputs + formulaVersion + assumptions + confidence)

**Deal workflow**
DueDiligenceItem, Risk, Question, Answer, Meeting, SiteVisit, Eoi, Offer, Bid,
Consortium, ConsortiumMember, Contract, Permit, Noc

**Companies marketplace**
Contractor, Consultant, Operator, Brand, Bank, FinancingProposal, BrokerProfile, AgencyProfile

**AI assistants & integrations**
AiConversation, AvatarSession, AiCitation, MarketData

**System**
Notification

## Phasing the schema

Do NOT create all 70 tables at once. Add models per phase as their module is built.
Phase 1 subset:

```
User, Company, Role, Membership,
Country, City, JvStructure, OpportunityType,
Opportunity, OpportunityOwner, Mandate, VerificationRecord,
Folder, Document, AccessRequest, NdaRecord, AuditLog,
Score, Offer, Notification
```

## Public vs confidential fields (spec-critical)

Opportunity has **public** fields (sector, country, indicative size) and **confidential**
fields (exact location, owner identity, documents). Confidential fields are only
serialized after access is granted (NDA + reveal). Enforce in the service/serializer,
not just the UI.

## Example Prisma sketch (Phase 1)

```prisma
enum Role { OWNER DEVELOPER INVESTOR GOVERNMENT ADMIN }
enum AccessLevel { PUBLIC REGISTERED VERIFIED NDA DUE_DILIGENCE TRANSACTION }
enum VerificationTier { T0 T1 T2 T3 T4 T5 }
enum OpportunityStatus { DRAFT PUBLISHED MATCHED IN_DEAL CLOSED ARCHIVED }

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  passwordHash String
  fullName  String
  role      Role
  companyId String?
  company   Company? @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Opportunity {
  id            String   @id @default(cuid())
  title         String
  sector        String
  countryCode   String
  status        OpportunityStatus @default(DRAFT)
  verification  VerificationTier  @default(T0)
  ownerId       String
  owner         User     @relation(fields: [ownerId], references: [id])
  // confidential fields gated at serialization:
  exactLocation String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```
