import { PERFUMES_TEMPLATE_PRESET } from './presets/perfumes-preset';
import { PERFUMES_ABOUT_PRESET } from './presets/perfumes-about-preset';
import { PERFUMES_CONTACT_PRESET } from './presets/perfumes-contact-preset';
import { PERFUMES_FRAGRANCES_PRESET } from './presets/perfumes-fragrances-preset';
import { PERFUMES_JOURNAL_PRESET } from './presets/perfumes-journal-preset';
import type { PerfumesSection } from '@/components/storefront/PerfumesPageRenderer';

/**
 * Converts TemplateBlock[] to PerfumesSection[] format
 * This is the seeding function that converts the hardcoded preset into database-ready sections
 */
export function seedPerfumesPageSections(): PerfumesSection[] {
  return PERFUMES_TEMPLATE_PRESET.map((block, index) => ({
    id: block.id,
    type: block.type,
    order: index + 1,
    props: block.props,
    styleOverrides: {},
  }));
}

/**
 * Default page configurations for Perfumes template
 * Following the Prokip ensurePagesExist pattern
 */
export const PERFUMES_DEFAULT_PAGES = {
  home: {
    id: 'home',
    name: 'Home',
    slug: '/',
    sections: seedPerfumesPageSections(),
    isSystem: true,
  },
  shop: {
    id: 'shop',
    name: 'Shop All',
    slug: '/shop',
    sections: seedPerfumesPageSections().filter(s => 
      s.type === 'perfumesHeroSlider' || 
      s.type === 'perfumesProductGrid' ||
      s.type === 'perfumesOlfactoryTags'
    ),
    isSystem: true,
  },
  fragrances: {
    id: 'fragrances',
    name: 'Fragrances',
    slug: '/fragrances',
    sections: PERFUMES_FRAGRANCES_PRESET.map((block, index) => ({
      id: block.id,
      type: block.type,
      order: index + 1,
      props: block.props,
      styleOverrides: {},
    })),
    isSystem: false,
  },
  about: {
    id: 'about',
    name: 'About Us',
    slug: '/about-us',
    sections: PERFUMES_ABOUT_PRESET.map((block, index) => ({
      id: block.id,
      type: block.type,
      order: index + 1,
      props: block.props,
      styleOverrides: {},
    })),
    isSystem: false,
  },
  contact: {
    id: 'contact',
    name: 'Contact Us',
    slug: '/contact-us',
    sections: PERFUMES_CONTACT_PRESET.map((block, index) => ({
      id: block.id,
      type: block.type,
      order: index + 1,
      props: block.props,
      styleOverrides: {},
    })),
    isSystem: false,
  },
  journal: {
    id: 'journal',
    name: 'Journal',
    slug: '/journal',
    sections: PERFUMES_JOURNAL_PRESET.map((block, index) => ({
      id: block.id,
      type: block.type,
      order: index + 1,
      props: block.props,
      styleOverrides: {},
    })),
    isSystem: false,
  },
};

/**
 * Ensures Perfumes pages exist with seeded content
 * Call this when a Perfumes template site is created or opened
 */
export function ensurePerfumesPagesExist(siteId: string, existingPages: any[] = []) {
  const existingSlugs = new Set(existingPages.map(p => p.slug));
  const pagesToCreate: any[] = [];

  for (const [key, pageConfig] of Object.entries(PERFUMES_DEFAULT_PAGES)) {
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
        position: Object.keys(PERFUMES_DEFAULT_PAGES).indexOf(key),
      });
    }
  }

  return pagesToCreate;
}
