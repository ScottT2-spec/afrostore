import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { error, success } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";
import { invalidateTemplateCache, listTemplates } from "@/lib/templates/recommendation";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  previewImage: z.string().optional(),
  previewUrl: z.string().optional(),
  recommendationKeywords: z.array(z.string()).default([]),
  themeConfig: z.record(z.string(), z.unknown()),
  variants: z.unknown().optional(),
  active: z.boolean().default(true),
});

function normalizePreviewUrl(slug: string, previewUrl?: string | null) {
  if (!previewUrl) return `/template-preview/${slug}`;
  if (/^https?:\/\//i.test(previewUrl)) return `/template-preview/${slug}`;
  return previewUrl;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get("includeInactive") === "true";
    const siteType = url.searchParams.get("siteType") || undefined;
    if (includeInactive) {
      const admin = await getAdminUser(req);
      if (!admin) return error("Admin access required", 403);
    }
    const templates = await listTemplates({
      search: url.searchParams.get("search") || undefined,
      category: url.searchParams.get("category") || undefined,
      siteType,
      includeInactive,
    });
    return success(templates);
  } catch (err) {
    console.error("Templates GET error:", err);
    return error("Failed to fetch templates", 500);
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser(req);
  if (!admin) return error("Admin access required", 403);

  try {
    const parsed = templateSchema.safeParse(await req.json());
    if (!parsed.success) return error("Invalid template payload", 422);

    const existing = await prisma.template.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return error("A template with this slug already exists", 409);

    const template = await prisma.template.create({
      data: {
        ...parsed.data,
        previewImage: parsed.data.previewImage || null,
        previewUrl: normalizePreviewUrl(parsed.data.slug, parsed.data.previewUrl),
        description: parsed.data.description || null,
        themeConfig: parsed.data.themeConfig as unknown as Prisma.InputJsonValue,
        variants: parsed.data.variants as unknown as Prisma.InputJsonValue,
      },
    });
    invalidateTemplateCache();
    return success(template, 201);
  } catch (err) {
    console.error("Templates POST error:", err);
    return error("Failed to create template", 500);
  }
}
