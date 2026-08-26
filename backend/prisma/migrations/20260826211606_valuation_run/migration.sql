-- CreateTable
CREATE TABLE "ValuationRun" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT,
    "createdById" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "label" TEXT,
    "formulaVersion" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "assumptions" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ValuationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ValuationRun_createdById_idx" ON "ValuationRun"("createdById");

-- CreateIndex
CREATE INDEX "ValuationRun_opportunityId_idx" ON "ValuationRun"("opportunityId");

-- AddForeignKey
ALTER TABLE "ValuationRun" ADD CONSTRAINT "ValuationRun_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
