-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('EOI', 'OFFER');
CREATE TYPE "OfferStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "OfferType" NOT NULL DEFAULT 'OFFER',
    "status" "OfferStatus" NOT NULL DEFAULT 'SUBMITTED',
    "structure" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "investmentAmountCents" BIGINT,
    "ownerSharePct" DOUBLE PRECISION,
    "targetIrr" DOUBLE PRECISION,
    "developmentMonths" INTEGER,
    "experienceYears" INTEGER,
    "financialCapacityCents" BIGINT,
    "guarantees" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Offer_opportunityId_submittedById_key" ON "Offer"("opportunityId", "submittedById");
CREATE INDEX "Offer_ownerId_idx" ON "Offer"("ownerId");
CREATE INDEX "Offer_submittedById_idx" ON "Offer"("submittedById");
CREATE INDEX "Offer_opportunityId_idx" ON "Offer"("opportunityId");

ALTER TABLE "Offer" ADD CONSTRAINT "Offer_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
