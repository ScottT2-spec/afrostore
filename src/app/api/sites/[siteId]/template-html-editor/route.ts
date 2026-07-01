import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSiteContext, error, success } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ siteId: string }> };

/**
 * GET /api/sites/:siteId/template-html-editor
 * Returns the saved custom HTML for the active template (if any).
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getSiteContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const siteTemplate = await prisma.siteTemplate.findFirst({
    where: { siteId, isActive: true },
    select: { id: true, customHtml: true, templateId: true },
  });

  if (!siteTemplate) {
    return error("No active template found", 404);
  }

  return success({
    siteTemplateId: siteTemplate.id,
    hasCustomHtml: !!siteTemplate.customHtml,
    customHtml: siteTemplate.customHtml || null,
  });
}

/**
 * PUT /api/sites/:siteId/template-html-editor
 * Saves the merchant's edited HTML for the active template.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getSiteContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { customHtml } = body;

  if (typeof customHtml !== "string" || customHtml.length < 10) {
    return error("Invalid HTML content", 400);
  }

  // Size limit: 2MB
  if (customHtml.length > 2 * 1024 * 1024) {
    return error("HTML content too large (max 2MB)", 400);
  }

  const siteTemplate = await prisma.siteTemplate.findFirst({
    where: { siteId, isActive: true },
  });

  if (!siteTemplate) {
    return error("No active template found", 404);
  }

  await prisma.siteTemplate.update({
    where: { id: siteTemplate.id },
    data: { customHtml },
  });

  return success({ saved: true });
}

/**
 * DELETE /api/sites/:siteId/template-html-editor
 * Resets to the base template (removes custom HTML).
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getSiteContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const siteTemplate = await prisma.siteTemplate.findFirst({
    where: { siteId, isActive: true },
  });

  if (!siteTemplate) {
    return error("No active template found", 404);
  }

  await prisma.siteTemplate.update({
    where: { id: siteTemplate.id },
    data: { customHtml: null },
  });

  return success({ reset: true });
}
