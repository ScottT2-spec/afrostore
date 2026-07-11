import { prisma } from "@/lib/db";

/**
 * Template-specific page definitions.
 * Each template that has custom storefront pages (about, contact, journal, etc.)
 * needs its pages registered in the DB so they appear in the page editor.
 */

type PageDef = { title: string; slug: string; type: string; position: number };

const KIDS_PAGES: PageDef[] = [
  { title: "About", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
];

const PERFUMES_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Journal", slug: "journal", type: "CUSTOM", position: 12 },
  { title: "Fragrances", slug: "fragrances", type: "CUSTOM", position: 13 },
  { title: "Reviews", slug: "reviews", type: "CUSTOM", position: 14 },
];

const HANDMADE_BAGS_PAGES: PageDef[] = [
  { title: "About", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Our Story", slug: "our-story", type: "CUSTOM", position: 12 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 13 },
  { title: "Reviews", slug: "reviews", type: "CUSTOM", position: 14 },
];

const COSMETICS_PAGES: PageDef[] = [
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 10 },
  { title: "Terms", slug: "terms", type: "CUSTOM", position: 11 },
];

const FASHION_PAGES: PageDef[] = [
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 10 },
];

const ELECTRONICS_PAGES: PageDef[] = [
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 10 },
];

const HEALTH_PAGES: PageDef[] = [
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 10 },
];

const MAKEUP_PAGES: PageDef[] = [
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 10 },
];

/** Map of template slug → pages to ensure */
const TEMPLATE_PAGE_MAP: Record<string, PageDef[]> = {
  kids: KIDS_PAGES,
  perfumes: PERFUMES_PAGES,
  "handmade-bags": HANDMADE_BAGS_PAGES,
  cosmetics: COSMETICS_PAGES,
  fashion: FASHION_PAGES,
  "fashion-colored": FASHION_PAGES,
  electronics: ELECTRONICS_PAGES,
  "electronics-accessories": ELECTRONICS_PAGES,
  health: HEALTH_PAGES,
  makeup: MAKEUP_PAGES,
};

/**
 * Ensure template-specific pages exist in the DB for a given site.
 * Called on template import so pages show up in the editor.
 */
export async function ensureTemplatePages(siteId: string, templateSlug: string) {
  const pages = TEMPLATE_PAGE_MAP[templateSlug];
  if (!pages || pages.length === 0) return;

  for (const page of pages) {
    await prisma.page.upsert({
      where: {
        siteId_slug: {
          siteId,
          slug: page.slug,
        },
      },
      update: {
        // Don't overwrite title if already customized — only ensure it exists
      },
      create: {
        siteId,
        title: page.title,
        slug: page.slug,
        type: page.type,
        content: [],
        isPublished: true,
        position: page.position,
      },
    });
  }
}
