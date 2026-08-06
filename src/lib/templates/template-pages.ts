import { prisma } from "@/lib/db";
import { HANDMADE_BAGS_PAGE_BLOCKS } from "./presets/handmade-bags-pages";
import { HEALTH_PAGE_BLOCKS } from "./presets/health-pages";
import { COSMETICS_TERMS_BLOCKS, COSMETICS_SHOP_BLOCKS, COSMETICS_BLOG_BLOCKS } from "./presets/cosmetics-pages-preset";
import { TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS, TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS, TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS } from "./presets/t-shirts-prints-page-presets";
import { VEGETABLE_HOME_PAGE_BLOCKS, VEGETABLE_MENU_PAGE_BLOCKS, VEGETABLE_RECIPE_PAGE_BLOCKS, VEGETABLE_ABOUT_PAGE_BLOCKS, VEGETABLE_CONTACT_PAGE_BLOCKS, VEGETABLE_RESERVATION_PAGE_BLOCKS } from "./presets/vegetables-page-presets";
import { PERFUMES_HOME_PAGE_BLOCKS, PERFUMES_ABOUT_PAGE_BLOCKS, PERFUMES_CONTACT_PAGE_BLOCKS, PERFUMES_FRAGRANCES_PAGE_BLOCKS, PERFUMES_JOURNAL_PAGE_BLOCKS, PERFUMES_REVIEWS_PAGE_BLOCKS } from "./presets/perfumes-page-presets";
import { RETAIL_ABOUT_BLOCKS, RETAIL_CONTACT_BLOCKS, RETAIL_PROJECTS_BLOCKS, RETAIL_OUR_STORY_BLOCKS, RETAIL_REVIEWS_BLOCKS, RETAIL_PROJECT_DETAIL_BLOCKS } from "./presets/retail-pages";
import { FASHION_ABOUT_PAGE_BLOCKS, FASHION_CONTACT_PAGE_BLOCKS, FASHION_BLOG_PAGE_BLOCKS, FASHION_SHOP_PAGE_BLOCKS } from "./presets/fashion-page-presets";
import { FASHION_COLORED_ABOUT_PAGE_BLOCKS, FASHION_COLORED_CONTACT_PAGE_BLOCKS, FASHION_COLORED_BLOG_PAGE_BLOCKS, FASHION_COLORED_SHOP_PAGE_BLOCKS } from "./presets/fashion-colored-page-presets";
import { BAKERY_ABOUT_PAGE_BLOCKS, BAKERY_CONTACT_PAGE_BLOCKS, BAKERY_BLOG_PAGE_BLOCKS, BAKERY_SHOP_PAGE_BLOCKS } from "./presets/bakery-page-presets";
import { HARDWARE_ABOUT_PAGE_BLOCKS, HARDWARE_CONTACT_PAGE_BLOCKS, HARDWARE_BLOG_PAGE_BLOCKS } from "./presets/hardware-page-presets";
import { TOOLS_ABOUT_PAGE_BLOCKS, TOOLS_CONTACT_PAGE_BLOCKS, TOOLS_BLOG_PAGE_BLOCKS } from "./presets/tools-page-presets";
import { ELECTRONICS_ABOUT_PAGE_BLOCKS, ELECTRONICS_CONTACT_PAGE_BLOCKS, ELECTRONICS_BLOG_PAGE_BLOCKS, ELECTRONICS_SHOP_PAGE_BLOCKS } from "./presets/electronics-page-presets";
import { DECOR_ABOUT_PAGE_BLOCKS, DECOR_CONTACT_PAGE_BLOCKS, DECOR_BLOG_PAGE_BLOCKS, DECOR_SHOP_PAGE_BLOCKS } from "./presets/decor-page-presets";
import { parsePageContent } from "@/lib/page-content";
import { buildTemplatePageContent } from "./template-tree";
import { ACCESSORIES_ABOUT_PAGE_BLOCKS, ACCESSORIES_CONTACT_PAGE_BLOCKS, ACCESSORIES_BLOG_PAGE_BLOCKS, ACCESSORIES_SHOP_PAGE_BLOCKS, ACCESSORIES_FAQS_PAGE_BLOCKS } from "./presets/accessories-page-presets";
import { KIDS_ABOUT_PAGE_BLOCKS, KIDS_CONTACT_PAGE_BLOCKS, KIDS_BLOG_PAGE_BLOCKS, KIDS_SHOP_PAGE_BLOCKS } from "./presets/kids-page-presets";
import { TOYS_ABOUT_PAGE_BLOCKS, TOYS_CONTACT_PAGE_BLOCKS, TOYS_BLOG_PAGE_BLOCKS, TOYS_SHOP_PAGE_BLOCKS, TOYS_FAQS_PAGE_BLOCKS } from "./presets/toys-page-presets";
import { MAKEUP_ABOUT_PAGE_BLOCKS, MAKEUP_CONTACT_PAGE_BLOCKS, MAKEUP_BLOG_PAGE_BLOCKS, MAKEUP_SHOP_PAGE_BLOCKS } from "./presets/makeup-page-presets";
import { GROCERY_ABOUT_PAGE_BLOCKS, GROCERY_CONTACT_PAGE_BLOCKS, GROCERY_BLOG_PAGE_BLOCKS, GROCERY_SHOP_PAGE_BLOCKS } from "./presets/grocery-page-presets";

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
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 13 },
];

