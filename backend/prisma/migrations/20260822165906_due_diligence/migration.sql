-- CreateEnum
CREATE TYPE "RiskRating" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('NOT_RECEIVED', 'RECEIVED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "DdReviewStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'REVIEWED');

-- CreateEnum
CREATE TYPE "ClosureStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "DueDiligenceItem" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "receipt" "ReceiptStatus" NOT NULL DEFAULT 'NOT_RECEIVED',
    "reviewStatus" "DdReviewStatus" NOT NULL DEFAULT 'PENDING',
    "riskRating" "RiskRating",
    "finding" TEXT,
    "recommendation" TEXT,
    "responsibleParty" TEXT,
    "mitigation" TEXT,
    "evidence" TEXT,
    "deadline" TIMESTAMP(3),
    "closure" "ClosureStatus" NOT NULL DEFAULT 'OPEN',
    "reviewerId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DueDiligenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DueDiligenceItem_opportunityId_idx" ON "DueDiligenceItem"("opportunityId");

-- CreateIndex
CREATE INDEX "DueDiligenceItem_category_idx" ON "DueDiligenceItem"("category");

-- AddForeignKey
ALTER TABLE "DueDiligenceItem" ADD CONSTRAINT "DueDiligenceItem_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
