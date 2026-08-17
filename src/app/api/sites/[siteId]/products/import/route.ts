import { NextRequest } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, ensureUniqueSlug, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export const maxDuration = 60;

const MAX_ROWS = 5000;
const VALID_STATUSES = new Set(["ACTIVE", "DRAFT", "ARCHIVED"]);

interface RowResult {
  row: number; // 1-based, matches spreadsheet row (header = row 1)
  name?: string;
  status: "created" | "updated" | "error";
  message?: string;
}

function truthy(v: string | undefined): boolean {
  const s = (v || "").trim().toLowerCase();
  return s === "yes" || s === "true" || s === "1";
}

function parseNumber(v: string | undefined): number | undefined {
  if (!v || !v.trim()) return undefined;
  const n = Number(v.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

// POST /api/sites/:siteId/products/import
// Body: { csv: string } — the raw CSV file contents, read client-side via
// File.text() before sending. Matches the export format from
// /products/export (same column headers), so an export-edit-reimport
// round trip works, and also accepts the header-only /export?template=1
// sheet filled in from scratch.
//
// Row matching for update-vs-create, in priority order: SKU, then
// Barcode, then an exact (case-insensitive) Name match within this
// store. No match on any of those → a new product is created.
//
// One bad row never fails the whole import — every row is processed
// independently and reported in the results array, so a merchant
// uploading a few thousand rows doesn't lose everything over one typo.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json().catch(() => null);
  const csv = body?.csv;
  if (!csv || typeof csv !== "string") return error("Missing csv field (raw CSV text)", 400);

  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return error(`Couldn't parse that CSV: ${parsed.errors[0].message}`, 400);
  }

  const rows = parsed.data;
  if (rows.length === 0) return error("No data rows found in the CSV", 400);
  if (rows.length > MAX_ROWS) return error(`Too many rows — max ${MAX_ROWS} per import. Split the file and import in batches.`, 400);

  // Normalize header keys once (case/space-insensitive lookup) since
  // spreadsheet exports often vary in casing/spacing.
  const keyOf = (row: Record<string, string>, ...names: string[]): string | undefined => {
    const normalized = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v]));
    for (const name of names) {
      const v = normalized[name.toLowerCase()];
      if (v !== undefined) return v;
    }
    return undefined;
  };

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ where: { siteId }, select: { id: true, name: true } }),
    prisma.brand.findMany({ where: { siteId }, select: { id: true, name: true } }),
  ]);
  const categoryByName = new Map<string, string>(categories.map((c: { id: string; name: string }) => [c.name.toLowerCase(), c.id]));
  const brandByName = new Map<string, string>(brands.map((b: { id: string; name: string }) => [b.name.toLowerCase(), b.id]));

  const results: RowResult[] = [];
  let created = 0, updated = 0, failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // header is row 1
    const row = rows[i];

    try {
      const name = (keyOf(row, "Name") || "").trim();
      const priceRaw = keyOf(row, "Price");
      const price = parseNumber(priceRaw);

      if (!name) { results.push({ row: rowNum, status: "error", message: "Missing Name" }); failed++; continue; }
      if (price === undefined || price <= 0) { results.push({ row: rowNum, status: "error", message: "Missing or invalid Price" }); failed++; continue; }

      const sku = (keyOf(row, "SKU") || "").trim() || undefined;
      const barcode = (keyOf(row, "Barcode") || "").trim() || undefined;
      const description = (keyOf(row, "Description") || "").trim();
      const compareAtPrice = parseNumber(keyOf(row, "Compare At Price"));
      const costPrice = parseNumber(keyOf(row, "Cost Price"));
      const stock = parseNumber(keyOf(row, "Stock")) ?? 0;
      const trackInventory = keyOf(row, "Track Inventory") !== undefined ? truthy(keyOf(row, "Track Inventory")) : true;
      const lowStockAlert = parseNumber(keyOf(row, "Low Stock Alert")) ?? 5;
      const categoryName = (keyOf(row, "Category") || "").trim();
      const brandName = (keyOf(row, "Brand") || "").trim();
      const statusRaw = (keyOf(row, "Status") || "ACTIVE").trim().toUpperCase();
      const status = VALID_STATUSES.has(statusRaw) ? statusRaw : "ACTIVE";
      const tags = (keyOf(row, "Tags") || "").split(";").map((t) => t.trim()).filter(Boolean);

      let categoryId: string | undefined;
      if (categoryName) {
        categoryId = categoryByName.get(categoryName.toLowerCase());
        if (!categoryId) {
          const slug = await ensureUniqueSlug(categoryName, siteId, "category");
          const newCategory = await prisma.category.create({ data: { siteId, name: categoryName, slug } });
          const newCategoryId: string = newCategory.id;
          categoryId = newCategoryId;
          categoryByName.set(categoryName.toLowerCase(), newCategoryId);
        }
      }

      let brandId: string | undefined;
      if (brandName) {
        brandId = brandByName.get(brandName.toLowerCase());
        if (!brandId) {
          const createdBrand = await prisma.brand.create({ data: { siteId, name: brandName } });
          const newBrandId: string = createdBrand.id;
          brandId = newBrandId;
          brandByName.set(brandName.toLowerCase(), newBrandId);
        }
      }

      // Match an existing product: SKU, then Barcode, then exact Name.
      let existing = null as { id: string } | null;
      if (sku) existing = await prisma.product.findFirst({ where: { siteId, sku } });
      if (!existing && barcode) existing = await prisma.product.findFirst({ where: { siteId, barcode } });
      if (!existing) existing = await prisma.product.findFirst({ where: { siteId, name: { equals: name, mode: "insensitive" } } });

      if (barcode) {
        const barcodeOwner = await prisma.product.findFirst({ where: { siteId, barcode } });
        if (barcodeOwner && barcodeOwner.id !== existing?.id) {
          results.push({ row: rowNum, name, status: "error", message: `Barcode "${barcode}" is already used by a different product` });
          failed++;
          continue;
        }
      }

      const data = {
        name, description, price, compareAtPrice, costPrice, sku, barcode,
        stock, trackInventory, lowStockAlert, categoryId, brandId,
        status: status as "ACTIVE" | "DRAFT" | "ARCHIVED", tags,
      };

      if (existing) {
        await prisma.product.update({ where: { id: existing.id }, data });
        results.push({ row: rowNum, name, status: "updated" });
        updated++;
      } else {
        const slug = await ensureUniqueSlug(name, siteId, "product");
        await prisma.product.create({ data: { ...data, siteId, slug } });
        results.push({ row: rowNum, name, status: "created" });
        created++;
      }
    } catch (err) {
      results.push({ row: rowNum, status: "error", message: err instanceof Error ? err.message : "Unknown error" });
      failed++;
    }
  }

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "IMPORT", entity: "product",
    after: { totalRows: rows.length, created, updated, failed } as any,
  });

  return success({
    totalRows: rows.length,
    created,
    updated,
    failed,
    errors: results.filter((r) => r.status === "error"),
  });
}
