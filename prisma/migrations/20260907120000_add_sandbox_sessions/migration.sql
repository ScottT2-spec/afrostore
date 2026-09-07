-- CreateTable
CREATE TABLE "sandbox_sessions" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'daytona',
    "externalId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'creating',
    "previewUrl" TEXT,
    "errorMessage" TEXT,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sandbox_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sandbox_sessions_siteId_idx" ON "sandbox_sessions"("siteId");

-- CreateIndex
CREATE INDEX "sandbox_sessions_status_idx" ON "sandbox_sessions"("status");

-- AddForeignKey
ALTER TABLE "sandbox_sessions" ADD CONSTRAINT "sandbox_sessions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
