-- Account lifecycle & moderation, for the admin back-office.
-- tokenVersion is what makes suspension and forced sign-out take effect on the
-- next request rather than whenever the access token happens to expire.

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN "suspendedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "suspendedReason" TEXT;
ALTER TABLE "User" ADD COLUMN "suspendedById" TEXT;
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "User_status_idx" ON "User"("status");
