import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError } from "@/lib/api-helpers";
import { createCouponSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const coupons = await prisma.coupon.findMany({
    where: { storeId },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return success(coupons);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = createCouponSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await prisma.coupon.findUnique({
    where: { storeId_code: { storeId, code: parsed.data.code } },
  });
  if (existing) return error("Coupon code already exists", 409);

  const coupon = await prisma.coupon.create({
    data: { storeId, ...parsed.data },
  });

  return success(coupon, 201);
}
