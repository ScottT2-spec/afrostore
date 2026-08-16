import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/products/by-barcode?code=XXXX
// Exact-match lookup for scan-to-find — a barcode scanner (or manual entry
// of a scanned code) types/emits the full code and expects a single,
// unambiguous product back, not a fuzzy search result list.
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.trim();
  if (!code) return error("Missing code query param", 400);

  const product = await prisma.product.findFirst({
    where: { siteId, barcode: code },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { orderBy: { position: "asc" } },
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
    },
  });

  if (!product) return error("No product found with that barcode", 404);
  return success(product);
}
