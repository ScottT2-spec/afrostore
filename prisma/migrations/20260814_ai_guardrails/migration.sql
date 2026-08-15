-- AI guardrails: persisted spend-cap counters (per-site and platform-wide).
-- In-memory usage tracking in AIFailover.getTotalCost() doesn't survive
-- serverless cold starts and isn't shared across instances, so it can't
-- actually enforce a cap. These tables give the cap something durable to
-- check against.

CREATE TABLE IF NOT EXISTS "ai_usage_daily" (
  "id"              TEXT NOT NULL,
  "siteId"          TEXT NOT NULL,
  "date"            TEXT NOT NULL,
  "requests"        INTEGER NOT NULL DEFAULT 0,
  "inputTokens"     INTEGER NOT NULL DEFAULT 0,
  "outputTokens"    INTEGER NOT NULL DEFAULT 0,
  "costUsd"         DECIMAL(10,4) NOT NULL DEFAULT 0,
  "blockedRequests" INTEGER NOT NULL DEFAULT 0,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ai_usage_daily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_usage_daily_siteId_date_key" ON "ai_usage_daily"("siteId", "date");
CREATE INDEX IF NOT EXISTS "ai_usage_daily_siteId_idx" ON "ai_usage_daily"("siteId");

DO $$ BEGIN
  ALTER TABLE "ai_usage_daily" ADD CONSTRAINT "ai_usage_daily_siteId_fkey"
    FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ai_platform_usage_daily" (
  "id"              TEXT NOT NULL,
  "date"            TEXT NOT NULL,
  "requests"        INTEGER NOT NULL DEFAULT 0,
  "costUsd"         DECIMAL(10,4) NOT NULL DEFAULT 0,
  "blockedRequests" INTEGER NOT NULL DEFAULT 0,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ai_platform_usage_daily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_platform_usage_daily_date_key" ON "ai_platform_usage_daily"("date");
