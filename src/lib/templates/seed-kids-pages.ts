import { KIDS_ABOUT_PAGE_BLOCKS, KIDS_CONTACT_PAGE_BLOCKS, KIDS_BLOG_PAGE_BLOCKS } from './presets/kids-page-presets';
import type { KidsSection } from '@/components/storefront/KidsPageRenderer';

/**
 * Converts TemplateBlock[] to KidsSection[] format
 * This is the seeding function that converts the hardcoded preset into database-ready sections
 */
function convertBlocksToSections(blocks: any[]): KidsSection[] {
  return blocks.map((block, index) => ({
    id: block.id,
    type: block.type,
    order: index + 1,
    props: block.props,
    styleOverrides: {},
  }));
}

/**
 * Default page configurations for Kids template
 * Following the Prokip ensurePagesExist pattern
 * Content from kids-page-presets.ts
 */
export const KIDS_DEFAULT_PAGES = {
  home: {
    id: 'home',
    name: 'Home',
    slug: '/',
    sections: [],
    isSystem: true,
  },
  shop: {
    id: 'shop',
    name: 'Shop All',
    slug: '/shop',
    sections: [],
    isSystem: true,
  },
  about: {
    id: 'about',
    name: 'About Us',
    slug: 'about',
    sections: convertBlocksToSections(KIDS_ABOUT_PAGE_BLOCKS),
    isSystem: false,
  },
  contact: {
    id: 'contact',
    name: 'Contact Us',
    slug: 'contact',
    sections: convertBlocksToSections(KIDS_CONTACT_PAGE_BLOCKS),
    isSystem: false,
  },
  blog: {
    id: 'blog',
    name: 'Blog',
    slug: 'blog',
    sections: convertBlocksToSections(KIDS_BLOG_PAGE_BLOCKS),
    isSystem: false,
  },
};

/**
 * Ensures Kids pages exist with seeded content
 * Call this when a Kids template site is created or opened
 */
export function ensureKidsPagesExist(siteId: string, existingPages: any[] = []) {
  const existingSlugs = new Set(existingPages.map(p => p.slug));
  const pagesToCreate: any[] = [];

  for (const [key, pageConfig] of Object.entries(KIDS_DEFAULT_PAGES)) {
    if (!existingSlugs.has(pageConfig.slug)) {
      pagesToCreate.push({
        siteId,
        title: pageConfig.name,
        slug: pageConfig.slug,
        type: key === 'home' ? 'HOME' : 'CUSTOM',
        content: {
          sections: pageConfig.sections,
        },
        isPublished: true,
        position: Object.keys(KIDS_DEFAULT_PAGES).indexOf(key),
      });
    }
  }

  return pagesToCreate;
}
