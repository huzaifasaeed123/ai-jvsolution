-- CreateTable
CREATE TABLE "Mandate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sectors" TEXT[],
    "countryCodes" TEXT[],
    "projectTypes" TEXT[],
    "structures" TEXT[],
    "ownerCategories" "OwnerCategory"[],
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "minInvestmentCents" BIGINT,
    "maxInvestmentCents" BIGINT,
    "targetIrr" DOUBLE PRECISION,
    "riskAppetite" "RiskLevel",
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Mandate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mandate_ownerId_idx" ON "Mandate"("ownerId");

-- CreateIndex
CREATE INDEX "Mandate_active_idx" ON "Mandate"("active");

-- AddForeignKey
ALTER TABLE "Mandate" ADD CONSTRAINT "Mandate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
