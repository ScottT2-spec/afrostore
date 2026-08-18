-- AlterTable: users — extended profile fields (personal, contact, guardian/ID, address, bank, social, custom)
ALTER TABLE "users" ADD COLUMN "profileDetails" JSONB;
