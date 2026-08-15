import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Perfumes Template Preset
 * Recreates the Prokip LTD Perfumes demo layout with editable blocks.
 */
export const PERFUMES_TEMPLATE_PRESET: EditorNode[] = [
  {
    id: "perfumes-hero",
    type: "perfumesHeroSlider",
          settings: {
        autoplaySpeed: 6000,
      minHeight: "100vh"
      },
      elements: [
        {
          id: "perfumes-hero-slide-1",
          type: "slide",
          settings:           {
            "title": "Opus Essence",
            "bottleImage": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80&auto=format&fit=crop",
            "backgroundColor": "#1a1a2e",
            "buttonText": "Buy now",
            "buttonLink": "/shop",
            "buttonStyle": "primary"
          },
          elements: [],
        },
        {
          id: "perfumes-hero-slide-2",
          type: "slide",
          settings:           {
            "title": "New Fragrance in the Opus Essence",
            "bottleImage": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80&auto=format&fit=crop",
            "backgroundColor": "#2d1b4e",
            "buttonText": "Buy now",
            "buttonLink": "/shop",
            "buttonStyle": "primary"
          },
          elements: [],
        },
        {
          id: "perfumes-hero-slide-3",
          type: "slide",
          settings:           {
            "title": "Deep Fragrance With a Refined Intensity",
            "bottleImage": "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80&auto=format&fit=crop",
            "backgroundColor": "#0d1b2a",
            "buttonText": "Buy now",
            "buttonLink": "/shop",
            "buttonStyle": "black"
          },
          elements: [],
        }
      ],
  },
  {
    id: "perfumes-new-in",
    type: "perfumesProductGrid",
    settings: {
      columns: 3,
      maxProducts: 6,
      sectionTitle: "New In",
      filter: "new-arrival",
      products: [],
    },
  },
  {
    id: "perfumes-olfactory",
    type: "perfumesOlfactoryTags",
    settings: {
      title: "Shop by Olfactory Family",
      tags: [
        { name: "Floral", link: "/shop" },
        { name: "Woody", link: "/shop" },
        { name: "Amber", link: "/shop" },
        { name: "Chypre", link: "/shop" },
        { name: "Leather", link: "/shop" },
        { name: "Aldehyde", link: "/shop" },
        { name: "Spicy", link: "/shop" },
      ],
    },
  },
  {
    id: "perfumes-marquee",
    type: "perfumesMarquee",
    settings: {
      items: ["Ember Glow", "Golden Veil", "Midnight Azure", "Nocturne Essence", "\u00c9theria"],
      speed: "45s",
    },
  },
  {
    id: "perfumes-featured-banners",
    type: "perfumesFeaturedBanners",
    settings: {
      banners: [
        {
          title: "Light Fragrance with a Silky Touch",
          subtitle: "A collection of delicate, weightless fragrances",
          description: "A collection of delicate, weightless fragrances that capture the essence of air and light. Soft florals, sheer musks, and gentle citruses.",
          backgroundImage: "https://images.unsplash.com/photo-1458538977777-0549b2370168?w=800&q=80&auto=format&fit=crop",
          link: "/shop",
        },
        {
          title: "Deep Fragrance With a Refined Intensity",
          subtitle: "A collection of fresh, luminous scents",
          description: "A collection of fresh, luminous scents inspired by the mystery of nightfall. Crisp citruses, airy florals, and cool musks.",
          backgroundImage: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80&auto=format&fit=crop",
          link: "/shop",
        },
      ],
    },
  },
  {
    id: "perfumes-tabbed",
    type: "perfumesTabbedProducts",
    settings: {
      title: "Promotional Offers",
      tabs: [
        { label: "All" },
        { label: "For Her", filterTag: "for-her" },
        { label: "For Him", filterTag: "for-him" },
      ],
      columns: 3,
      maxProducts: 6,
      products: [],
    },
  },
  {
    id: "perfumes-collection-banners",
    type: "perfumesCollectionBanners",
    settings: {
      sectionTitle: "Velours Noir SALE Collection",
      banners: [
        {
          title: "Get up to 20% off",
          image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80&auto=format&fit=crop",
          link: "/shop",
        },
      ],
    },
  },
  {
    id: "perfumes-blog",
    type: "perfumesBlogArticles",
    settings: {
      sectionTitle: "Journal Articles",
      columns: 5,
      posts: [],
    },
  },
  {
    id: "perfumes-instagram",
    type: "perfumesInstagram",
    settings: {
      handle: "@xtemos.studio",
      handleLink: "https://www.instagram.com/",
      items: [],
    },
  },
  {
    id: "perfumes-footer", type: "perfumesFooter",
    settings: {
      storeName: "Perfumes",
      storeSlug: "perfumes",
      description: "Discover a curated collection of modern fragrances designed to hold memory, emotion, and identity in every bottle.",
    },
  },
];
