-- AlterTable: email_campaigns — audience selection + error tracking
ALTER TABLE "email_campaigns" ADD COLUMN     "audienceType" TEXT NOT NULL DEFAULT 'ALL_CONTACTS',
ADD COLUMN     "audienceTag" TEXT,
ADD COLUMN     "lastError" TEXT;

-- AlterTable: email_recipients — per-recipient error tracking
ALTER TABLE "email_recipients" ADD COLUMN     "error" TEXT;

-- AlterTable: sms_campaigns — audience selection + error tracking
ALTER TABLE "sms_campaigns" ADD COLUMN     "audienceType" TEXT NOT NULL DEFAULT 'ALL_CONTACTS',
ADD COLUMN     "audienceTag" TEXT,
ADD COLUMN     "lastError" TEXT;

-- AlterTable: whatsapp_campaigns — audience selection + error tracking
ALTER TABLE "whatsapp_campaigns" ADD COLUMN     "audienceType" TEXT NOT NULL DEFAULT 'ALL_CONTACTS',
ADD COLUMN     "audienceTag" TEXT,
ADD COLUMN     "lastError" TEXT;

-- CreateTable: sms_recipients (previously did not exist — SMS campaigns had no
-- way to track who they were sent to at all)
CREATE TABLE "sms_recipients" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable: whatsapp_recipients (same gap as SMS)
CREATE TABLE "whatsapp_recipients" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sms_recipients_campaignId_idx" ON "sms_recipients"("campaignId");
CREATE INDEX "sms_recipients_phone_idx" ON "sms_recipients"("phone");
CREATE INDEX "whatsapp_recipients_campaignId_idx" ON "whatsapp_recipients"("campaignId");
CREATE INDEX "whatsapp_recipients_phone_idx" ON "whatsapp_recipients"("phone");

-- AddForeignKey
ALTER TABLE "sms_recipients" ADD CONSTRAINT "sms_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "sms_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sms_recipients" ADD CONSTRAINT "sms_recipients_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "whatsapp_recipients" ADD CONSTRAINT "whatsapp_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "whatsapp_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_recipients" ADD CONSTRAINT "whatsapp_recipients_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
