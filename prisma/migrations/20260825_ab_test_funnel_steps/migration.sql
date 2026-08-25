ALTER TABLE "ab_tests" ADD COLUMN IF NOT EXISTS "funnelStepId" TEXT;

CREATE INDEX IF NOT EXISTS "ab_tests_funnelStepId_idx" ON "ab_tests"("funnelStepId");

DO $$ BEGIN
  ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_funnelStepId_fkey"
    FOREIGN KEY ("funnelStepId") REFERENCES "funnel_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
