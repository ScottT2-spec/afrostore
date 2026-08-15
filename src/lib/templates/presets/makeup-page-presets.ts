import type { EditorNode } from "@/lib/visual-editor/node-tree";

/**
 * Makeup Template Page Presets
 * Content extracted verbatim from the Prokip LTD Makeup demo sub-pages.
 * Source: https://prokip.xtemos.com/makeup/
 * Uses makeup block types registered in MakeupTemplateBlocks.tsx.
 */


export const MAKEUP_BRANDS = [
  { name: "Caudalie", logo: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3ECaudalie%3C/text%3E%3C/svg%3E", link: "/shop?filter_brand=caudalie" },
  { name: "Cerave", logo: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3ECerave%3C/text%3E%3C/svg%3E", link: "/shop?filter_brand=cerave" },
  { name: "Mizon", logo: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3EMizon%3C/text%3E%3C/svg%3E", link: "/shop?filter_brand=mizon" },
  { name: "Payot", logo: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3EPayot%3C/text%3E%3C/svg%3E", link: "/shop?filter_brand=payot" },
  { name: "SVR", logo: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3ESVR%3C/text%3E%3C/svg%3E", link: "/shop?filter_brand=svr" },
  { name: "Tocobo", logo: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3ETocobo%3C/text%3E%3C/svg%3E", link: "/shop?filter_brand=tocobo" },
  { name: "Uriage", logo: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%2240%22%20viewBox%3D%220%200%20160%2040%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Helvetica%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22600%22%20letter-spacing%3D%221%22%20fill%3D%22%231a1a2e%22%3EUriage%3C/text%3E%3C/svg%3E", link: "/shop?filter_brand=uriage" },
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
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80&auto=format&fit=crop",
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
          image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80&auto=format&fit=crop",
          category: "Hair",
          author: "Mr. Mackay",
          date: "Oct 16",
        },
        {
          id: "makeup-blog-2",
          title: "Insider Secrets and Expert Advice",
          slug: "insider-secrets-and-expert-advice",
          excerpt: "Get exclusive tips from industry professionals on how to achieve flawless skin and makeup looks that last all day long.",
          image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80&auto=format&fit=crop",
          category: "Sunscreen",
          author: "Mr. Mackay",
          date: "Oct 1",
        },
        {
          id: "makeup-blog-3",
          title: "Beauty Tips and Trends Unveiled",
          slug: "beauty-tips-and-trends-unveiled",
          excerpt: "Stay ahead of the curve with our curated guide to the hottest beauty trends and timeless tips for every skin type.",
          image: "https://images.unsplash.com/photo-1522337094846-8a8b0b3b6e7b?w=800&q=80&auto=format&fit=crop",
          category: "Skincare",
          author: "Mr. Mackay",
          date: "Sep 22",
        },
        {
          id: "makeup-blog-4",
          title: "A Journey Through the History and Trends of Cosmetic Products",
          slug: "a-journey-through-the-history-and-trends-of-cosmetic-products",
          excerpt: "From ancient beauty rituals to modern innovations, explore how cosmetic products have evolved through the centuries.",
          image: "https://images.unsplash.com/photo-1512207736890-6ffe437ca9a8?w=800&q=80&auto=format&fit=crop",
          category: "Makeup",
          author: "Mr. Mackay",
          date: "Sep 10",
        },
        {
          id: "makeup-blog-5",
          title: "Exploring the Ingredients Behind Your Favorite Cosmetics",
          slug: "exploring-the-ingredients-behind-your-favorite-cosmetics",
          excerpt: "Learn about the science behind key ingredients like hyaluronic acid, retinol, and niacinamide that power your favorite products.",
          image: "https://images.unsplash.com/photo-1598440947619-2c35cc9019a4?w=800&q=80&auto=format&fit=crop",
          category: "Hair",
          author: "Mr. Mackay",
          date: "Aug 29",
        },
        {
          id: "makeup-blog-6",
          title: "Exploring the Latest Innovations in Cosmetic Technology",
          slug: "exploring-the-latest-innovations-in-cosmetic-technology",
          excerpt: "From AI-powered skincare analysis to sustainable packaging, discover the technologies reshaping the beauty industry.",
          image: "https://images.unsplash.com/photo-1567721913486-6585f069b332?w=800&q=80&auto=format&fit=crop",
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
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%225%22%20r%3D%222.5%22/%3E%3Cpath%20d%3D%22M12%208v7M8%2022l2-7h4l2%207M9%2012H5l2-4M15%2012h4l-2-4%22/%3E%3C/svg%3E",
          link: "/shop?category=body",
        },
        {
          name: "Hair",
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M6%203c4%200%206%203%206%206s2%206%206%206M6%203c-2%203-2%206%200%209M6%203c1%204%201%208-1%2012M18%2015c2%202%202%204%201%206M18%2015c-2%201-4%203-4%206%22/%3E%3C/svg%3E",
          link: "/shop?category=hair",
        },
        {
          name: "Makeup",
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M8%203l3%203-8%208v3h3l8-8M14%206l3-3%204%204-3%203M9%2020h10%22/%3E%3C/svg%3E",
          link: "/shop?category=makeup",
        },
        {
          name: "Skincare",
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Crect%20x%3D%227%22%20y%3D%228%22%20width%3D%2210%22%20height%3D%2213%22%20rx%3D%222%22/%3E%3Cpath%20d%3D%22M9%208V5a3%203%200%20016%200v3%22/%3E%3C/svg%3E",
          link: "/shop?category=skincare",
        },
        {
          name: "Sunscreen",
          icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231a1a2e%22%20stroke-width%3D%221.5%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%228%22%20r%3D%224%22/%3E%3Cpath%20d%3D%22M12%201v2M12%2013v2M5%208H3M21%208h-2M6.5%203.5l1.4%201.4M17.5%203.5l-1.4%201.4M4%2020h16%22/%3E%3C/svg%3E",
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
