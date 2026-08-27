CREATE TYPE "ConsortiumStatus" AS ENUM ('FORMING', 'ACTIVE', 'DISBANDED');
CREATE TYPE "MemberStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED', 'REMOVED');

CREATE TABLE "Consortium" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "opportunityId" TEXT,
    "leadId" TEXT NOT NULL,
    "status" "ConsortiumStatus" NOT NULL DEFAULT 'FORMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Consortium_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Consortium_leadId_idx" ON "Consortium"("leadId");
CREATE INDEX "Consortium_opportunityId_idx" ON "Consortium"("opportunityId");

CREATE TABLE "ConsortiumMember" (
    "id" TEXT NOT NULL,
    "consortiumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "equityPct" DOUBLE PRECISION,
    "status" "MemberStatus" NOT NULL DEFAULT 'INVITED',
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ConsortiumMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ConsortiumMember_consortiumId_userId_key" ON "ConsortiumMember"("consortiumId", "userId");
CREATE INDEX "ConsortiumMember_consortiumId_idx" ON "ConsortiumMember"("consortiumId");
CREATE INDEX "ConsortiumMember_userId_idx" ON "ConsortiumMember"("userId");

ALTER TABLE "Consortium" ADD CONSTRAINT "Consortium_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Consortium" ADD CONSTRAINT "Consortium_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConsortiumMember" ADD CONSTRAINT "ConsortiumMember_consortiumId_fkey" FOREIGN KEY ("consortiumId") REFERENCES "Consortium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConsortiumMember" ADD CONSTRAINT "ConsortiumMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
