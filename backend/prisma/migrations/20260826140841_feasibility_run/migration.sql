-- CreateTable
CREATE TABLE "FeasibilityRun" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT,
    "createdById" TEXT NOT NULL,
    "label" TEXT,
    "formulaVersion" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "assumptions" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeasibilityRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeasibilityRun_createdById_idx" ON "FeasibilityRun"("createdById");

-- CreateIndex
CREATE INDEX "FeasibilityRun_opportunityId_idx" ON "FeasibilityRun"("opportunityId");

-- AddForeignKey
ALTER TABLE "FeasibilityRun" ADD CONSTRAINT "FeasibilityRun_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
