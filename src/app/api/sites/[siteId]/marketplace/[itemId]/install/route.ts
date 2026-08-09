import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error , requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; itemId: string }> };

// POST /api/sites/:siteId/marketplace/:itemId/install
// Installs an approved marketplace theme onto the current site.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId, itemId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  try {
    const item = await prisma.marketplaceItem.findUnique({ where: { id: itemId } });
    if (!item) return error("Marketplace item not found", 404);
    if (item.status !== "APPROVED") return error("This item isn't available for install", 400);
    if (Number(item.price) > 0) {
      return error("Paid marketplace items aren't available for purchase yet. This one is coming soon.", 400);
    }
    if (item.type !== "THEME" || !item.themeId) {
      return error("This item type can't be installed yet", 400);
    }

    const theme = await prisma.theme.findUnique({ where: { id: item.themeId } });
    if (!theme || !theme.isActive) return error("The underlying theme is no longer available", 404);

    const siteTheme = await prisma.siteTheme.upsert({
      where: { siteId_themeId: { siteId, themeId: item.themeId } },
      create: { siteId, themeId: item.themeId, isActive: false },
      update: {},
      include: { theme: true },
    });

    await Promise.all([
      prisma.theme.update({ where: { id: item.themeId }, data: { installs: { increment: 1 } } }),
      prisma.marketplaceItem.update({ where: { id: itemId }, data: { downloads: { increment: 1 } } }),
    ]);

    return success({ siteTheme, message: "Installed. Go to Themes to activate it on your site." }, 201);
  } catch (err) {
    console.error("Marketplace install error:", err);
    return error("Internal server error", 500);
  }
}
