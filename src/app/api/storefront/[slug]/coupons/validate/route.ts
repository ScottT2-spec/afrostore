import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/storefront/:slug/coupons/validate?code=X&subtotal=Y — no auth; used by checkout
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  const subtotal = Number(req.nextUrl.searchParams.get("subtotal") || 0);

  if (!code) return json({ success: false, error: "Discount code is required" }, 400);

  try {
    const site = await prisma.site.findFirst({
      where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
      select: { id: true },
    });
    if (!site) return json({ success: false, error: "Store not found" }, 404);

    const coupon = await prisma.coupon.findUnique({
      where: { siteId_code: { siteId: site.id, code } },
    });

    if (!coupon || !coupon.isActive) {
      return json({ success: false, error: "This discount code isn't valid" }, 404);
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return json({ success: false, error: "This discount code has reached its usage limit" }, 400);
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return json({ success: false, error: "This discount code has expired" }, 400);
    }
    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null;
    if (minAmount && subtotal < minAmount) {
      return json({ success: false, error: `Minimum order amount for this code is ${minAmount}` }, 400);
    }

    const couponValue = Number(coupon.value);
    let discountAmount = 0;
    let freeShipping = false;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * couponValue) / 100;
    } else if (coupon.type === "FIXED") {
      discountAmount = Math.min(couponValue, subtotal);
    } else if (coupon.type === "FREE_SHIPPING") {
      freeShipping = true;
    }

    return json({
      success: true,
      data: { code: coupon.code, type: coupon.type, value: couponValue, discountAmount, freeShipping },
    });
  } catch (err) {
    console.error("Coupon validation error:", err);
    return json({ success: false, error: "Failed to validate discount code" }, 500);
  }
}
