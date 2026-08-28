-- CreateEnum
CREATE TYPE "ProcurementType" AS ENUM ('RFI', 'RFQ', 'RFP', 'ITT', 'UNSOLICITED');

-- CreateEnum
CREATE TYPE "TenderStage" AS ENUM ('DRAFT', 'PUBLISHED', 'CLARIFICATION', 'SUBMISSION_CLOSED', 'UNDER_EVALUATION', 'PREFERRED_BIDDER', 'FINANCIAL_CLOSE', 'CANCELLED');

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "procurementType" "ProcurementType" NOT NULL DEFAULT 'RFP',
    "stage" "TenderStage" NOT NULL DEFAULT 'DRAFT',
    "employerRequirements" TEXT,
    "outputSpecification" TEXT,
    "siteInformation" TEXT,
    "governmentSupport" TEXT,
    "paymentMechanism" TEXT,
    "riskAllocation" JSONB,
    "evaluationCriteria" JSONB,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "estimatedValueCents" BIGINT,
    "bidSecurityCents" BIGINT,
    "concessionYears" INTEGER,
    "clarificationDeadline" TIMESTAMP(3),
    "submissionDeadline" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tender_reference_key" ON "Tender"("reference");

-- CreateIndex
CREATE INDEX "Tender_opportunityId_idx" ON "Tender"("opportunityId");

-- CreateIndex
CREATE INDEX "Tender_authorityId_idx" ON "Tender"("authorityId");

-- CreateIndex
CREATE INDEX "Tender_stage_idx" ON "Tender"("stage");

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
