-- Google sign-in support.
--
-- passwordHash becomes nullable because an account created through Google
-- never had a password to hash. googleId is the stable subject claim, matched
-- on before email since an address can change hands while the subject cannot.
-- roleConfirmed keeps role non-null (every guard and serializer depends on it)
-- while still letting a Google user be routed to onboarding to pick one.

ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
ALTER TABLE "User" ADD COLUMN "roleConfirmed" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
