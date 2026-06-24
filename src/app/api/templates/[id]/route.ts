import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { error, success } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { getTemplateByIdOrSlug, invalidateTemplateCache } from "@/lib/templates/recommendation";
import type { Prisma } from "@/generated/prisma";

function normalizePreviewUrl(slug: string, previewUrl?: string | null) {
  if (!previewUrl) return `/template-preview/${slug}`;
  if (/^https?:\/\//i.test(previewUrl)) return `/template-preview/${slug}`;
  return previewUrl;
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const template = await getTemplateByIdOrSlug(id);
    if (!template) return error("Template not found", 404);
    return success(template);
  } catch (err) {
    console.error("Template GET error:", err);
    return error("Failed to fetch template", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await getAdminUser(req);
  if (!admin) return error("Admin access required", 403);

  try {
    const { id } = await params;
    const body = await req.json();
    const template = await prisma.template.update({
      where: { id },
      data: {
        ...body,
        previewUrl: body.slug ? normalizePreviewUrl(body.slug, body.previewUrl) : body.previewUrl,
        themeConfig: body.themeConfig !== undefined ? (body.themeConfig as unknown as Prisma.InputJsonValue) : undefined,
        variants: body.variants !== undefined ? (body.variants as unknown as Prisma.InputJsonValue) : undefined,
      },
    });
    invalidateTemplateCache();
    return success(template);
  } catch (err) {
    console.error("Template PUT error:", err);
    return error("Failed to update template", 500);
  }
}

export async function PATCH(req: NextRequest, context: Params) {
  return PUT(req, context);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await getAdminUser(_req);
  if (!admin) return error("Admin access required", 403);

  try {
    const { id } = await params;
    const inUse = await prisma.siteTemplate.count({ where: { templateId: id } });
    if (inUse > 0) {
      const template = await prisma.template.update({ where: { id }, data: { active: false } });
      invalidateTemplateCache();
      return success({ disabled: true, template });
    }

    await prisma.template.delete({ where: { id } });
    invalidateTemplateCache();
    return success({ deleted: true });
  } catch (err) {
    console.error("Template DELETE error:", err);
    return error("Failed to delete template", 500);
  }
}