const TOYS_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 13 },
  { title: "FAQs", slug: "faqs", type: "CUSTOM", position: 14 },
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
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 10 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 11 },
  { title: "Terms", slug: "terms", type: "CUSTOM", position: 12 },
];

const FASHION_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 13 },
];

const ELECTRONICS_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 13 },
];

const ACCESSORIES_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 13 },
  { title: "FAQs", slug: "faqs", type: "CUSTOM", position: 14 },
];

const DECOR_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 13 },
];

const HEALTH_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
  { title: "Ingredients", slug: "ingredients", type: "CUSTOM", position: 13 },
  { title: "Medical Experts", slug: "medical-experts", type: "CUSTOM", position: 14 },
];

const MAKEUP_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 13 },
];

const GROCERY_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 13 },
];

const TSHIRTS_PRINTS_PAGES: PageDef[] = [
  { title: "About Us", slug: "about-us", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact-us", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
];

const VEGETABLE_PAGES: PageDef[] = [
  { title: "Menu", slug: "menu", type: "CUSTOM", position: 10 },
  { title: "Recipe", slug: "recipe", type: "CUSTOM", position: 11 },
  { title: "About", slug: "about", type: "CUSTOM", position: 12 },
  { title: "Contact", slug: "contact", type: "CUSTOM", position: 13 },
  { title: "Reservation", slug: "reservation", type: "CUSTOM", position: 14 },
];

const RETAIL_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Projects", slug: "projects", type: "CUSTOM", position: 12 },
  { title: "Our Story", slug: "our-story", type: "CUSTOM", position: 13 },
  { title: "Reviews", slug: "reviews", type: "CUSTOM", position: 14 },
  { title: "Look Deep Into Nature", slug: "project-look-deep-into-nature", type: "CUSTOM", position: 15 },
  { title: "Just Living Is Not Enough", slug: "project-just-living-is-not-enough", type: "CUSTOM", position: 16 },
  { title: "Adopt the pace of Nature", slug: "project-adopt-the-pace-of-nature", type: "CUSTOM", position: 17 },
  { title: "Go Along With the Nature", slug: "project-go-along-with-nature", type: "CUSTOM", position: 18 },
];

/** Map of template slug → pages to ensure */
const TEMPLATE_PAGE_MAP: Record<string, PageDef[]> = {
  kids: KIDS_PAGES,
  toys: TOYS_PAGES,
  perfumes: PERFUMES_PAGES,
  "handmade-bags": HANDMADE_BAGS_PAGES,
  cosmetics: COSMETICS_PAGES,
  fashion: FASHION_PAGES,
  "fashion-colored": FASHION_PAGES,
  electronics: ELECTRONICS_PAGES,
  "electronics-accessories": ACCESSORIES_PAGES,
  health: HEALTH_PAGES,
  pills: HEALTH_PAGES,
  makeup: MAKEUP_PAGES,
  "t-shirts-prints": TSHIRTS_PRINTS_PAGES,
  "sweets-bakery": FASHION_PAGES,
  hardware: ELECTRONICS_PAGES,
  tools: ELECTRONICS_PAGES,
  grocery: GROCERY_PAGES,
  vegetables: VEGETABLE_PAGES,
  retail: RETAIL_PAGES,
  decor: DECOR_PAGES,
  interior: DECOR_PAGES,
  "interior-design": DECOR_PAGES,
  "home-decor": DECOR_PAGES,
};


