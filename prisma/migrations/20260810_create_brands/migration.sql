-- Same gap as funnels/ab_tests: the Brand model and Product.brandId existed
-- in schema.prisma and the /brands API routes actively used them, but no
-- migration ever created the table or column, so creating a brand throws
-- "relation \"brands\" does not exist".

CREATE TABLE IF NOT EXISTS "brands" (
  "id"          TEXT NOT NULL,
  "siteId"      TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "logo"        TEXT,
  "description" TEXT,
  "website"     TEXT,
  "position"    INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "brands_siteId_slug_key" ON "brands"("siteId", "slug");
CREATE INDEX IF NOT EXISTS "brands_siteId_idx" ON "brands"("siteId");

DO $$ BEGIN
  ALTER TABLE "brands" ADD CONSTRAINT "brands_siteId_fkey"
    FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brandId" TEXT;
CREATE INDEX IF NOT EXISTS "products_siteId_brandId_idx" ON "products"("siteId", "brandId");

DO $$ BEGIN
  ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey"
    FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
