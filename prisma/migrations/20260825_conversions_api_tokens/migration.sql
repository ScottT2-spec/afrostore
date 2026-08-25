ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "metaAccessToken" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "metaTestEventCode" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "tiktokAccessToken" TEXT;
