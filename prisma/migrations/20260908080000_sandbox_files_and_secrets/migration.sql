-- AlterTable
ALTER TABLE "sandbox_sessions" ADD COLUMN "files" JSONB;

-- CreateTable
CREATE TABLE "sandbox_secrets" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sandbox_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sandbox_secrets_siteId_idx" ON "sandbox_secrets"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "sandbox_secrets_siteId_key_key" ON "sandbox_secrets"("siteId", "key");

-- AddForeignKey
ALTER TABLE "sandbox_secrets" ADD CONSTRAINT "sandbox_secrets_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
