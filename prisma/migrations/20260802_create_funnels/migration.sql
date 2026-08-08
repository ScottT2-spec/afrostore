-- The Funnel/FunnelStep models existed in schema.prisma and in application code
-- (funnel create/list/step routes) but were never given a migration to actually
-- create their tables — so any real deploy hits "relation does not exist" and
-- the API routes catch that and return a generic 500 on funnel creation.

DO $$ BEGIN
  CREATE TYPE "FunnelStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "FunnelStepType" AS ENUM ('LANDING', 'LEAD_FORM', 'THANK_YOU', 'CHECKOUT', 'UPSELL', 'DOWNSELL', 'CONFIRMATION', 'WEBINAR', 'VIDEO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "funnels" (
  "id"          TEXT NOT NULL,
  "siteId"      TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "status"      "FunnelStatus" NOT NULL DEFAULT 'DRAFT',
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "funnels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "funnel_steps" (
  "id"              TEXT NOT NULL,
  "funnelId"        TEXT NOT NULL,
  "name"            TEXT NOT NULL,
  "type"            "FunnelStepType" NOT NULL DEFAULT 'LANDING',
  "pageContent"     JSONB,
  "position"        INTEGER NOT NULL DEFAULT 0,
  "settings"        JSONB,
  "conversionCount" INTEGER NOT NULL DEFAULT 0,
  "viewCount"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "funnel_steps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "funnels_siteId_idx" ON "funnels"("siteId");
CREATE INDEX IF NOT EXISTS "funnel_steps_funnelId_idx" ON "funnel_steps"("funnelId");

DO $$ BEGIN
  ALTER TABLE "funnels" ADD CONSTRAINT "funnels_siteId_fkey"
    FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_funnelId_fkey"
    FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
