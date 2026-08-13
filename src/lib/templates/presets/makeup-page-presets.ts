import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Makeup Template Page Presets
 * Content extracted verbatim from the Prokip LTD Makeup demo sub-pages.
 * Source: https://prokip.xtemos.com/makeup/
 * Uses makeup block types registered in MakeupTemplateBlocks.tsx.
 */

const IMG_BASE = "https://prokip.xtemos.com/makeup/wp-content/uploads/sites/22/2024/10";

const MAKEUP_BRANDS = [
  { name: "Caudalie", logo: `${IMG_BASE}/c2-brand-1.png`, link: "/shop?filter_brand=caudalie" },
  { name: "Cerave", logo: `${IMG_BASE}/c2-brand-2.png`, link: "/shop?filter_brand=cerave" },
  { name: "Mizon", logo: `${IMG_BASE}/c2-brand-3.png`, link: "/shop?filter_brand=mizon" },
  { name: "Payot", logo: `${IMG_BASE}/c2-brand-4.png`, link: "/shop?filter_brand=payot" },
  { name: "SVR", logo: `${IMG_BASE}/c2-brand-5.png`, link: "/shop?filter_brand=svr" },
  { name: "Tocobo", logo: `${IMG_BASE}/c2-brand-6.png`, link: "/shop?filter_brand=tocobo" },
  { name: "Uriage", logo: `${IMG_BASE}/c2-brand-7.png`, link: "/shop?filter_brand=uriage" },
];

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Source: https://prokip.xtemos.com/makeup/about-us/
   ═══════════════════════════════════════════════════════════════ */

