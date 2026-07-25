import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const [
      totalUsers,
      totalStores,
      totalOrders,
      activeStores,
      totalRevenue,
      recentSignups,
      recentSitesRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.site.count(),
      prisma.order.count(),
      prisma.site.count({ where: { status: "ACTIVE" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.site.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          status: true,
          createdAt: true,
          workspace: {
            select: {
              owner: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
    ]);

    // Flatten workspace.owner to owner for frontend compatibility
    const recentStores = recentSitesRaw.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      plan: s.plan,
      status: s.status,
      createdAt: s.createdAt,
      owner: s.workspace?.owner || { firstName: "Unknown", lastName: "" },
    }));

    const stats = {
      totalUsers,
      totalStores,
      totalOrders,
      activeStores,
      totalRevenue: totalRevenue._sum.total || 0,
      recentSignups,
      recentStores,
    };

    return success(stats);
  } catch (err) {
    console.error("Admin stats error:", err);
    return error("Failed to fetch admin stats");
  }
}
