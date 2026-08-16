-- The `barcode` column on products already existed but had no uniqueness
-- constraint or index — two products in the same store could carry an
-- identical barcode with nothing preventing it, which would make
-- scan-to-find ambiguous/wrong. Postgres unique indexes allow multiple
-- NULLs (NULL is never equal to NULL), so this stays fully backward
-- compatible with existing products that have no barcode set.

CREATE UNIQUE INDEX IF NOT EXISTS "products_siteId_barcode_key" ON "products"("siteId", "barcode");
