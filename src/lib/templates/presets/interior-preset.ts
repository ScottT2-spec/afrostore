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
            "subtitle": "$250.00",
            "buttonText": "Go To Shop",
            "buttonLink": "/shop",
            "image": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format&fit=crop"
          },
          elements: [],
        },
        {
          id: "interior-hero-slide-2",
          type: "slide",
          settings:           {
            "titleLine1": "Home Flower Plant",
            "titleLine2": "Glass Vase.",
            "subtitle": "$286.00",
            "buttonText": "Go To Shop",
            "buttonLink": "/shop",
            "image": "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80&auto=format&fit=crop"
          },
          elements: [],
        },
        {
          id: "interior-hero-slide-3",
          type: "slide",
          settings:           {
            "titleLine1": "Modern Nordic",
            "titleLine2": "Minimalist Cattle.",
            "buttonText": "Go To Shop",
            "buttonLink": "/shop",
            "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop"
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
            "image": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80&auto=format&fit=crop"
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
        { name: "Lighting", icon: "💡", image: "", link: "/shop?category=lighting" },
        { name: "Furniture", icon: "🛋️", image: "", link: "/shop?category=furniture" },
        { name: "Decor", icon: "🏺", image: "", link: "/shop?category=decor" },
        { name: "Clocks", icon: "🕐", image: "", link: "/shop?category=clocks" },
        { name: "Kitchen", icon: "🍽️", image: "", link: "/shop?category=kitchen" },
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
          image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80&auto=format&fit=crop",
          buttonText: "View More",
          buttonLink: "/shop",
        },
        {
          title: "Decorative Wall Elements.",
          subtitle: "View More",
          image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format&fit=crop",
          buttonText: "View More",
          buttonLink: "/shop",
        },
        {
          title: "Decorations For New Novel.",
          subtitle: "View More",
          image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80&auto=format&fit=crop",
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
      posts: [],
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
      logoUrl: "",
      logoAlt: "Store Logo",
      description: "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
      contact: {
        address: "Update this with your store's real address",
        phone: "Update with your phone number",
      },
      recentPosts: [],
      linkColumns: [
        { title: "SHOP", links: [{ label: "All Products", url: "/shop" }, { label: "About Us", url: "/about" }, { label: "Contact Us", url: "/contact" }, { label: "Blog", url: "/blog" }] },
      ],
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
          image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&h=500&fit=crop",
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
