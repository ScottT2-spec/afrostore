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
      recentStores,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.order.count(),
      prisma.store.count({ where: { status: "ACTIVE" } }),
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
      prisma.store.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

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