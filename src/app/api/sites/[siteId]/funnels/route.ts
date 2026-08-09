import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit, serverError , requireRole } from "@/lib/api-helpers";
import { createFunnelSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/funnels
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [funnels, total] = await Promise.all([
    prisma.funnel.findMany({
      where: where as any,
      include: {
        steps: {
          orderBy: { position: "asc" },
          select: { id: true, name: true, type: true, position: true, conversionCount: true, viewCount: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.funnel.count({ where: where as any }),
  ]);

  return success({
    funnels,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/sites/:siteId/funnels
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  const roleErr = requireRole(ctx, "STAFF");
  if (roleErr) return roleErr;

  try {
    const body = await req.json();
    const parsed = createFunnelSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { steps, ...funnelData } = parsed.data;

    if (steps && steps.length > 0) {
      const pageIds = steps.map((s) => s.pageId).filter((v): v is string => !!v);
      const formIds = steps.map((s) => s.formId).filter((v): v is string => !!v);
      if (pageIds.length > 0) {
        const validPages = await prisma.page.count({ where: { id: { in: pageIds }, siteId } });
        if (validPages !== new Set(pageIds).size) return error("One or more linked pages were not found on this site", 422);
      }
      if (formIds.length > 0) {
        const validForms = await prisma.form.count({ where: { id: { in: formIds }, siteId } });
        if (validForms !== new Set(formIds).size) return error("One or more linked forms were not found on this site", 422);
      }
    }

    const funnel = await prisma.funnel.create({
      data: {
        siteId,
        ...funnelData,
        steps: steps && steps.length > 0
          ? {
              create: steps.map((step, idx) => ({
                name: step.name,
                type: step.type,
                pageContent: step.pageContent as any,
                pageId: step.pageId || undefined,
                formId: step.formId || undefined,
                position: step.position ?? idx,
                settings: step.settings ? (step.settings as any) : undefined,
              })),
            }
          : {
              // Default funnel template
              create: [
                { name: "Landing Page", type: "LANDING", position: 0 },
                { name: "Lead Form", type: "LEAD_FORM", position: 1 },
                { name: "Thank You", type: "THANK_YOU", position: 2 },
              ],
            },
      },
      include: {
        steps: { orderBy: { position: "asc" } },
      },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "CREATE",
      entity: "funnel",
      entityId: funnel.id,
      after: funnel,
    });

    return success(funnel, 201);
  } catch (err) {
    return serverError(err, "Create funnel error");
  }
}
