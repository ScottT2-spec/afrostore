-- Per-variant performance tracking for A/B tests (views + conversions),
-- so the dashboard can actually show results and traffic can be split on the storefront.
CREATE TABLE IF NOT EXISTS "ab_test_stats" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_test_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ab_test_stats_testId_variantId_key" ON "ab_test_stats"("testId", "variantId");
CREATE INDEX IF NOT EXISTS "ab_test_stats_testId_idx" ON "ab_test_stats"("testId");

DO $$ BEGIN
  ALTER TABLE "ab_test_stats" ADD CONSTRAINT "ab_test_stats_testId_fkey"
    FOREIGN KEY ("testId") REFERENCES "ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
