import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError , requireRole } from "@/lib/api-helpers";
import { createCustomerSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/customers
// ?filter=all|customers|newsletter  — filter by source type
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const filter = url.searchParams.get("filter") || "all";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  // "customers" = only registered customers (account creation / orders)
  // "newsletter" = only newsletter subscribers from CRM contacts
  // "all" = both merged together

  if (filter === "newsletter") {
    // Return only newsletter subscribers from CrmContact
    const crmWhere: Record<string, unknown> = { siteId, tags: { has: "newsletter" } };
    if (search) {
      crmWhere.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }
    const [contacts, total] = await Promise.all([
      prisma.crmContact.findMany({
        where: crmWhere as any,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.crmContact.count({ where: crmWhere as any }),
    ]);
    // Normalize to match customer shape for the frontend
    const customers = contacts.map((c) => ({
      id: c.id,
      email: c.email,
      firstName: c.firstName || "",
      lastName: c.lastName || "",
      phone: c.phone || undefined,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: c.createdAt,
      source: "newsletter" as const,
      _count: { orders: 0 },
    }));
    return success({
      customers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }

  // Regular customers query
  const where: Record<string, unknown> = { siteId };
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where: where as any,
      include: { _count: { select: { orders: true } } },
      orderBy: { totalSpent: "desc" },
      skip,
      take: limit,
    }),
    prisma.customer.count({ where: where as any }),
  ]);

  // Displayed spend/order-count must always reflect reality, not whatever
  // the cached counters happen to hold — compute both live from Order for
  // just this page of customers. "Spent" = paid AND not cancelled/refunded
  // (money actually received). "Orders" = not cancelled/refunded (real
  // order volume, regardless of payment stage).
  const customerIds = customers.map((c: { id: string }) => c.id);
  const notVoided = { status: { notIn: ["CANCELLED", "REFUNDED"] } } as const;
  const [spendByCustomer, orderCountByCustomer] = customerIds.length > 0
    ? await Promise.all([
        prisma.order.groupBy({
          by: ["customerId"],
          where: { customerId: { in: customerIds }, paymentStatus: "PAID", ...notVoided } as any,
          _sum: { total: true },
        }),
        prisma.order.groupBy({
          by: ["customerId"],
          where: { customerId: { in: customerIds }, ...notVoided } as any,
          _count: { _all: true },
        }),
      ])
    : [[], []];
  const spendMap = new Map((spendByCustomer as any[]).map((r) => [r.customerId, Number(r._sum.total || 0)]));
  const orderCountMap = new Map((orderCountByCustomer as any[]).map((r) => [r.customerId, r._count._all as number]));

  const enriched = customers.map((c: { id: string }) => ({
    ...c,
    totalSpent: spendMap.get(c.id) ?? 0,
    totalOrders: orderCountMap.get(c.id) ?? 0,
    source: "customer" as const,
  }));

  if (filter === "customers") {
    return success({
      customers: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }

  // "all" — merge customers + newsletter-only subscribers (not already a customer)
  // Get customer emails to exclude from CRM query
  const customerEmails = customers.map((c) => c.email);
  const remainingSlots = limit - customers.length;

  let newsletterContacts: typeof enriched = [];
  let newsletterTotal = 0;

  if (remainingSlots > 0 || skip === 0) {
    const crmWhere: Record<string, unknown> = {
      siteId,
      tags: { has: "newsletter" },
      // Exclude emails that are already customers
      NOT: { email: { in: customerEmails.length > 0 ? customerEmails : ["__none__"] } },
    };
    if (search) {
      crmWhere.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    const [contacts, crmTotal] = await Promise.all([
      prisma.crmContact.findMany({
        where: crmWhere as any,
        orderBy: { createdAt: "desc" },
        take: Math.max(remainingSlots, 0),
        skip: Math.max(skip - total, 0),
      }),
      prisma.crmContact.count({ where: crmWhere as any }),
    ]);
    newsletterTotal = crmTotal;
    newsletterContacts = contacts.map((c) => ({
      id: c.id,
      email: c.email,
      firstName: c.firstName || "",
      lastName: c.lastName || "",
      phone: c.phone || undefined,
      totalOrders: 0,
      totalSpent: 0 as any,
      createdAt: c.createdAt,
      updatedAt: c.createdAt,
      siteId,
      tags: c.tags,
      note: null,
      address: null,
      passwordHash: null,
      source: "newsletter" as const,
      _count: { orders: 0 },
    }));
  }

  const combined = [...enriched, ...newsletterContacts];
  const grandTotal = total + newsletterTotal;

  return success({
    customers: combined,
    pagination: { page, limit, total: grandTotal, pages: Math.ceil(grandTotal / limit) },
  });
}

// POST /api/sites/:siteId/customers
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  const body = await req.json();
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await prisma.customer.findUnique({
    where: { siteId_email: { siteId, email: parsed.data.email } },
  });
  if (existing) return error("Customer with this email already exists", 409);

  const customer = await prisma.customer.create({
    data: { siteId, ...parsed.data },
  });

  return success(customer, 201);
}
