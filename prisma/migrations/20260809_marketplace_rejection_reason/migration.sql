-- AlterTable: marketplace_items — reason shown to the submitter when an admin rejects their listing
ALTER TABLE "marketplace_items" ADD COLUMN "rejectionReason" TEXT;
