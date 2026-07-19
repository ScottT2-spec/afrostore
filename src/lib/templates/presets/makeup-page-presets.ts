import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Makeup Template Page Presets
 * Content extracted verbatim from the WoodMart Makeup demo sub-pages.
 * Source: https://woodmart.xtemos.com/makeup/
 * Uses makeup block types registered in MakeupTemplateBlocks.tsx.
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Source: https://woodmart.xtemos.com/makeup/about-us/
   ═══════════════════════════════════════════════════════════════ */

export const MAKEUP_ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "makeup-about-hero",
    type: "makeupSectionTitle",
    props: {
      title: "A Complete Assortment of Cosmetics, At the Touch of a Finger.",
      align: "center",
      marginBottom: "0px",
    },
  },
  {
    id: "makeup-about-intro",
    type: "makeupBeforeAfter",
    props: {
      title: "Care to Beauty is all about simplifying your way to beauty and skincare.",
      description: "Wherever you are in the world, we believe you deserve the very best products.",
      beforeImage: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-glry-3.jpg",
      afterImage: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-glry-3.jpg",
      buttonText: "",
      buttonLink: "#",
      backgroundColor: "#fff",
      marginBottom: "60px",
    },
  },
  {
    id: "makeup-about-team-title",
    type: "makeupSectionTitle",
    props: {
      title: "Meet The Team",
      align: "center",
      marginBottom: "15px",
    },
  },
  {
    id: "makeup-about-team-desc",
    type: "makeupSectionTitle",
    props: {
      title: "Each member excels both professionally and personally, contributing their unique talents to create a harmonious and effective work environment.",
      align: "center",
      marginBottom: "40px",
    },
  },
  {
    id: "makeup-about-business",
    type: "makeupSectionTitle",
    props: {
      title: "How We Start Our Business",
      align: "center",
      marginBottom: "40px",
    },
  },
  {
    id: "makeup-about-brands",
    type: "makeupBrandsCarousel",
    props: {
      brands: [
        { name: "Caudalie", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-1.png", url: "/shop?filter_brand=caudalie" },
        { name: "Cerave", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-2.png", url: "/shop?filter_brand=cerave" },
        { name: "Mizon", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-3.png", url: "/shop?filter_brand=mizon" },
        { name: "Payot", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-4.png", url: "/shop?filter_brand=payot" },
        { name: "SVR", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-5.png", url: "/shop?filter_brand=svr" },
        { name: "Tocobo", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-6.png", url: "/shop?filter_brand=tocobo" },
        { name: "Uriage", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-7.png", url: "/shop?filter_brand=uriage" },
      ],
      marginBottom: "60px",
    },
  },
  {
    id: "makeup-about-article-title",
    type: "makeupSectionTitle",
    props: {
      title: "Makeup for special events: shine uniquely!",
      align: "center",
      marginBottom: "20px",
    },
  },
  {
    id: "makeup-about-footer",
    type: "makeupFooter",
    props: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Source: https://woodmart.xtemos.com/makeup/contact-us/
   ═══════════════════════════════════════════════════════════════ */

export const MAKEUP_CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "makeup-contact-hero",
    type: "makeupSectionTitle",
    props: {
      title: "Contact us",
      align: "center",
      marginBottom: "40px",
    },
  },
  {
    id: "makeup-contact-address",
    type: "makeupSectionTitle",
    props: {
      title: "Address",
      align: "left",
      marginBottom: "10px",
    },
  },
  {
    id: "makeup-contact-brands",
    type: "makeupBrandsCarousel",
    props: {
      brands: [
        { name: "Caudalie", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-1.png", url: "/shop?filter_brand=caudalie" },
        { name: "Cerave", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-2.png", url: "/shop?filter_brand=cerave" },
        { name: "Mizon", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-3.png", url: "/shop?filter_brand=mizon" },
        { name: "Payot", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-4.png", url: "/shop?filter_brand=payot" },
        { name: "SVR", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-5.png", url: "/shop?filter_brand=svr" },
        { name: "Tocobo", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-6.png", url: "/shop?filter_brand=tocobo" },
        { name: "Uriage", logo: "https://woodmart.xtemos.com/cosmetics/wp-content/uploads/sites/22/2024/10/c2-brand-7.png", url: "/shop?filter_brand=uriage" },
      ],
      marginBottom: "60px",
    },
  },
  {
    id: "makeup-contact-footer",
    type: "makeupFooter",
    props: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   Source: https://woodmart.xtemos.com/makeup/blog/
   ═══════════════════════════════════════════════════════════════ */

export const MAKEUP_BLOG_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "makeup-blog-hero",
    type: "makeupSectionTitle",
    props: {
      title: "Blog",
      align: "center",
      marginBottom: "40px",
    },
  },
  {
    id: "makeup-blog-posts",
    type: "makeupBlogPosts",
    props: {
      sectionTitle: {
        title: "Latest Articles",
      },
      posts: [
        {
          id: "makeup-blog-1",
          title: "Exploring the World of Cosmetics and Skincare",
          slug: "exploring-the-world-of-cosmetics-and-skincare",
          excerpt: "",
          image: "https://woodmart.xtemos.com/makeup/wp-content/uploads/sites/22/2024/10/c2-blg-1.jpg",
          category: "Hair",
          author: "Mr. Mackay",
          date: "Oct 16",
        },
        {
          id: "makeup-blog-2",
          title: "Insider Secrets and Expert Advice",
          slug: "insider-secrets-and-expert-advice",
          excerpt: "",
          image: "https://woodmart.xtemos.com/makeup/wp-content/uploads/sites/22/2024/10/c2-blg-2.jpg",
          category: "Sunscreen",
          author: "Mr. Mackay",
          date: "Oct 1",
        },
        {
          id: "makeup-blog-3",
          title: "Beauty Tips and Trends Unveiled",
          slug: "beauty-tips-and-trends-unveiled",
          excerpt: "",
          image: "https://woodmart.xtemos.com/makeup/wp-content/uploads/sites/22/2024/10/c2-blg-3.jpg",
          category: "Skincare",
          author: "Mr. Mackay",
          date: "Sep 22",
        },
        {
          id: "makeup-blog-4",
          title: "A Journey Through the History and Trends of Cosmetic Products",
          slug: "a-journey-through-the-history-and-trends-of-cosmetic-products",
          excerpt: "",
          image: "https://woodmart.xtemos.com/makeup/wp-content/uploads/sites/22/2024/10/c2-blg-4.jpg",
          category: "Makeup",
          author: "Mr. Mackay",
          date: "Sep 10",
        },
        {
          id: "makeup-blog-5",
          title: "Exploring the Ingredients Behind Your Favorite Cosmetics",
          slug: "exploring-the-ingredients-behind-your-favorite-cosmetics",
          excerpt: "",
          image: "https://woodmart.xtemos.com/makeup/wp-content/uploads/sites/22/2024/10/c2-blg-5.jpg",
          category: "Hair",
          author: "Mr. Mackay",
          date: "Aug 29",
        },
        {
          id: "makeup-blog-6",
          title: "Exploring the Latest Innovations in Cosmetic Technology",
          slug: "exploring-the-latest-innovations-in-cosmetic-technology",
          excerpt: "",
          image: "https://woodmart.xtemos.com/makeup/wp-content/uploads/sites/22/2024/10/c2-blg-6.jpg",
          category: "Body",
          author: "Mr. Mackay",
          date: "Aug 2",
        },
      ],
      marginBottom: "60px",
    },
  },
  {
    id: "makeup-blog-footer",
    type: "makeupFooter",
    props: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
   Source: https://woodmart.xtemos.com/makeup/shop/
   ═══════════════════════════════════════════════════════════════ */

export const MAKEUP_SHOP_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "makeup-shop-hero",
    type: "makeupSectionTitle",
    props: {
      title: "Shop",
      align: "center",
      marginBottom: "40px",
    },
  },
  {
    id: "makeup-shop-categories",
    type: "makeupCategorySidebar",
    props: {
      categories: [
        {
          name: "Body",
          slug: "body",
          image: "",
          children: [
            { name: "Body Lotions", slug: "body-lotions" },
            { name: "Body Washes", slug: "body-washes" },
            { name: "Foot Care", slug: "foot-care" },
            { name: "Hand Care", slug: "hand-care" },
            { name: "Perfumes", slug: "perfumes" },
            { name: "Scrubs", slug: "scrubs" },
          ],
        },
        {
          name: "Hair",
          slug: "hair",
          image: "",
          children: [
            { name: "Conditioners", slug: "conditioners" },
            { name: "Hair Masks", slug: "hair-masks" },
            { name: "Scalp Care", slug: "scalp-care" },
            { name: "Shampoos", slug: "shampoos" },
            { name: "Styling", slug: "styling" },
          ],
        },
        {
          name: "Makeup",
          slug: "makeup",
          image: "",
          children: [
            { name: "Eyes", slug: "eyes" },
            { name: "Face", slug: "face" },
            { name: "Lips", slug: "lips" },
          ],
        },
        {
          name: "Skincare",
          slug: "skincare",
          image: "",
          children: [
            { name: "Cleansers", slug: "cleansers" },
            { name: "Creams", slug: "creams" },
            { name: "Eye Care", slug: "eye-care" },
            { name: "Lip Care", slug: "lip-care" },
            { name: "Masks", slug: "masks" },
            { name: "Peeling", slug: "peeling" },
            { name: "Serums", slug: "serums" },
            { name: "Toners", slug: "toners" },
          ],
        },
        {
          name: "Sunscreen",
          slug: "sunscreen",
          image: "",
          children: [
            { name: "After Sun", slug: "after-sun" },
            { name: "Body Sunscreen", slug: "body-sunscreen" },
            { name: "Face Sunscreen", slug: "face-sunscreen" },
            { name: "Hair Sunscreen", slug: "hair-sunscreen" },
          ],
        },
      ],
      marginBottom: "40px",
    },
  },
  {
    id: "makeup-shop-products",
    type: "makeupProductGrid",
    props: {
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
    props: {},
  },
];
