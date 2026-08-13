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
      sectionTitle: "TOP CATEGORIES",
      columns: 5,
      categories: [
        { name: "Home Decor", icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", image: "", link: "/shop" },
        { name: "Celing Decor", icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", image: "", link: "/shop" },
        { name: "Wall Decor", icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", image: "", link: "/shop" },
        { name: "Vase Decor", icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", image: "", link: "/shop" },
        { name: "Holiday Decor", icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M12%202l2.9%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l7.1-1.01z%22/%3E%3C/svg%3E", image: "", link: "/shop" },
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
        { icon: "🏠", title: "Home Modern Decoration Decals.", description: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born." },
        { icon: "✨", title: "New Decoration Solutions for Home.", description: "Supported neglected met she therefore unwilling discovery remainder." },
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
      title: "Summer 25% discount on all last year\u2019s products home decor",
      buttonText: "To Shop",
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
      paymentIconsUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop",
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
      image: "https://websitedemos.net/home-garden-decor-02/wp-content/uploads/sites/1034/2025/11/heroimage-1.png",
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
