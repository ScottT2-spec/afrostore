-- Track loyalty points redeemed at checkout so we can price the discount
-- into the order total up front and finalize the balance deduction only
-- once payment actually succeeds (see src/lib/loyalty.ts).
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "loyaltyPointsRedeemed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "loyaltyDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0;
