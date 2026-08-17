import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const HEADER = [
  "SKU", "Barcode", "Name", "Description", "Price", "Compare At Price", "Cost Price",
  "Stock", "Track Inventory", "Low Stock Alert", "Category", "Brand", "Status", "Tags",
];

// GET /api/sites/:siteId/products/export — CSV download.
// GET /api/sites/:siteId/products/export?template=1 — header-only CSV, for
// merchants who want to fill in a blank sheet rather than edit an export.
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const isTemplate = url.searchParams.get("template") === "1";

  let lines = [HEADER.join(",")];

  if (!isTemplate) {
    const products = await prisma.product.findMany({
      where: { siteId },
      orderBy: { name: "asc" },
      include: { category: { select: { name: true } }, brand: { select: { name: true } } },
    });

    lines = lines.concat(
      products.map((p) =>
        [
          p.sku || "",
          p.barcode || "",
          p.name,
          p.description || "",
          Number(p.price),
          p.compareAtPrice ? Number(p.compareAtPrice) : "",
          p.costPrice ? Number(p.costPrice) : "",
          p.stock,
          p.trackInventory ? "yes" : "no",
          p.lowStockAlert,
          p.category?.name || "",
          p.brand?.name || "",
          p.status,
          (p.tags || []).join("; "),
        ]
          .map(csvEscape)
          .join(",")
      )
    );
  }

  const csv = lines.join("\n");
  const filename = isTemplate ? "products-import-template.csv" : `products-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
