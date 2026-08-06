import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string; orderNumber: string }> };

// Return requests are a more consequential action than read-only order
// tracking (they can end in a refund), so — unlike GET /orders/:orderNumber,
// which only needs the order number — creating one requires the order's
// email to match, as proof the requester actually placed the order.
async function resolveOwnedOrder(slug: string, orderNumber: string, email: string) {
  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site) return { error: "Store not found", status: 404 as const };

  const order = await prisma.order.findFirst({
    where: { siteId: site.id, orderNumber: { equals: orderNumber, mode: "insensitive" } },
    include: { items: true },
  });
  if (!order) return { error: "Order not found. Please check the order number and try again.", status: 404 as const };

  if (!order.email || order.email.toLowerCase() !== email.trim().toLowerCase()) {
    return { error: "That email doesn't match the one used on this order.", status: 403 as const };
  }

  return { site, order };
}

// GET /api/storefront/:slug/orders/:orderNumber/returns?email=...
// Public: check whether a return already exists for this order.
export async function GET(req: NextRequest, { params }: Params) {
  const { slug, orderNumber } = await params;
  const email = new URL(req.url).searchParams.get("email") || "";
  if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });

  const resolved = await resolveOwnedOrder(slug, orderNumber, email);
  if ("error" in resolved) return NextResponse.json({ success: false, error: resolved.error }, { status: resolved.status });

  const existing = await prisma.return.findFirst({
    where: { orderId: resolved.order.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: {
      orderId: resolved.order.id,
      orderStatus: resolved.order.status,
      items: resolved.order.items.map((i) => ({ id: i.id, name: i.name, variantName: i.variantName, quantity: i.quantity, image: i.image })),
      existingReturn: existing
        ? {
            id: existing.id,
            status: existing.status,
            reason: existing.reason,
            refundAmount: existing.refundAmount ? Number(existing.refundAmount) : null,
            refundMethod: existing.refundMethod,
            createdAt: existing.createdAt.toISOString(),
            resolvedAt: existing.resolvedAt ? existing.resolvedAt.toISOString() : null,
          }
        : null,
    },
  });
}

const requestReturnSchema = z.object({
  email: z.string().email(),
  reason: z.string().min(1, "Please tell us why you'd like to return this").max(2000),
  notes: z.string().max(2000).optional(),
  items: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1) })).min(1, "Select at least one item"),
});

const ACTIVE_STATUSES = ["REQUESTED", "APPROVED", "RECEIVED"];

// POST /api/storefront/:slug/orders/:orderNumber/returns
// Public (email-verified): customer requests a return on their own order.
export async function POST(req: NextRequest, { params }: Params) {
  const { slug, orderNumber } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = requestReturnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || "Invalid request" }, { status: 422 });
  }

  const resolved = await resolveOwnedOrder(slug, orderNumber, parsed.data.email);
  if ("error" in resolved) return NextResponse.json({ success: false, error: resolved.error }, { status: resolved.status });

  const { site, order } = resolved;

  // One active return per order at a time.
  const existingActive = await prisma.return.findFirst({
    where: { orderId: order.id, status: { in: ACTIVE_STATUSES as any } },
  });
  if (existingActive) {
    return NextResponse.json(
      { success: false, error: "There's already an open return request for this order.", data: { returnId: existingActive.id } },
      { status: 409 }
    );
  }

  // Make sure the requested items actually belong to this order.
  const orderItemIds = new Set(order.items.map((i) => i.id));
  const invalidItem = parsed.data.items.find((i) => !orderItemIds.has(i.id));
  if (invalidItem) {
    return NextResponse.json({ success: false, error: "One of the selected items doesn't belong to this order." }, { status: 422 });
  }

  const itemsWithNames = parsed.data.items.map((sel) => {
    const orderItem = order.items.find((i) => i.id === sel.id)!;
    return { id: sel.id, name: orderItem.name, variantName: orderItem.variantName, quantity: sel.quantity };
  });

  const ret = await prisma.return.create({
    data: {
      siteId: site.id,
      orderId: order.id,
      reason: parsed.data.reason,
      notes: parsed.data.notes || null,
      items: itemsWithNames as any,
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        id: ret.id,
        status: ret.status,
        reason: ret.reason,
        createdAt: ret.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}
