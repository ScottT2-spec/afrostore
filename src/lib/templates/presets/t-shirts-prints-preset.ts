import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * T-Shirts & Prints template preset — Prokip LTD "T-Shirts Prints" demo.
 * Extracted from the actual reference site: https://prokip.xtemos.com/t-shirts-prints/
 * Contains only content from the T-Shirts & Prints template, no cross-template components.
 */
export const T_SHIRTS_PRINTS_PRESET: EditorNode[] = [
  {
    id: "tshirts-hero",
    type: "fashionHeroSlider",
          settings: {
        autoplaySpeed: 5000,
      minHeight: "560px"
      },
      elements: [
        {
          id: "tshirts-hero-slide-1",
          type: "slide",
          settings:           {
            "title": "Unique Prints",
            "subtitle": "Express Yourself",
            "description": "Stand out with our collection of artistically designed t-shirts featuring unique prints and artwork.",
            "buttonText": "Shop Now",
            "buttonLink": "/shop",
            "backgroundImage": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop"
          },
          elements: [],
        }
      ],
  },
  {
    id: "tshirts-categories",
    type: "fashionCategoryCards",
    settings: {
      sectionTitle: {
        subtitle: "EXPLORE",
        title: "Shop by Category",
      },
      categories: [
        { name: "T-Shirts", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Hoodies", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Sweatshirts", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80&auto=format&fit=crop", link: "/shop" },
        { name: "Accessories", image: "https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=800&q=80&auto=format&fit=crop", link: "/shop" },
      ],
    },
  },
  {
    id: "tshirts-featured",
    type: "fashionProductGrid",
    settings: {
      columns: 4,
      maxProducts: 8,
      filter: "featured",
      sectionTitle: {
        subtitle: "NEW ARRIVALS",
        title: "Featured Products",
      },
    },
  },
  {
    id: "tshirts-blog",
    type: "fashionBlogPosts",
    settings: {
      columns: 3,
      sectionTitle: {
        title: "Latest Articles",
      },
    },
  },
];
