-- Add real contact fields so the AI (and the merchant directly) has
-- actual data to show on the contact page, instead of hardcoded
-- placeholder text or AI-guessed values.
ALTER TABLE "site_settings" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "site_settings" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "site_settings" ADD COLUMN "contactAddress" TEXT;
