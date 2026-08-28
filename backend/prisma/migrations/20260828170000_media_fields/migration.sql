-- Public imagery for demo/marketing surfaces.
-- Values are URLs in dev; production will store object-storage keys resolved
-- through the API, so no schema change is needed to switch drivers.

ALTER TABLE "Company" ADD COLUMN "logoUrl" TEXT;

ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;

ALTER TABLE "Opportunity" ADD COLUMN "coverImageUrl" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
