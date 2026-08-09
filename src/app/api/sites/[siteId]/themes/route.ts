import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error , requireRole } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/themes
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const [themes, installedThemes] = await Promise.all([
      prisma.theme.findMany({
        where: where as any,
        orderBy: [{ isFeatured: "desc" }, { installs: "desc" }],
      }),
      prisma.siteTheme.findMany({
        where: { siteId },
        include: { theme: true },
      }),
    ]);

    const installedIds = new Set(installedThemes.map((t) => t.themeId));
    const activeTheme = installedThemes.find((t) => t.isActive);

    const themesWithStatus = themes.map((theme) => ({
      ...theme,
      isInstalled: installedIds.has(theme.id),
      isActive: activeTheme?.themeId === theme.id,
      customConfig: installedThemes.find((t) => t.themeId === theme.id)?.customConfig || null,
    }));

    return success({
      themes: themesWithStatus,
      activeThemeId: activeTheme?.themeId || null,
    });
  } catch (err) {
    console.error("Themes GET error:", err);
    return error("Internal server error", 500);
  }
}

// POST /api/sites/:siteId/themes — install/activate a theme
//
// NOTE: The theme marketplace's colors/fonts are not currently wired to
// any live storefront rendering — the actual visual template a store uses
// is a separate system (Template/SiteTemplate, set at store creation and
// not editable afterward). Making "activate" a real, visible action for
// every existing template would mean reworking the color system across
// ~20 hardcoded template files — out of scope for a quick fix, and too
// risky to rush right before a production launch.
//
// So this is intentionally disabled for now rather than left to silently
// "succeed" while doing nothing visible on the live site. The original
// working implementation (upsert SiteTheme, deactivate others, increment
// install count) is preserved in git history on this file for whenever
// theme application is actually built.
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  return error(
    "Theme activation isn't available yet — your store's look is controlled by its template, which the theme marketplace doesn't affect yet. This is coming soon.",
    503
  );
}