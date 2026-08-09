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

// GET /api/sites/:siteId/customers/export — CSV download
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") || "all";

  const customers = await prisma.customer.findMany({
    where: { siteId },
    orderBy: { totalSpent: "desc" },
    select: { email: true, firstName: true, lastName: true, phone: true, tags: true, totalOrders: true, totalSpent: true, createdAt: true },
  });

  let rows = customers.map((c: { email: string; firstName: string; lastName: string; phone: string | null; tags: string[]; totalOrders: number; totalSpent: { toString(): string }; createdAt: Date }) => ({
    email: c.email, firstName: c.firstName, lastName: c.lastName, phone: c.phone || "",
    tags: c.tags.join("; "), totalOrders: c.totalOrders, totalSpent: c.totalSpent.toString(),
    source: "customer", createdAt: c.createdAt.toISOString(),
  }));

  if (filter !== "customers") {
    const contacts = await prisma.crmContact.findMany({
      where: { siteId, tags: { has: "newsletter" }, NOT: { email: { in: customers.map((c: { email: string }) => c.email) } } },
      select: { email: true, firstName: true, lastName: true, phone: true, tags: true, createdAt: true },
    });
    const newsletterRows = contacts.map((c: { email: string; firstName: string | null; lastName: string | null; phone: string | null; tags: string[]; createdAt: Date }) => ({
      email: c.email, firstName: c.firstName || "", lastName: c.lastName || "", phone: c.phone || "",
      tags: c.tags.join("; "), totalOrders: 0, totalSpent: "0",
      source: "newsletter", createdAt: c.createdAt.toISOString(),
    }));
    if (filter === "newsletter") rows = newsletterRows;
    else rows = [...rows, ...newsletterRows];
  }

  const header = ["Email", "First Name", "Last Name", "Phone", "Tags", "Total Orders", "Total Spent", "Source", "Created At"];
  const lines = [
    header.join(","),
    ...rows.map((r: { email: string; firstName: string; lastName: string; phone: string; tags: string; totalOrders: number; totalSpent: string; source: string; createdAt: string }) => [r.email, r.firstName, r.lastName, r.phone, r.tags, r.totalOrders, r.totalSpent, r.source, r.createdAt].map(csvEscape).join(",")),
  ];
  const csv = lines.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
