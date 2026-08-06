import { prisma } from "@/lib/db";
import { buildTemplatePageContent } from "@/lib/templates/template-tree";

export const PERFUME_TEMPLATE_PAGE_DEFS = [
  { title: "Fragrances", slug: "fragrances", type: "CUSTOM", position: 9 },
  { title: "Journal", slug: "journal", type: "CUSTOM", position: 10 },
  { title: "About Us", slug: "about", type: "CUSTOM", position: 11 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 12 },
] as const;

export type PerfumePageSlug = (typeof PERFUME_TEMPLATE_PAGE_DEFS)[number]["slug"];

export async function ensurePerfumePages(siteId: string) {
  for (const page of PERFUME_TEMPLATE_PAGE_DEFS) {
    await prisma.page.upsert({
      where: {
        siteId_slug: {
          siteId,
          slug: page.slug,
        },
      },
      update: {
        title: page.title,
        type: page.type,
        isPublished: true,
        position: page.position,
      },
      create: {
        siteId,
        title: page.title,
        slug: page.slug,
        type: page.type,
        content: buildTemplatePageContent([], {}) as any,
        isPublished: true,
        position: page.position,
      },
    });
  }
}
