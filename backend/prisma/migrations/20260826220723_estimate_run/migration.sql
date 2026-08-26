-- CreateTable
CREATE TABLE "EstimateRun" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT,
    "createdById" TEXT NOT NULL,
    "label" TEXT,
    "formulaVersion" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EstimateRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EstimateRun_createdById_idx" ON "EstimateRun"("createdById");

-- CreateIndex
CREATE INDEX "EstimateRun_opportunityId_idx" ON "EstimateRun"("opportunityId");

-- AddForeignKey
ALTER TABLE "EstimateRun" ADD CONSTRAINT "EstimateRun_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
