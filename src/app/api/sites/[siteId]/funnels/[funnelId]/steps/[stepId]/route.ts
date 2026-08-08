import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, serverError } from "@/lib/api-helpers";
import { updateFunnelStepSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; funnelId: string; stepId: string }> };

// PATCH /api/sites/:siteId/funnels/:funnelId/steps/:stepId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, funnelId, stepId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, siteId } });
  if (!funnel) return error("Funnel not found", 404);

  const existing = await prisma.funnelStep.findFirst({ where: { id: stepId, funnelId } });
  if (!existing) return error("Step not found", 404);

  try {
    const body = await req.json();
    const parsed = updateFunnelStepSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { settings, pageId, formId, ...rest } = parsed.data;

    if (pageId) {
      const page = await prisma.page.findFirst({ where: { id: pageId, siteId } });
      if (!page) return error("Linked page not found on this site", 422);
    }
    if (formId) {
      const linkedForm = await prisma.form.findFirst({ where: { id: formId, siteId } });
      if (!linkedForm) return error("Linked form not found on this site", 422);
    }

    const data: Record<string, unknown> = { ...rest };
    if (settings !== undefined) data.settings = settings ? (settings as any) : null;
    if (pageId !== undefined) data.pageId = pageId || null;
    if (formId !== undefined) data.formId = formId || null;

    const step = await prisma.funnelStep.update({
      where: { id: stepId },
      data,
    });

    return success(step);
  } catch (err) {
    return serverError(err, "Update funnel step error");
  }
}

// DELETE /api/sites/:siteId/funnels/:funnelId/steps/:stepId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, funnelId, stepId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, siteId } });
  if (!funnel) return error("Funnel not found", 404);

  const existing = await prisma.funnelStep.findFirst({ where: { id: stepId, funnelId } });
  if (!existing) return error("Step not found", 404);

  await prisma.funnelStep.delete({ where: { id: stepId } });

  return success({ deleted: true });
}
