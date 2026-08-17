-- Split/partial payment support: an order can now be paid via more than
-- one PaymentTransaction (the schema already allowed many transactions
-- per order — orderId was never unique — the application logic just
-- never created more than one). This migration adds the pieces needed
-- to track partial progress toward the order total.

-- New enum values. Postgres requires ALTER TYPE ... ADD VALUE to run
-- outside the transaction that then USES the new value, so this file
-- only adds the values — nothing in this same migration references them.
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_PAID';
ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'MANUAL';

-- Running total of confirmed payments against an order.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Backfill: existing orders already marked PAID are, by definition,
-- paid in full — safe, non-destructive data enrichment, and doesn't
-- reference either new enum value.
UPDATE "orders" SET "amountPaid" = "total" WHERE "paymentStatus" = 'PAID' AND "amountPaid" = 0;
