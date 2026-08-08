-- The 20260803_funnel_step_crm_links migration was meant to add pageId/formId
-- to funnel_steps, but it originally ran before the funnel_steps table existed
-- (see 20260802_create_funnels) and so it never actually applied these columns —
-- prisma.funnel.create() failed with "column funnel_steps.pageId does not exist".
-- This migration is safe to run whether or not 20260803 ever succeeded, since
-- every statement is guarded with IF NOT EXISTS / duplicate_object.

ALTER TABLE "funnel_steps" ADD COLUMN IF NOT EXISTS "pageId" TEXT;
ALTER TABLE "funnel_steps" ADD COLUMN IF NOT EXISTS "formId" TEXT;

CREATE INDEX IF NOT EXISTS "funnel_steps_pageId_idx" ON "funnel_steps"("pageId");
CREATE INDEX IF NOT EXISTS "funnel_steps_formId_idx" ON "funnel_steps"("formId");

DO $$ BEGIN
  ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_formId_fkey"
    FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
