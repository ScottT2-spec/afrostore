ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "visitorId" TEXT;
CREATE INDEX IF NOT EXISTS "analytics_events_visitorId_idx" ON "analytics_events"("visitorId");
