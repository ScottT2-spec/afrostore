import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateCustomerSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; customerId: string }> };

// GET /api/sites/:siteId/customers/:customerId — full profile + order history
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, customerId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, siteId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true, orderNumber: true, status: true, paymentStatus: true,
          subtotal: true, deliveryFee: true, discount: true, createdAt: true,
          items: { select: { id: true } },
        },
      },
      wishlists: { select: { id: true } },
      reviews: { select: { id: true, rating: true } },
      _count: { select: { orders: true, reviews: true, wishlists: true } },
    },
  });
  if (!customer) return error("Customer not found", 404);

  // Same correctness rule as the list endpoint: displayed lifetime spend
  // must reflect money actually received (paid, not cancelled/refunded),
  // not the cached counter.
  const notVoided = { status: { notIn: ["CANCELLED", "REFUNDED"] } } as const;
  const [spendAgg, orderCountAgg] = await Promise.all([
    prisma.order.aggregate({ where: { customerId, paymentStatus: "PAID", ...notVoided } as any, _sum: { total: true } }),
    prisma.order.count({ where: { customerId, ...notVoided } as any }),
  ]);

  return success({
    ...customer,
    totalSpent: Number(spendAgg._sum.total || 0),
    totalOrders: orderCountAgg,
  });
}

// PATCH /api/sites/:siteId/customers/:customerId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, customerId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.customer.findFirst({ where: { id: customerId, siteId } });
  if (!existing) return error("Customer not found", 404);

  const body = await req.json();
  const parsed = updateCustomerSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: parsed.data as any,
  });

  await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "customer", entityId: customerId, before: existing, after: customer });

  return success(customer);
}

// DELETE /api/sites/:siteId/customers/:customerId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, customerId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.customer.findFirst({ where: { id: customerId, siteId } });
  if (!existing) return error("Customer not found", 404);

  // Orders reference customerId with onDelete: SetNull typically for
  // historical record-keeping; deleting the customer here removes their
  // profile (tags/notes/address) but preserves order history integrity
  // via whatever cascade behavior the schema defines.
  await prisma.customer.delete({ where: { id: customerId } });

  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "customer", entityId: customerId, before: existing });

  return success({ deleted: true });
}
