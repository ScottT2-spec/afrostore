import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthCustomer } from "@/lib/customer-auth";

type Params = { params: Promise<{ slug: string; orderNumber: string }> };

// Return requests are a more consequential action than read-only order
// tracking (they can end in a refund), so ownership must be proven one of
// two ways:
//  1. Strong: a logged-in customer session (Bearer token / cookie) whose
//     id matches order.customerId — or, for guest orders with no
//     customerId, whose account email matches the order's email.
//  2. Fallback (no session): the order's email supplied in the request,
//     for guests using the public order-tracking lookup.
async function resolveOwnedOrder(req: NextRequest, slug: string, orderNumber: string, bodyEmail?: string) {
  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site) return { error: "Store not found", status: 404 as const };

  const order = await prisma.order.findFirst({
    where: { siteId: site.id, orderNumber: { equals: orderNumber, mode: "insensitive" } },
    include: { items: true },
  });
  if (!order) return { error: "Order not found. Please check the order number and try again.", status: 404 as const };

  const authCustomer = await getAuthCustomer(req);
  if (authCustomer) {
    const owns = order.customerId ? order.customerId === authCustomer.id : order.email?.toLowerCase() === authCustomer.email.toLowerCase();
    if (owns) return { site, order, verifiedEmail: authCustomer.email };
    return { error: "This order isn't associated with your account.", status: 403 as const };
  }

  if (!bodyEmail) return { error: "Email is required", status: 400 as const };
  if (!order.email || order.email.toLowerCase() !== bodyEmail.trim().toLowerCase()) {
    return { error: "That email doesn't match the one used on this order.", status: 403 as const };
  }
  return { site, order, verifiedEmail: bodyEmail.trim() };
}

// GET /api/storefront/:slug/orders/:orderNumber/returns?email=...
// Public: check whether a return already exists for this order.
// If the request carries a valid customer session, that's used instead of
// the email query param — the session is the stronger proof of ownership.
export async function GET(req: NextRequest, { params }: Params) {
  const { slug, orderNumber } = await params;
  const email = new URL(req.url).searchParams.get("email") || undefined;

  const resolved = await resolveOwnedOrder(req, slug, orderNumber, email);
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
      verifiedEmail: resolved.verifiedEmail,
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
  email: z.string().email().optional(), // optional when an authenticated customer session is present
  reason: z.string().min(1, "Please tell us why you'd like to return this").max(2000),
  notes: z.string().max(2000).optional(),
  items: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1) })).min(1, "Select at least one item"),
});

const ACTIVE_STATUSES = ["REQUESTED", "APPROVED", "RECEIVED"];

// POST /api/storefront/:slug/orders/:orderNumber/returns
// Public (email- or session-verified): customer requests a return on their own order.
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

  const resolved = await resolveOwnedOrder(req, slug, orderNumber, parsed.data.email);
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
