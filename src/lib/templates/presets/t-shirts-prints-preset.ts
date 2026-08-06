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
            "backgroundImage": "/prokip-logo.png"
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
        { name: "T-Shirts", image: "/prokip-logo.png", link: "/shop" },
        { name: "Hoodies", image: "/prokip-logo.png", link: "/shop" },
        { name: "Sweatshirts", image: "/prokip-logo.png", link: "/shop" },
        { name: "Accessories", image: "/prokip-logo.png", link: "/shop" },
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
