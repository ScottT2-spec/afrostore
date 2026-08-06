import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Makeup Template Preset
 * Recreates the Prokip LTD Makeup demo layout with editable blocks.
 */
export const MAKEUP_TEMPLATE_PRESET: EditorNode[] = [
  {
    id: "makeup-hero",
    type: "makeupHeroSlider",
          settings: {
        autoplaySpeed: 5000,
      minHeight: "500px",
      marqueeText: "Free Shipping On Orders Over $100"
      },
      elements: [
        {
          id: "makeup-hero-slide-1",
          type: "slide",
          settings:           {
            "title": "Eye Patches With Chamomile Extract",
            "description": "In particular, this pack comes with two different size patches to fit various types of blemishes. Perfect for a targeted application.",
            "buttonText": "Shop Now",
            "buttonLink": "/shop",
            "backgroundImage": "/prokip-logo.png",
            "colorScheme": "dark"
          },
          elements: [],
        },
        {
          id: "makeup-hero-slide-2",
          type: "slide",
          settings:           {
            "title": "Best Cleansing Oil for Oily Skin",
            "description": "Perfect for a targeted application, you just need to take a patch, apply it directly to the blemish.",
            "buttonText": "Shop Now",
            "buttonLink": "/shop",
            "backgroundImage": "/prokip-logo.png",
            "colorScheme": "dark"
          },
          elements: [],
        },
        {
          id: "makeup-hero-slide-3",
          type: "slide",
          settings:           {
            "title": "New Sunscreen for The Body and Face",
            "description": "In particular, this pack comes with two different size patches to fit various.",
            "buttonText": "Shop Now",
            "buttonLink": "/shop",
            "backgroundImage": "/prokip-logo.png",
            "colorScheme": "light"
          },
          elements: [],
        }
      ],
  },
  {
    id: "makeup-sidebar-cats",
    type: "makeupCategorySidebar",
    settings: {
      categories: [
        { name: "Blemish control cleanser", icon: "💧", link: "/shop" },
        { name: "Protective moisturizing", icon: "🛡️", link: "/shop" },
        { name: "Soothing toning pads", icon: "🧴", link: "/shop" },
        { name: "Lip tint intense", icon: "💄", link: "/shop" },
      ],
    },
  },
  {
    id: "makeup-recently-viewed",
    type: "makeupProductGrid",
    settings: {
      columns: 4,
      maxProducts: 8,
      sectionTitle: { title: "Recently Viewed" },
      products: [],
    },
  },
  {
    id: "makeup-bestsellers",
    type: "makeupProductGrid",
    settings: {
      columns: 4,
      maxProducts: 8,
      sectionTitle: { title: "Week Bestsellers", buttonText: "More products", buttonLink: "/shop" },
      filter: "bestseller",
      products: [],
    },
  },
  {
    id: "makeup-product-types",
    type: "makeupProductTypeCards",
    settings: {
      sectionTitle: { title: "Popular Product Types" },
      cards: [
        { name: "Cleansers", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=400&fit=crop", link: "/shop", productCount: 12 },
        { name: "Conditioners", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300&h=400&fit=crop", link: "/shop", productCount: 8 },
        { name: "Face Sunscreen", image: "https://images.unsplash.com/photo-1570194065650-d99fb4a38c5f?w=300&h=400&fit=crop", link: "/shop", productCount: 10 },
        { name: "Masks", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300&h=400&fit=crop", link: "/shop", productCount: 6 },
        { name: "Serums", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=400&fit=crop", link: "/shop", productCount: 9 },
      ],
    },
  },
  {
    id: "makeup-before-after",
    type: "makeupBeforeAfter",
    settings: {
      title: "Cosmetics, created using modern technologies",
      description: "Cosmetics, created using modern technologies, are aimed at the health and beauty of the skin.",
      beforeImage: "/prokip-logo.png",
      afterImage: "/prokip-logo.png",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      backgroundColor: "#bedbe1",
    },
  },
  {
    id: "makeup-promo-banners",
    type: "makeupPromoBannerCards",
    settings: {
      cards: [
        {
          title: "In addition to diminishing the visibility of blemishes",
          description: "Blemish control cleanser",
          backgroundImage: "/prokip-logo.png",
          titleColor: "#fff",
          descColor: "#ddd",
          link: "/shop",
        },
        {
          title: "Protective moisturizing flow for lips and cheeks",
          description: "Lip tint of an intense pink-beige shade",
          backgroundImage: "/prokip-logo.png",
          titleColor: "#333",
          descColor: "#666",
          link: "/shop",
        },
      ],
    },
  },
  {
    id: "makeup-videos",
    type: "makeupVideoBlog",
    settings: {
      sectionTitle: { title: "Latest Videos on Channel" },
      videos: [],
    },
  },
  {
    id: "makeup-blog",
    type: "makeupBlogPosts",
    settings: {
      sectionTitle: { title: "Recent Articles" },
      posts: [],
    },
  },
  {
    id: "makeup-brands",
    type: "makeupBrandsCarousel",
    settings: {
      brands: [],
    },
  },
  {
    id: "makeup-footer", type: "makeupFooter",
    settings: {
      logoUrl: "",
      logoAlt: "Store Logo",
      description: "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
      contact: {
        address: "451 Wall Street, UK, London",
        phone: "(064) 332-1233",
        fax: "(099) 453-1357",
      },
      recentPosts: [],
      linkColumns: [
        { title: "OUR STORES", links: [{ label: "New York", url: "#" }, { label: "London SF", url: "#" }, { label: "Edinburgh", url: "#" }, { label: "Los Angeles", url: "#" }, { label: "Chicago", url: "#" }, { label: "Las Vegas", url: "#" }] },
        { title: "USEFUL LINKS", links: [{ label: "Privacy Policy", url: "#" }, { label: "Returns", url: "#" }, { label: "Terms & Conditions", url: "#" }, { label: "Contact Us", url: "#" }, { label: "Latest News", url: "#" }, { label: "Our Sitemap", url: "#" }] },
        { title: "FOOTER MENU", links: [{ label: "Instagram profile", url: "#" }, { label: "New Collection", url: "#" }, { label: "Contact Us", url: "#" }, { label: "Latest News", url: "#" }, { label: "Our Sitemap", url: "#" }] },
      ],
      copyrightText: "",
      paymentIconsUrl: "/prokip-logo.png",
    },
  },
];
