-- CreateEnum
CREATE TYPE "OwnerCategory" AS ENUM ('PRIVATE', 'SEMI_GOVERNMENT', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'MATCHED', 'IN_DEAL', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VerificationTier" AS ENUM ('T0', 'T1', 'T2', 'T3', 'T4', 'T5');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PermitStatus" AS ENUM ('NONE', 'PRELIMINARY', 'IN_PROGRESS', 'APPROVED');

-- CreateEnum
CREATE TYPE "DataRoomReadiness" AS ENUM ('EMPTY', 'BASIC', 'PARTIAL', 'COMPLETE');

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sector" TEXT NOT NULL,
    "projectType" TEXT,
    "ownerCategory" "OwnerCategory" NOT NULL DEFAULT 'PRIVATE',
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "verification" "VerificationTier" NOT NULL DEFAULT 'T0',
    "countryCode" TEXT NOT NULL,
    "region" TEXT,
    "city" TEXT,
    "addressLine" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "landAreaSqm" DOUBLE PRECISION,
    "gfaSqm" DOUBLE PRECISION,
    "buaSqm" DOUBLE PRECISION,
    "nsaSqm" DOUBLE PRECISION,
    "plotRatio" DOUBLE PRECISION,
    "landUse" TEXT,
    "heightLimit" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "projectValueCents" BIGINT,
    "investmentRequiredCents" BIGINT,
    "targetIrr" DOUBLE PRECISION,
    "developmentPeriodMonths" INTEGER,
    "concessionPeriodYears" INTEGER,
    "structures" TEXT[],
    "riskLevel" "RiskLevel",
    "permitStatus" "PermitStatus" NOT NULL DEFAULT 'NONE',
    "dataRoomReadiness" "DataRoomReadiness" NOT NULL DEFAULT 'EMPTY',
    "requiredDeveloperExperience" TEXT,
    "requiredContractorClass" TEXT,
    "requiredOperatorType" TEXT,
    "financingRequired" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_reference_key" ON "Opportunity"("reference");

-- CreateIndex
CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");

-- CreateIndex
CREATE INDEX "Opportunity_countryCode_idx" ON "Opportunity"("countryCode");

-- CreateIndex
CREATE INDEX "Opportunity_sector_idx" ON "Opportunity"("sector");

-- CreateIndex
CREATE INDEX "Opportunity_ownerId_idx" ON "Opportunity"("ownerId");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
