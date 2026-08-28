-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'WITHDRAWN', 'DISQUALIFIED', 'EVALUATED', 'PREFERRED', 'UNSUCCESSFUL');

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "consortiumId" TEXT,
    "status" "BidStatus" NOT NULL DEFAULT 'DRAFT',
    "technicalProposal" TEXT,
    "methodology" TEXT,
    "deliveryMonths" INTEGER,
    "experienceYears" INTEGER,
    "keyPersonnel" TEXT,
    "localContentPct" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "bidPriceCents" BIGINT,
    "annualPaymentCents" BIGINT,
    "revenueSharePct" DOUBLE PRECISION,
    "financialCapacityCents" BIGINT,
    "bidSecurityProvided" BOOLEAN NOT NULL DEFAULT false,
    "checklistComplete" BOOLEAN NOT NULL DEFAULT false,
    "declarations" TEXT,
    "submittedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "disqualifiedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bid_reference_key" ON "Bid"("reference");

-- CreateIndex
CREATE INDEX "Bid_tenderId_idx" ON "Bid"("tenderId");

-- CreateIndex
CREATE INDEX "Bid_bidderId_idx" ON "Bid"("bidderId");

-- CreateIndex
CREATE INDEX "Bid_status_idx" ON "Bid"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_tenderId_bidderId_key" ON "Bid"("tenderId", "bidderId");

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_consortiumId_fkey" FOREIGN KEY ("consortiumId") REFERENCES "Consortium"("id") ON DELETE SET NULL ON UPDATE CASCADE;
