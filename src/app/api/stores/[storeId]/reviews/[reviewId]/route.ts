import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { moderateReviewSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ storeId: string; reviewId: string }> };

// GET /api/stores/:storeId/reviews/:reviewId
export async function GET(req: NextRequest, { params }: Params) {
  const { storeId, reviewId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      product: { storeId },
    },
    include: {
      product: { select: { id: true, name: true, slug: true, storeId: true } },
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!review) return error("Review not found", 404);
  return success(review);
}

// PATCH /api/stores/:storeId/reviews/:reviewId — moderate
export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId, reviewId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = moderateReviewSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    if (parsed.data.isApproved === undefined && parsed.data.isVerified === undefined) {
      return error("Nothing to update", 400);
    }

    const existing = await prisma.review.findFirst({
      where: {
        id: reviewId,
        product: { storeId },
      },
    });
    if (!existing) return error("Review not found", 404);

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: parsed.data,
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      storeId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "review",
      entityId: reviewId,
      before: existing,
      after: review,
    });

    return success(review);
  } catch (err) {
    console.error("Moderate review error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/stores/:storeId/reviews/:reviewId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { storeId, reviewId } = await params;
  const ctx = await getStoreContext(req, storeId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const existing = await prisma.review.findFirst({
      where: {
        id: reviewId,
        product: { storeId },
      },
    });
    if (!existing) return error("Review not found", 404);

    await prisma.review.delete({ where: { id: reviewId } });

    await logAudit({
      storeId,
      userId: ctx.user!.id,
      action: "DELETE",
      entity: "review",
      entityId: reviewId,
      before: existing,
    });

    return success({ deleted: true });
  } catch (err) {
    console.error("Delete review error:", err);
    return error("Internal server error", 500);
  }
}