export const MAKEUP_ABOUT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "makeup-about-hero",
    type: "makeupAboutHero",
    settings: {
      subtitle: "Care to Beauty",
      title: "A Complete Assortment of Cosmetics, At the Touch of a Finger.",
      bodyText: [
        "Wherever you are in the world, we believe you deserve the very best products.",
      ],
      images: [
        `${IMG_BASE}/c2-abt-1.jpg`,
        `${IMG_BASE}/c2-abt-2.jpg`,
      ],
      ctaText: "Learn More",
      ctaLink: "/about",
    },
  },
  {
    id: "makeup-about-story",
    type: "makeupTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Care to Beauty",
        title: "About Our Store",
      },
      bodyText: [
        "Care to Beauty is all about simplifying your way to beauty and skincare. We offer a complete assortment of cosmetics from world-renowned brands, carefully curated to meet all your beauty needs.",
        "Our mission is to bring premium skincare and beauty products closer to you, regardless of where you are in the world. We believe everyone deserves access to the very best products at fair prices.",
        "From cleansers and moisturizers to serums and sunscreens, our selection covers every step of your beauty routine. Each product is chosen with care, ensuring quality and effectiveness.",
      ],
      backgroundColor: "#f9f9f9",
    },
  },
  {
    id: "makeup-about-team",
    type: "makeupTeamSection",
    settings: {
      sectionTitle: {
        subtitle: "The Team",
        title: "Meet The Team",
      },
      team: [
        { name: "Mark Jance", role: "CEO / Founder", photoUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop" },
        { name: "Everly Quinn", role: "Creative Director", photoUrl: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=800&q=80&auto=format&fit=crop" },
        { name: "Anna Watson", role: "Marketing Lead", photoUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80&auto=format&fit=crop" },
        { name: "Oliver James", role: "Product Manager", photoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80&auto=format&fit=crop" },
      ],
    },
  },
  {
    id: "makeup-about-brands",
    type: "makeupBrandsCarousel",
    settings: {
      brands: MAKEUP_BRANDS,
      marginBottom: "60px",
    },
  },
  {
    id: "makeup-about-special",
    type: "makeupTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Beauty Tips",
        title: "Makeup for special events: shine uniquely!",
      },
      bodyText: [
        "A special day requires a special look, and bright makeup will be its highlight. Regardless of whether it is a wedding, a corporate event, or a romantic dinner, the right makeup will help you feel confident and unforgettable.",
        "An effective skincare routine starts with an effective cleansing routine. Finding the right cleanser for your skin can make a significant difference in maintaining healthy, radiant skin throughout the day.",
      ],
      backgroundColor: "transparent",
    },
  },
  {
    id: "makeup-about-footer",
    type: "makeupFooter",
    settings: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Source: https://prokip.xtemos.com/makeup/contact-us/
   ═══════════════════════════════════════════════════════════════ */

export const MAKEUP_CONTACT_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "makeup-contact-hero",
    type: "makeupContactHero",
    settings: {
      title: "Contact us",
      address: "2116 W McCormick St, Wichita, KS 67213, USA",
      phone: "(316) 389-7041",
      email: "xtemos.studio@gmail.com",
      hours: "Monday – Tuesday 10.00am – 6.00pm (By Appointment Only)\nWednesday – Saturday, 11.00am – 5.00pm\nSunday, Closed",
    },
  },
  {
    id: "makeup-contact-form",
    type: "makeupContactForm",
    settings: {
      title: "Send Us a Message",
    },
  },
  {
    id: "makeup-contact-brands",
    type: "makeupBrandsCarousel",
    settings: {
      brands: MAKEUP_BRANDS,
      marginBottom: "60px",
    },
  },
  {
    id: "makeup-contact-special",
    type: "makeupTextSection",
    settings: {
      sectionTitle: {
        subtitle: "Beauty Tips",
        title: "Makeup for special events: shine uniquely!",
      },
      bodyText: [
        "A special day requires a special look, and bright makeup will be its highlight. Regardless of whether it is a wedding, a corporate event, or a romantic dinner, the right makeup will help you feel confident and unforgettable.",
        "An effective skincare routine starts with an effective cleansing routine. Finding the right cleanser for your skin can make a significant difference in maintaining healthy, radiant skin throughout the day.",
      ],
      backgroundColor: "transparent",
    },
  },
  {
    id: "makeup-contact-footer",
    type: "makeupFooter",
    settings: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   Source: https://prokip.xtemos.com/makeup/blog/
   ═══════════════════════════════════════════════════════════════ */

export const MAKEUP_BLOG_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "makeup-blog-grid",
    type: "makeupBlogGrid",
    settings: {
      sectionTitle: "Latest Articles",
      posts: [
        {
          id: "makeup-blog-1",
          title: "Exploring the World of Cosmetics and Skincare",
          slug: "exploring-the-world-of-cosmetics-and-skincare",
          excerpt: "Discover the ultimate blend of beauty, innovation, and self-care. We explore the latest trends in cosmetics and skincare that are transforming the industry.",
          image: `${IMG_BASE}/c2-blg-1.jpg`,
          category: "Hair",
          author: "Mr. Mackay",
          date: "Oct 16",
        },
        {
          id: "makeup-blog-2",
          title: "Insider Secrets and Expert Advice",
          slug: "insider-secrets-and-expert-advice",
          excerpt: "Get exclusive tips from industry professionals on how to achieve flawless skin and makeup looks that last all day long.",
          image: `${IMG_BASE}/c2-blg-2.jpg`,
          category: "Sunscreen",
          author: "Mr. Mackay",
          date: "Oct 1",
        },
        {
          id: "makeup-blog-3",
          title: "Beauty Tips and Trends Unveiled",
          slug: "beauty-tips-and-trends-unveiled",
          excerpt: "Stay ahead of the curve with our curated guide to the hottest beauty trends and timeless tips for every skin type.",
          image: `${IMG_BASE}/c2-blg-3.jpg`,
          category: "Skincare",
          author: "Mr. Mackay",
          date: "Sep 22",
        },
        {
          id: "makeup-blog-4",
          title: "A Journey Through the History and Trends of Cosmetic Products",
          slug: "a-journey-through-the-history-and-trends-of-cosmetic-products",
          excerpt: "From ancient beauty rituals to modern innovations, explore how cosmetic products have evolved through the centuries.",
          image: `${IMG_BASE}/c2-blg-4.jpg`,
          category: "Makeup",
          author: "Mr. Mackay",
          date: "Sep 10",
        },
        {
          id: "makeup-blog-5",
          title: "Exploring the Ingredients Behind Your Favorite Cosmetics",
          slug: "exploring-the-ingredients-behind-your-favorite-cosmetics",
          excerpt: "Learn about the science behind key ingredients like hyaluronic acid, retinol, and niacinamide that power your favorite products.",
          image: `${IMG_BASE}/c2-blg-5.jpg`,
          category: "Hair",
          author: "Mr. Mackay",
          date: "Aug 29",
        },
        {
          id: "makeup-blog-6",
          title: "Exploring the Latest Innovations in Cosmetic Technology",
          slug: "exploring-the-latest-innovations-in-cosmetic-technology",
          excerpt: "From AI-powered skincare analysis to sustainable packaging, discover the technologies reshaping the beauty industry.",
          image: `${IMG_BASE}/c2-blg-6.jpg`,
          category: "Body",
          author: "Mr. Mackay",
          date: "Aug 2",
        },
      ],
    },
  },
  {
    id: "makeup-blog-footer",
    type: "makeupFooter",
    settings: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
   Source: https://prokip.xtemos.com/makeup/shop/
   ═══════════════════════════════════════════════════════════════ */

export const MAKEUP_SHOP_PAGE_BLOCKS: EditorNode[] = [
  {
    id: "makeup-shop-categories",
    type: "makeupCategorySidebar",
    settings: {
      categories: [
        {
          name: "Body",
          icon: `${IMG_BASE}/c2-cat-body.png`,
          link: "/shop?category=body",
        },
        {
          name: "Hair",
          icon: `${IMG_BASE}/c2-cat-hair.png`,
          link: "/shop?category=hair",
        },
        {
          name: "Makeup",
          icon: `${IMG_BASE}/c2-cat-makeup.png`,
          link: "/shop?category=makeup",
        },
        {
          name: "Skincare",
          icon: `${IMG_BASE}/c2-cat-skincare.png`,
          link: "/shop?category=skincare",
        },
        {
          name: "Sunscreen",
          icon: `${IMG_BASE}/c2-cat-sunscreen.png`,
          link: "/shop?category=sunscreen",
        },
      ],
      marginBottom: "40px",
    },
  },
  {
    id: "makeup-shop-products",
    type: "makeupProductGrid",
    settings: {
      columns: 4,
      maxProducts: 12,
      showCategory: true,
      showHoverImage: true,
      sectionTitle: {
        title: "All Products",
      },
      marginBottom: "60px",
    },
  },
  {
    id: "makeup-shop-footer",
    type: "makeupFooter",
    settings: {},
  },
];
