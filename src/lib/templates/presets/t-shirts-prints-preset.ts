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
      posts: [
        {
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80&auto=format&fit=crop",
          title: "How to Design a T-Shirt Print That Actually Sells",
          excerpt: "From bold typography to minimalist line art — here's what makes a print stand out and get worn, not shelved.",
          date: { day: "12", month: "Oct" },
          categories: ["Design Tips"],
          author: { name: "Admin" },
        },
        {
          image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&q=80&auto=format&fit=crop",
          title: "Choosing the Right Fabric for Custom Prints",
          excerpt: "Cotton, blends, and everything in between — how fabric choice affects print quality, comfort, and durability.",
          date: { day: "8", month: "Oct" },
          categories: ["Guides"],
          author: { name: "Admin" },
        },
        {
          image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80&auto=format&fit=crop",
          title: "5 Streetwear Trends Shaping Custom Apparel This Year",
          excerpt: "Oversized fits, retro graphics, and bold color-blocking — what's trending in custom tees right now.",
          date: { day: "3", month: "Oct" },
          categories: ["Trends"],
          author: { name: "Admin" },
        },
      ],
    },
  },
];
