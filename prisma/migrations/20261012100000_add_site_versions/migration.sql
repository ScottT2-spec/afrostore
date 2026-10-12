-- CreateTable
CREATE TABLE "site_versions" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "label" TEXT,
    "snapshot" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_versions_siteId_createdAt_idx" ON "site_versions"("siteId", "createdAt");

-- AddForeignKey
ALTER TABLE "site_versions" ADD CONSTRAINT "site_versions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
