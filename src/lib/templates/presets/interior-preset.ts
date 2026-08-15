import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Interior Design / Decor Template Preset
 * Recreates the Prokip LTD Decor demo layout with editable blocks.
 */
export const INTERIOR_DECOR_PRESET: EditorNode[] = [
  {
    id: "interior-hero",
    type: "interiorHeroSlider",
          settings: {
        autoplaySpeed: 5000
      },
      elements: [
        {
          id: "interior-hero-slide-1",
          type: "slide",
          settings:           {
            "titleLine1": "Ball-Shaped Table",
            "titleLine2": "Night Lamp.",
            "subtitle": "$89.00",
            "buttonText": "Go To Shop",
            "buttonLink": "/shop",
            "image": "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=900&q=80&auto=format&fit=crop"
          },
          elements: [],
        },
        {
          id: "interior-hero-slide-2",
          type: "slide",
          settings:           {
            "titleLine1": "Home Flower Plant",
            "titleLine2": "Glass Vase.",
            "subtitle": "$68.00",
            "buttonText": "Go To Shop",
            "buttonLink": "/shop",
            "image": "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=900&q=80&auto=format&fit=crop"
          },
          elements: [],
        },
        {
          id: "interior-hero-slide-3",
          type: "slide",
          settings:           {
            "titleLine1": "Modern Nordic",
            "titleLine2": "Minimalist Vase.",
            "buttonText": "Go To Shop",
            "buttonLink": "/shop",
            "image": "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=900&q=80&auto=format&fit=crop"
          },
          elements: [],
        },
        {
          id: "interior-hero-slide-4",
          type: "slide",
          settings:           {
            "titleLine1": "Two Bowls Marble",
            "titleLine2": "and Brass.",
            "buttonText": "Go To Shop",
            "buttonLink": "/shop",
            "image": "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=900&q=80&auto=format&fit=crop"
          },
          elements: [],
        }
      ],
  },
  {
    id: "interior-categories",
    type: "interiorCategoryGrid",
    settings: {
      sectionTitle: "SHOP BY CATEGORY",
      columns: 5,
      categories: [
        { name: "Lighting", image: "https://images.unsplash.com/photo-1543198126-b0d9dd0355c9?w=400&q=80&auto=format&fit=crop", link: "/shop?category=lighting" },
        { name: "Furniture", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80&auto=format&fit=crop", link: "/shop?category=furniture" },
        { name: "Decor", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80&auto=format&fit=crop", link: "/shop?category=decor" },
        { name: "Clocks", image: "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=400&q=80&auto=format&fit=crop", link: "/shop?category=clocks" },
        { name: "Kitchen", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&q=80&auto=format&fit=crop", link: "/shop?category=kitchen" },
      ],
    },
  },
  {
    id: "interior-promos",
    type: "interiorPromoBanners",
    settings: {
      variant: "garden",
      banners: [
        {
          title: "New Arrivals In Decorations.",
          subtitle: "View More",
          image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&q=80&auto=format&fit=crop",
          buttonText: "View More",
          buttonLink: "/shop",
        },
        {
          title: "Decorative Wall Elements.",
          subtitle: "View More",
          image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80&auto=format&fit=crop",
          buttonText: "View More",
          buttonLink: "/shop",
        },
        {
          image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop",
          title: "Cozy Living Room Finds.",
          subtitle: "View More",
          buttonText: "View More",
          buttonLink: "/shop",
        },
      ],
    },
  },
  {
    id: "interior-featured",
    type: "interiorProductGrid",
    settings: {
      columns: 5,
      maxProducts: 10,
      sectionTitle: "Featured Products",
      products: [],
    },
  },
  {
    id: "interior-info",
    type: "interiorInfoBoxes",
    settings: {
      items: [
        { icon: "🏠", title: "Thoughtfully Made for Modern Homes.", description: "Every piece is chosen for quality craftsmanship and everyday comfort." },
        { icon: "✨", title: "New Arrivals Every Month.", description: "Fresh decor and furniture pieces added regularly — there's always something new to discover." },
      ],
    },
  },
  {
    id: "interior-blog",
    type: "interiorBlogPosts",
    settings: {
      columns: 4,
      sectionTitle: "OUR BLOG",
      posts: [
        { title: "5 Ways to Style Your Living Room for Every Season", image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=500&q=80&auto=format&fit=crop", date: "October 12, 2025" },
        { title: "Choosing the Right Furniture for Small Spaces", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80&auto=format&fit=crop", date: "October 8, 2025" },
        { title: "Warm Neutrals: This Season's Biggest Decor Trend", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80&auto=format&fit=crop", date: "October 3, 2025" },
        { title: "How to Mix Textures Without Overdoing It", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80&auto=format&fit=crop", date: "September 28, 2025" },
      ],
    },
  },
  {
    id: "interior-cta",
    type: "interiorCta",
    settings: {
      title: "New season, new pieces for your home",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      backgroundColor: "#f5f0eb",
    },
  },
  {
    id: "interior-footer", type: "interiorFooter",
    settings: {
      description: "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
      contact: {
        address: "Update this with your store's real address",
        phone: "Update with your phone number",
        email: "Update with your contact email",
      },
      copyrightText: "",
    },
  },
];

/**
 * Interior Design / Retail Template Preset
 * Recreates the Prokip LTD Retail demo layout with editable blocks.
 */
export const INTERIOR_RETAIL_PRESET: EditorNode[] = [
  {
    id: "garden-hero",
    type: "gardenHeroBanner",
    settings: {
      heading: "Crafted with Care for Memorable Moments",
      subheading: "From timeless pieces to modern accents, create a home that celebrates your unique story.",
      ctaText: "SHOP NOW",
      ctaLink: "/shop",
      image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80&auto=format&fit=crop",
      exploreBtns: [
        { label: "Explore Indoor", link: "/shop?category=home-decor" },
        { label: "Explore Outdoor", link: "/shop?category=garden-decor" },
      ],
    },
  },
  {
    id: "garden-categories",
    type: "gardenCategoryBanner",
    settings: {
      banners: [
        {
          title: "Explore Indoor",
          subtitle: "Home Décor Collection",
          image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=700&h=500&fit=crop",
          link: "/shop?category=home-decor",
        },
        {
          title: "Explore Outdoor",
          subtitle: "Garden Décor Collection",
          image: "https://images.unsplash.com/photo-1600607687644-c7531e489ece?w=700&h=500&fit=crop",
          link: "/shop?category=garden-decor",
        },
      ],
    },
  },
  {
    id: "garden-discount",
    type: "gardenDiscountBanner",
    settings: {
      title: "20% OFF On Your First Order",
      ctaText: "SHOP NOW",
      ctaLink: "/shop",
      backgroundColor: "#038f81",
    },
  },
  {
    id: "garden-new-arrivals",
    type: "gardenNewArrivals",
    settings: {
      sectionTitle: "New Arrivals",
      viewAllText: "EXPLORE ALL PRODUCTS",
      viewAllLink: "/shop",
      columns: 4,
      maxProducts: 8,
    },
  },
  {
    id: "garden-features",
    type: "gardenFeatures",
    settings: {
      features: [
        {
          icon: "✨",
          title: "Unique Designs",
          description: "Every piece in our collection is created with a sense of artistry and purpose.",
        },
        {
          icon: "🌿",
          title: "Sustainable Materials",
          description: "We prioritize eco-friendly and responsibly sourced materials.",
        },
        {
          icon: "❤️",
          title: "Crafted with Love",
          description: "Our artisans bring passion and precision to every product we offer.",
        },
      ],
    },
  },
  {
    id: "garden-testimonials",
    type: "gardenTestimonials",
    settings: {
      sectionTitle: "What Our Customers Say",
      testimonials: [
        { name: "Sarah M.", text: "The quality of the garden decor is outstanding. Every piece feels unique and well-crafted.", rating: 5 },
        { name: "James L.", text: "Transformed my living room with their home decor collection. Absolutely love the natural aesthetic.", rating: 5 },
        { name: "Emily R.", text: "Fast shipping and beautiful packaging. The products exceeded my expectations.", rating: 5 },
      ],
    },
  },
];
