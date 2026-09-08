-- CreateTable
CREATE TABLE "coding_agent_runs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "sandboxExternalId" TEXT,
    "task" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "summary" TEXT,
    "filesChanged" JSONB,
    "qualityChecklist" JSONB,
    "iterations" INTEGER NOT NULL DEFAULT 0,
    "toolCallCount" INTEGER NOT NULL DEFAULT 0,
    "provider" TEXT,
    "model" TEXT,
    "error" TEXT,
    "source" TEXT NOT NULL DEFAULT 'live',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "coding_agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coding_agent_runs_siteId_idx" ON "coding_agent_runs"("siteId");

-- CreateIndex
CREATE INDEX "coding_agent_runs_status_idx" ON "coding_agent_runs"("status");

-- CreateIndex
CREATE INDEX "coding_agent_runs_source_idx" ON "coding_agent_runs"("source");

-- AddForeignKey
ALTER TABLE "coding_agent_runs" ADD CONSTRAINT "coding_agent_runs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
