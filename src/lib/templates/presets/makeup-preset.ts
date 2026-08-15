import type { EditorNode } from "@/lib/visual-editor/node-tree";
import { MAKEUP_BRANDS } from "./makeup-page-presets";

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
            "backgroundImage": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop",
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
            "backgroundImage": "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=800&q=80&auto=format&fit=crop",
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
            "backgroundImage": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80&auto=format&fit=crop",
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
      beforeImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80&auto=format&fit=crop",
      afterImage: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=800&q=80&auto=format&fit=crop",
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
          backgroundImage: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80&auto=format&fit=crop",
          titleColor: "#fff",
          descColor: "#ddd",
          link: "/shop",
        },
        {
          title: "Protective moisturizing flow for lips and cheeks",
          description: "Lip tint of an intense pink-beige shade",
          backgroundImage: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80&auto=format&fit=crop",
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
      videos: [
        { thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=375&fit=crop", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { thumbnail: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=375&fit=crop", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { thumbnail: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&h=375&fit=crop", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
      ],
    },
  },
  {
    id: "makeup-blog",
    type: "makeupBlogPosts",
    settings: {
      sectionTitle: { title: "Recent Articles" },
      posts: [
        { image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80&auto=format&fit=crop", title: "5 skincare habits that actually make a difference", date: "June 12, 2026", commentCount: 8, link: "/blog" },
        { image: "https://images.unsplash.com/photo-1522337094846-8a8b0b3b6e7b?w=500&q=80&auto=format&fit=crop", title: "How to build a morning routine you'll stick to", date: "May 28, 2026", commentCount: 5, link: "/blog" },
        { image: "https://images.unsplash.com/photo-1512207736890-6ffe437ca9a8?w=500&q=80&auto=format&fit=crop", title: "Choosing the right SPF for your skin type", date: "May 14, 2026", commentCount: 12, link: "/blog" },
      ],
    },
  },
  {
    id: "makeup-brands",
    type: "makeupBrandsCarousel",
    settings: {
      brands: MAKEUP_BRANDS,
    },
  },
  {
    id: "makeup-footer", type: "makeupFooter",
    settings: {
      logoUrl: "",
      logoAlt: "Store Logo",
      description: "Clean, effective skincare and makeup formulated with real results in mind — for every skin tone and skin type.",
      contact: {
        address: "24 Adeola Odeku Street, Victoria Island, Lagos",
        phone: "+234 801 234 5678",
        fax: "hello@store.com",
      },
      recentPosts: [],
      linkColumns: [
        { title: "SHOP", links: [{ label: "Skincare", url: "/shop" }, { label: "Makeup", url: "/shop" }, { label: "Hair Care", url: "/shop" }, { label: "Sunscreen", url: "/shop" }, { label: "Gift Sets", url: "/shop" }] },
        { title: "CUSTOMER CARE", links: [{ label: "Contact Us", url: "/contact" }, { label: "Shipping & Returns", url: "#" }, { label: "FAQs", url: "#" }, { label: "Track Order", url: "/order-tracking" }] },
        { title: "COMPANY", links: [{ label: "About Us", url: "/about" }, { label: "Our Brands", url: "#" }, { label: "Blog", url: "/blog" }, { label: "Privacy Policy", url: "#" }] },
      ],
      copyrightText: `© ${new Date().getFullYear()}. All rights reserved.`,
      paymentIconsUrl: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=800&q=80&auto=format&fit=crop",
    },
  },
];
