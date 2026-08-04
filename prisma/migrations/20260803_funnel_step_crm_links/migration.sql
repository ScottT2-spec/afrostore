-- Link funnel steps to real Page/Form records, and form submissions to CRM contacts
ALTER TABLE "funnel_steps" ADD COLUMN IF NOT EXISTS "pageId" TEXT;
ALTER TABLE "funnel_steps" ADD COLUMN IF NOT EXISTS "formId" TEXT;

ALTER TABLE "form_submissions" ADD COLUMN IF NOT EXISTS "funnelStepId" TEXT;
ALTER TABLE "form_submissions" ADD COLUMN IF NOT EXISTS "crmContactId" TEXT;

CREATE INDEX IF NOT EXISTS "funnel_steps_pageId_idx" ON "funnel_steps"("pageId");
CREATE INDEX IF NOT EXISTS "funnel_steps_formId_idx" ON "funnel_steps"("formId");
CREATE INDEX IF NOT EXISTS "form_submissions_crmContactId_idx" ON "form_submissions"("crmContactId");

DO $$ BEGIN
  ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_formId_fkey"
    FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_crmContactId_fkey"
    FOREIGN KEY ("crmContactId") REFERENCES "crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
