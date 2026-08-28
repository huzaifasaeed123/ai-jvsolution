-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('OPEN', 'CLOSED', 'ORIGINAL_WINS', 'CHALLENGER_WINS', 'CANCELLED');

-- CreateTable
CREATE TABLE "Clarification" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "askedById" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "answeredById" TEXT,
    "answeredAt" TIMESTAMP(3),
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clarification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addendum" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "newSubmissionDeadline" TIMESTAMP(3),
    "issuedById" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Addendum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwissChallenge" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "originatorId" TEXT NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'OPEN',
    "challengeWindowDays" INTEGER NOT NULL DEFAULT 30,
    "challengeDeadline" TIMESTAMP(3) NOT NULL,
    "originatorMayMatch" BOOLEAN NOT NULL DEFAULT true,
    "outcomeNotes" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwissChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Clarification_tenderId_idx" ON "Clarification"("tenderId");

-- CreateIndex
CREATE INDEX "Clarification_askedById_idx" ON "Clarification"("askedById");

-- CreateIndex
CREATE INDEX "Addendum_tenderId_idx" ON "Addendum"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "Addendum_tenderId_number_key" ON "Addendum"("tenderId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "SwissChallenge_tenderId_key" ON "SwissChallenge"("tenderId");

-- CreateIndex
CREATE INDEX "SwissChallenge_originatorId_idx" ON "SwissChallenge"("originatorId");

-- AddForeignKey
ALTER TABLE "Clarification" ADD CONSTRAINT "Clarification_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clarification" ADD CONSTRAINT "Clarification_askedById_fkey" FOREIGN KEY ("askedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addendum" ADD CONSTRAINT "Addendum_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwissChallenge" ADD CONSTRAINT "SwissChallenge_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwissChallenge" ADD CONSTRAINT "SwissChallenge_originatorId_fkey" FOREIGN KEY ("originatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
