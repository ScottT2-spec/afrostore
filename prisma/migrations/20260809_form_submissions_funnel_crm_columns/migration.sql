-- Same root cause as 20260808_funnel_steps_page_form_columns: the original
-- 20260803_funnel_step_crm_links migration ran as one transaction, and its
-- first statements (ALTER funnel_steps) failed because that table didn't
-- exist yet — so the whole transaction rolled back, including these
-- form_submissions columns. Form submissions from a funnel lead-form step
-- fail with "Failed to submit form" because funnelStepId/crmContactId
-- don't exist on the table.

ALTER TABLE "form_submissions" ADD COLUMN IF NOT EXISTS "funnelStepId" TEXT;
ALTER TABLE "form_submissions" ADD COLUMN IF NOT EXISTS "crmContactId" TEXT;

CREATE INDEX IF NOT EXISTS "form_submissions_crmContactId_idx" ON "form_submissions"("crmContactId");

DO $$ BEGIN
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_crmContactId_fkey"
    FOREIGN KEY ("crmContactId") REFERENCES "crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
