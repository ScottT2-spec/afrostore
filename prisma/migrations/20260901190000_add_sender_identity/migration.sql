-- CreateTable
CREATE TABLE "sender_identities" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "sender_identities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sender_identities_siteId_idx" ON "sender_identities"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "sender_identities_siteId_email_key" ON "sender_identities"("siteId", "email");

-- AddForeignKey
ALTER TABLE "sender_identities" ADD CONSTRAINT "sender_identities_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
