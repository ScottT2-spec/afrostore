-- Phase 1 of multi-location support: just the locations themselves.
-- Deliberately does NOT touch products.stock or its meaning — moving to
-- real per-location stock needs a data migration reassigning every
-- existing product's stock to a location, which shouldn't ship without
-- testing against a live database first. This migration only adds a new,
-- unreferenced table plus one seed row per existing site, so it can't
-- corrupt or reinterpret any existing data.

CREATE TABLE IF NOT EXISTS "locations" (
  "id"        TEXT NOT NULL,
  "siteId"    TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "address"   TEXT,
  "city"      TEXT,
  "state"     TEXT,
  "country"   TEXT,
  "phone"     TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "locations_siteId_idx" ON "locations"("siteId");

DO $$ BEGIN
  ALTER TABLE "locations" ADD CONSTRAINT "locations_siteId_fkey"
    FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed a default "Main Location" for every existing site that doesn't
-- already have one, so merchants aren't dropped into an empty list.
INSERT INTO "locations" ("id", "siteId", "name", "isDefault", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, s."id", 'Main Location', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "sites" s
WHERE NOT EXISTS (SELECT 1 FROM "locations" l WHERE l."siteId" = s."id");
