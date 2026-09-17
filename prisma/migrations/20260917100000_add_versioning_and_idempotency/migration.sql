-- CreateTable
CREATE TABLE "page_versions" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_build_requests" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "responseJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ai_build_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_versions_pageId_createdAt_idx" ON "page_versions"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_build_requests_siteId_idx" ON "ai_build_requests"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_build_requests_siteId_idempotencyKey_key" ON "ai_build_requests"("siteId", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_build_requests" ADD CONSTRAINT "ai_build_requests_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