/** Map of template slug → default page block content (keyed by page slug) */
export const TEMPLATE_PAGE_CONTENT_MAP: Record<string, Record<string, unknown[]>> = {
  fashion: {
    about: FASHION_ABOUT_PAGE_BLOCKS,
    contact: FASHION_CONTACT_PAGE_BLOCKS,
    blog: FASHION_BLOG_PAGE_BLOCKS,
    shop: FASHION_SHOP_PAGE_BLOCKS,
  },
  "fashion-colored": {
    about: FASHION_COLORED_ABOUT_PAGE_BLOCKS,
    contact: FASHION_COLORED_CONTACT_PAGE_BLOCKS,
    blog: FASHION_COLORED_BLOG_PAGE_BLOCKS,
    shop: FASHION_COLORED_SHOP_PAGE_BLOCKS,
  },
  electronics: {
    about: ELECTRONICS_ABOUT_PAGE_BLOCKS,
    contact: ELECTRONICS_CONTACT_PAGE_BLOCKS,
    blog: ELECTRONICS_BLOG_PAGE_BLOCKS,
    shop: ELECTRONICS_SHOP_PAGE_BLOCKS,
  },
  "electronics-accessories": {
    about: ACCESSORIES_ABOUT_PAGE_BLOCKS,
    contact: ACCESSORIES_CONTACT_PAGE_BLOCKS,
    blog: ACCESSORIES_BLOG_PAGE_BLOCKS,
    shop: ACCESSORIES_SHOP_PAGE_BLOCKS,
    faqs: ACCESSORIES_FAQS_PAGE_BLOCKS,
  },
  "handmade-bags": HANDMADE_BAGS_PAGE_BLOCKS,
  health: HEALTH_PAGE_BLOCKS,
  pills: HEALTH_PAGE_BLOCKS,
  cosmetics: {
    shop: COSMETICS_SHOP_BLOCKS,
    blog: COSMETICS_BLOG_BLOCKS,
    terms: COSMETICS_TERMS_BLOCKS
  },
  "t-shirts-prints": {
    "about-us": TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS,
    "contact-us": TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS,
    "blog": TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS,
  },
  hardware: {
    about: HARDWARE_ABOUT_PAGE_BLOCKS,
    contact: HARDWARE_CONTACT_PAGE_BLOCKS,
    blog: HARDWARE_BLOG_PAGE_BLOCKS,
  },
  tools: {
    about: TOOLS_ABOUT_PAGE_BLOCKS,
    contact: TOOLS_CONTACT_PAGE_BLOCKS,
    blog: TOOLS_BLOG_PAGE_BLOCKS,
  },
  "sweets-bakery": {
    about: BAKERY_ABOUT_PAGE_BLOCKS,
    contact: BAKERY_CONTACT_PAGE_BLOCKS,
    blog: BAKERY_BLOG_PAGE_BLOCKS,
    shop: BAKERY_SHOP_PAGE_BLOCKS,
  },
  vegetables: {
    home: VEGETABLE_HOME_PAGE_BLOCKS,
    menu: VEGETABLE_MENU_PAGE_BLOCKS,
    recipe: VEGETABLE_RECIPE_PAGE_BLOCKS,
    about: VEGETABLE_ABOUT_PAGE_BLOCKS,
    contact: VEGETABLE_CONTACT_PAGE_BLOCKS,
    reservation: VEGETABLE_RESERVATION_PAGE_BLOCKS,
  },
  perfumes: {
    home: PERFUMES_HOME_PAGE_BLOCKS,
    about: PERFUMES_ABOUT_PAGE_BLOCKS,
    contact: PERFUMES_CONTACT_PAGE_BLOCKS,
    fragrances: PERFUMES_FRAGRANCES_PAGE_BLOCKS,
    journal: PERFUMES_JOURNAL_PAGE_BLOCKS,
    reviews: PERFUMES_REVIEWS_PAGE_BLOCKS,
  },

  retail: {
    about: RETAIL_ABOUT_BLOCKS,
    contact: RETAIL_CONTACT_BLOCKS,
    projects: RETAIL_PROJECTS_BLOCKS,
    "our-story": RETAIL_OUR_STORY_BLOCKS,
    reviews: RETAIL_REVIEWS_BLOCKS,
    "project-look-deep-into-nature": RETAIL_PROJECT_DETAIL_BLOCKS["project-look-deep-into-nature"],
    "project-just-living-is-not-enough": RETAIL_PROJECT_DETAIL_BLOCKS["project-just-living-is-not-enough"],
    "project-adopt-the-pace-of-nature": RETAIL_PROJECT_DETAIL_BLOCKS["project-adopt-the-pace-of-nature"],
    "project-go-along-with-nature": RETAIL_PROJECT_DETAIL_BLOCKS["project-go-along-with-nature"],
  },
  kids: {
    about: KIDS_ABOUT_PAGE_BLOCKS,
    contact: KIDS_CONTACT_PAGE_BLOCKS,
    blog: KIDS_BLOG_PAGE_BLOCKS,
    shop: KIDS_SHOP_PAGE_BLOCKS,
  },
  toys: {
    about: TOYS_ABOUT_PAGE_BLOCKS,
    contact: TOYS_CONTACT_PAGE_BLOCKS,
    blog: TOYS_BLOG_PAGE_BLOCKS,
    shop: TOYS_SHOP_PAGE_BLOCKS,
    faqs: TOYS_FAQS_PAGE_BLOCKS,
  },
  makeup: {
    about: MAKEUP_ABOUT_PAGE_BLOCKS,
    contact: MAKEUP_CONTACT_PAGE_BLOCKS,
    blog: MAKEUP_BLOG_PAGE_BLOCKS,
    shop: MAKEUP_SHOP_PAGE_BLOCKS,
  },
  grocery: {
    about: GROCERY_ABOUT_PAGE_BLOCKS,
    contact: GROCERY_CONTACT_PAGE_BLOCKS,
    blog: GROCERY_BLOG_PAGE_BLOCKS,
    shop: GROCERY_SHOP_PAGE_BLOCKS,
  },
  decor: {
    about: DECOR_ABOUT_PAGE_BLOCKS,
    contact: DECOR_CONTACT_PAGE_BLOCKS,
    blog: DECOR_BLOG_PAGE_BLOCKS,
    shop: DECOR_SHOP_PAGE_BLOCKS,
  },
  interior: {
    about: DECOR_ABOUT_PAGE_BLOCKS,
    contact: DECOR_CONTACT_PAGE_BLOCKS,
    blog: DECOR_BLOG_PAGE_BLOCKS,
    shop: DECOR_SHOP_PAGE_BLOCKS,
  },
  "interior-design": {
    about: DECOR_ABOUT_PAGE_BLOCKS,
    contact: DECOR_CONTACT_PAGE_BLOCKS,
    blog: DECOR_BLOG_PAGE_BLOCKS,
    shop: DECOR_SHOP_PAGE_BLOCKS,
  },
  "home-decor": {
    about: DECOR_ABOUT_PAGE_BLOCKS,
    contact: DECOR_CONTACT_PAGE_BLOCKS,
    blog: DECOR_BLOG_PAGE_BLOCKS,
    shop: DECOR_SHOP_PAGE_BLOCKS,
  },
};

