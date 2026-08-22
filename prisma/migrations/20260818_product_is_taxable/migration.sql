-- Per-product tax control: previously tax was purely site-wide (whichever
-- TaxRule was marked isDefault), with no way to exempt a specific product.
ALTER TABLE "products" ADD COLUMN "isTaxable" BOOLEAN NOT NULL DEFAULT true;
