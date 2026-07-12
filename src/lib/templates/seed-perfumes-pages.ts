import { PERFUMES_TEMPLATE_PRESET } from './presets/perfumes-preset';
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
    sections: seedPerfumesPageSections().filter(s => 
      s.type === 'perfumesHeroSlider' || 
      s.type === 'perfumesProductGrid'
    ),
    isSystem: false,
  },
  about: {
    id: 'about',
    name: 'About Us',
    slug: '/about-us',
    sections: [
      {
        id: 'about-hero',
        type: 'perfumesHeroSlider',
        order: 1,
        props: {
          autoplaySpeed: 6000,
          minHeight: '60vh',
          slides: [
            {
              title: 'Our Story',
              bottleImage: 'https://woodmart.xtemos.com/wp-content/uploads/2024/11/perfumes-slide-bottle-1.png',
              backgroundColor: '#1a1a2e',
              buttonText: 'Learn More',
              buttonLink: '/about-us',
              buttonStyle: 'primary',
            },
          ],
        },
        styleOverrides: {},
      },
    ],
    isSystem: false,
  },
  contact: {
    id: 'contact',
    name: 'Contact Us',
    slug: '/contact-us',
    sections: [
      {
        id: 'contact-hero',
        type: 'perfumesHeroSlider',
        order: 1,
        props: {
          autoplaySpeed: 6000,
          minHeight: '60vh',
          slides: [
            {
              title: 'Get in Touch',
              bottleImage: 'https://woodmart.xtemos.com/wp-content/uploads/2024/11/perfumes-slide-bottle-2.png',
              backgroundColor: '#2d1b4e',
              buttonText: 'Contact Us',
              buttonLink: '/contact-us',
              buttonStyle: 'primary',
            },
          ],
        },
        styleOverrides: {},
      },
    ],
    isSystem: false,
  },
  journal: {
    id: 'journal',
    name: 'Journal',
    slug: '/journal',
    sections: seedPerfumesPageSections().filter(s => 
      s.type === 'perfumesHeroSlider' || 
      s.type === 'perfumesTabbedProducts'
    ),
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