/**
 * Ensure template-specific pages exist in the DB for a given site.
 * Called on template import so pages show up in the editor.
 * For templates with default block content, seeds the blocks so pages are
 * editable from day one instead of relying on hardcoded fallbacks.
 */
export async function ensureTemplatePages(siteId: string, templateSlug: string, forceUpdate = false) {
  const pages = TEMPLATE_PAGE_MAP[templateSlug];
  if (!pages || pages.length === 0) return;

  const contentMap = TEMPLATE_PAGE_CONTENT_MAP[templateSlug] || {};

  for (const page of pages) {
    const defaultContent = contentMap[page.slug] || [];
    const normalizedContent = buildTemplatePageContent(defaultContent);
    const existing = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug: page.slug } },
      select: { content: true },
    });

    if (existing) {
      // If page exists but has empty content, seed the default blocks
      const parsedContent = parsePageContent(existing.content);
      const parsedElements = Array.isArray(parsedContent.elements) ? parsedContent.elements : [];
      const hasContent =
        parsedElements.length > 0 ||
        parsedContent.blocks.length > 0 ||
        Object.keys(parsedContent.settings || {}).length > 0;

      if (!hasContent && defaultContent.length > 0) {
        await prisma.page.update({
          where: { siteId_slug: { siteId, slug: page.slug } },
          data: { content: normalizedContent as any },
        });
      }
    } else {
      await prisma.page.create({
        data: {
          siteId,
          title: page.title,
          slug: page.slug,
          type: page.type as any,
          content: normalizedContent as any,
          isPublished: true,
          position: page.position,
        },
      });
    }
  }
}
