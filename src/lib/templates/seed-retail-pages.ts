import { RETAIL_PAGE_PRESETS, RETAIL_PROJECT_DETAIL_BLOCKS } from './presets/retail-pages';
import type { BuilderBlock } from '@/components/storefront/BlockRenderer';

/**
 * Converts BuilderBlock[] to database-ready format
 * This is the seeding function that converts the preset blocks into database-ready content
 */
export function seedRetailPageBlocks(): BuilderBlock[] {
  return RETAIL_PAGE_PRESETS.about || [];
}

/**
 * Default page configurations for Retail template
 * Following the Prokip ensurePagesExist pattern
 */
export const RETAIL_DEFAULT_PAGES = {
  about: {
    id: 'about',
    name: 'About Us',
    slug: 'about',
    content: JSON.stringify(RETAIL_PAGE_PRESETS.about || []),
    type: 'CUSTOM',
    isPublished: true,
    position: 10,
  },
  contact: {
    id: 'contact',
    name: 'Contact Us',
    slug: 'contact',
    content: JSON.stringify(RETAIL_PAGE_PRESETS.contact || []),
    type: 'CUSTOM',
    isPublished: true,
    position: 11,
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    slug: 'projects',
    content: JSON.stringify(RETAIL_PAGE_PRESETS.projects || []),
    type: 'CUSTOM',
    isPublished: true,
    position: 12,
  },
  'our-story': {
    id: 'our-story',
    name: 'Our Story',
    slug: 'our-story',
    content: JSON.stringify(RETAIL_PAGE_PRESETS['our-story'] || []),
    type: 'CUSTOM',
    isPublished: true,
    position: 13,
  },
  reviews: {
    id: 'reviews',
    name: 'Reviews',
    slug: 'reviews',
    content: JSON.stringify(RETAIL_PAGE_PRESETS.reviews || []),
    type: 'CUSTOM',
    isPublished: true,
    position: 14,
  },
  'project-look-deep-into-nature': {
    id: 'project-look-deep-into-nature',
    name: 'Look Deep Into Nature',
    slug: 'project-look-deep-into-nature',
    content: JSON.stringify(RETAIL_PROJECT_DETAIL_BLOCKS['project-look-deep-into-nature'] || []),
    type: 'CUSTOM',
    isPublished: true,
    position: 15,
  },
  'project-just-living-is-not-enough': {
    id: 'project-just-living-is-not-enough',
    name: 'Just Living Is Not Enough',
    slug: 'project-just-living-is-not-enough',
    content: JSON.stringify(RETAIL_PROJECT_DETAIL_BLOCKS['project-just-living-is-not-enough'] || []),
    type: 'CUSTOM',
    isPublished: true,
    position: 16,
  },
  'project-adopt-the-pace-of-nature': {
    id: 'project-adopt-the-pace-of-nature',
    name: 'Adopt the pace of Nature',
    slug: 'project-adopt-the-pace-of-nature',
    content: JSON.stringify(RETAIL_PROJECT_DETAIL_BLOCKS['project-adopt-the-pace-of-nature'] || []),
    type: 'CUSTOM',
    isPublished: true,
    position: 17,
  },
  'project-go-along-with-nature': {
    id: 'project-go-along-with-nature',
    name: 'Go Along With the Nature',
    slug: 'project-go-along-with-nature',
    content: JSON.stringify(RETAIL_PROJECT_DETAIL_BLOCKS['project-go-along-with-nature'] || []),
    type: 'CUSTOM',
    isPublished: true,
    position: 18,
  },
};

/**
 * Ensures Retail template pages exist for a site
 * Call this when creating a new site with Retail template
 */
export async function ensureRetailPagesExist(siteId: string, prisma: any) {
  const pages = Object.values(RETAIL_DEFAULT_PAGES);
  
  for (const pageConfig of pages) {
    const existingPage = await prisma.page.findFirst({
      where: {
        siteId,
        slug: pageConfig.slug,
      },
    });
    
    if (!existingPage) {
      await prisma.page.create({
        data: {
          siteId,
          title: pageConfig.name,
          slug: pageConfig.slug,
          content: pageConfig.content,
          type: pageConfig.type,
          isPublished: pageConfig.isPublished,
          position: pageConfig.position,
        },
      });
    }
  }
}
