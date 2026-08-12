-- The TaxRule model and Order.tax field were added to schema.prisma back
-- when the Taxes feature was first built, but no migration was ever created
-- for either — the tax_rules table has never existed in the database.
-- Checkout started actually querying it (to apply the default tax rate)
-- once tax-at-checkout was wired up, which is why every checkout attempt
-- since then has failed with a database error ("relation tax_rules does
-- not exist" / "column tax does not exist").

CREATE TABLE IF NOT EXISTS "tax_rules" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tax_rules_siteId_idx" ON "tax_rules"("siteId");

DO $$ BEGIN
    ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_siteId_fkey"
        FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tax" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Same gap, same original commit: the Returns Management feature (the
-- Return model / /dashboard/returns) has also never had a migration.
-- Not the cause of the checkout error, but included here since it's the
-- same root cause and safe to apply at the same time.
DO $$ BEGIN
    CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "returns" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "refundAmount" DECIMAL(12,2),
    "refundMethod" TEXT,
    "items" JSONB,
    "notes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "returns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "returns_siteId_idx" ON "returns"("siteId");
CREATE INDEX IF NOT EXISTS "returns_orderId_idx" ON "returns"("orderId");

DO $$ BEGIN
    ALTER TABLE "returns" ADD CONSTRAINT "returns_siteId_fkey"
        FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "returns" ADD CONSTRAINT "returns_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
