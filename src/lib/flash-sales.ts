import { prisma } from "@/lib/db";

export type DiscountType = "PERCENTAGE" | "FIXED";

/**
 * This is the single place discount math happens — used both when quoting
 * a sale price to the storefront and when the order route computes the
 * authoritative charge. Keep these in sync by only ever changing it here.
 */
export function applyDiscount(price: number, type: DiscountType, value: number): number {
  const discounted = type === "PERCENTAGE" ? price * (1 - value / 100) : price - value;
  return Math.max(0, Math.round(discounted * 100) / 100);
}

export interface ActiveFlashSale {
  saleId: string;
  saleName: string;
  discountType: DiscountType;
  discountValue: number;
  endsAt: Date;
  salePrice: number;
}

/**
 * Looks up active, non-exhausted flash sales covering the given products and
 * returns the best (lowest resulting price) one per product. "Active" means
 * isActive, within its start/end window, and — if it has a maxUses cap —
 * not yet exhausted. Callers pass in the product's current price so the
 * comparison and salePrice can be computed in one pass.
 */
export async function getBestActiveFlashSales(
  siteId: string,
  productPrices: { id: string; price: number }[]
): Promise<Map<string, ActiveFlashSale>> {
  const ids = productPrices.map((p) => p.id);
  if (ids.length === 0) return new Map();
  const now = new Date();

  const rows = await prisma.flashSaleProduct.findMany({
    where: {
      productId: { in: ids },
      flashSale: { siteId, isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
    },
    include: { flashSale: true },
  });

  const priceById = new Map(productPrices.map((p) => [p.id, p.price]));
  const result = new Map<string, ActiveFlashSale>();

  for (const row of rows) {
    const sale = row.flashSale;
    if (sale.maxUses !== null && sale.usedCount >= sale.maxUses) continue;

    const price = priceById.get(row.productId);
    if (price === undefined) continue;

    const discountType = sale.discountType as DiscountType;
    const discountValue = row.overrideDiscount !== null && row.overrideDiscount !== undefined ? row.overrideDiscount : Number(sale.discountValue);
    const salePrice = applyDiscount(price, discountType, discountValue);

    const existing = result.get(row.productId);
    if (!existing || salePrice < existing.salePrice) {
      result.set(row.productId, {
        saleId: sale.id,
        saleName: sale.name,
        discountType,
        discountValue,
        endsAt: sale.endsAt,
        salePrice,
      });
    }
  }

  return result;
}
