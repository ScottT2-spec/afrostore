import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";

type Params = { params: Promise<{ slug: string; funnelId: string }> };

// GET /api/public/sites/:slug/funnels/:funnelId — no auth; used by the public funnel renderer
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, funnelId } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
      select: { id: true, slug: true, name: true, logo: true, currency: true },
    });
    if (!site) return error("Site not found", 404);

    // Needed so a LANDING step's linked page — if built with one of the
    // bespoke templates (Prokip Agent, Prokip Booking, Hardware, etc.) —
    // can be wrapped in TemplateStoreContextProvider the same way the
    // homepage already is. Without it, storeSlug never reaches those
    // template's blocks (they read it from Context, not props), and any
    // form on them fails with "This form isn't connected to a store yet."
    const activeTemplate = await prisma.siteTemplate.findFirst({
      where: { siteId: site.id, isActive: true },
      select: { template: { select: { slug: true } } },
    });

    const funnel = await prisma.funnel.findFirst({
      where: { id: funnelId, siteId: site.id, isActive: true },
      include: {
        steps: {
          orderBy: { position: "asc" },
          include: {
            page: { select: { id: true, title: true, content: true, type: true } },
            form: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                fields: true,
                submitButtonText: true,
                successMessage: true,
              },
            },
          },
        },
      },
    });

    if (!funnel) return error("Funnel not found", 404);
    if (funnel.status !== "ACTIVE") return error("This funnel is not currently live", 404);

    return success({
      id: funnel.id,
      name: funnel.name,
      site: { slug: site.slug, name: site.name, logo: site.logo, currency: site.currency, templateSlug: activeTemplate?.template?.slug || null },
      steps: funnel.steps.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        position: s.position,
        isEnabled: s.isEnabled,
        settings: s.settings,
        pageContent: s.pageContent,
        page: s.page,
        form: s.form,
      })),
    });
  } catch (err) {
    console.error("Public funnel fetch error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return error(message, 500);
  }
}
