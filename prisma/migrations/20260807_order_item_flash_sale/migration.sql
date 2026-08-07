-- Track the pre-discount price and which flash sale (if any) applied to an order item.
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(12,2);
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "flashSaleId" TEXT;
