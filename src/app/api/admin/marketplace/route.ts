import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const where = status && status !== "ALL" ? { status: status as any } : {};

    const items = await prisma.marketplaceItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { theme: { select: { id: true, name: true, slug: true, thumbnail: true, category: true } } },
    });

    return success(items);
  } catch (err) {
    console.error("Admin marketplace list error:", err);
    return error("Failed to fetch marketplace items", 500);
  }
}
