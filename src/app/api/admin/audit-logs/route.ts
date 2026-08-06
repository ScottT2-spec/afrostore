import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const siteId = url.searchParams.get("siteId") || undefined;
    const entity = url.searchParams.get("entity") || undefined;
    const action = url.searchParams.get("action") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const where: Record<string, unknown> = {};

    if (siteId) where.siteId = siteId;
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (search) {
      where.OR = [
        { entity: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search, mode: "insensitive" } },
        { userId: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { site: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return success({
      logs,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Admin audit logs error:", err);
    return error("Failed to fetch audit logs", 500);
  }
}
