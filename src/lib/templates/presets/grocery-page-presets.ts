import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Grocery Template Page Presets
 * Content extracted verbatim from the WoodMart Grocery demo sub-pages.
 * Source: https://woodmart.xtemos.com/demo-grocery/demo/grocery/
 * Uses grocery block types registered in GroceryTemplateBlocks.tsx.
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Source: https://woodmart.xtemos.com/about-us/demo/grocery/
   ═══════════════════════════════════════════════════════════════ */

export const GROCERY_ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "grocery-about-hero",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Xtemos is a creative design agency",
      title: "Our success and company history.",
      align: "center",
    },
  },
  {
    id: "grocery-about-story",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Woodmart - Best Ecommerce Theme 2021/22",
      title: "About Our Online Store",
      align: "left",
    },
  },
  {
    id: "grocery-about-convert",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Woodmart - Best Ecommerce Theme 2021/22",
      title: "We convert your idea Into a reality.",
      align: "left",
    },
  },
  {
    id: "grocery-about-creative",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Woodmart - Best Ecommerce Theme 2021/22",
      title: "Let\u2019s Get Creative!",
      align: "left",
    },
  },
  {
    id: "grocery-about-presentation",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Xtemos is a creative design agency",
      title: "Our Presentation",
      align: "center",
    },
  },
  {
    id: "grocery-about-quote",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Woodmart - Best Ecommerce Theme 2021/22",
      title: "\u2018\u2018Excellence is not a skill it\u2019s an attitude\u2019\u2019 - Ralph Marston",
      align: "center",
    },
  },
  {
    id: "grocery-about-connect",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Get in touch with us",
      title: "Get Connected",
      align: "center",
    },
  },
  {
    id: "grocery-about-newsletter",
    type: "groceryNewsletter",
    props: {
      title: "Hey you, sign up and connect to Woodmart!",
      subtitle: "Be the first to learn about our latest trends and get exclusive offers",
    },
  },
  {
    id: "grocery-about-footer",
    type: "groceryFooter",
    props: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Source: https://woodmart.xtemos.com/contact-us/demo/grocery/
   ═══════════════════════════════════════════════════════════════ */

export const GROCERY_CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "grocery-contact-store",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Our Stores",
      title: "Visit Our New Store In New York",
      align: "center",
    },
  },
  {
    id: "grocery-contact-faq-title",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Information Questions",
      title: "Frequently Asked Questions",
      align: "left",
    },
  },
  {
    id: "grocery-contact-form-title",
    type: "grocerySectionTitle",
    props: {
      subtitle: "Information About Us",
      title: "Contact Us For Any Questions",
      align: "left",
    },
  },
  {
    id: "grocery-contact-newsletter",
    type: "groceryNewsletter",
    props: {
      title: "Hey you, sign up and connect to Woodmart!",
      subtitle: "Be the first to learn about our latest trends and get exclusive offers",
    },
  },
  {
    id: "grocery-contact-footer",
    type: "groceryFooter",
    props: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   Source: https://woodmart.xtemos.com/blog/demo/grocery/
   ═══════════════════════════════════════════════════════════════ */

export const GROCERY_BLOG_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "grocery-blog-hero",
    type: "grocerySectionTitle",
    props: {
      subtitle: "",
      title: "Woodmart Blog",
      align: "center",
    },
  },
  {
    id: "grocery-blog-posts",
    type: "groceryPromoBanners",
    props: {
      banners: [
        {
          title: "Seating collection inspiration by modern",
          subtitle: "Design trends, Furniture",
          description: "Ac haca ullamcorper donec ante habi tasse donec imperdiet eturpis varius per a augue magna hac. Nec hac et vestibulum duis a tinci...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-9.jpg",
          buttonText: "Continue reading",
          buttonLink: "#",
        },
        {
          title: "Minimalist design furniture 2026",
          subtitle: "Design trends, Furniture",
          description: "Discover the ultimate blend of aesthetics, innovation, and functionality. We have curated five iconic European design houses that ...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-1.jpg",
          buttonText: "Continue reading",
          buttonLink: "#",
        },
        {
          title: "Green interior design inspiration",
          subtitle: "Design trends, Hand made",
          description: "Modern Atlanta homes impress with a harmony of light, space, and eco-materials. Each project reflects the unique character of its ...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-7.jpg",
          buttonText: "Continue reading",
          buttonLink: "#",
        },
        {
          title: "Reinterprets the classic bookshelf",
          subtitle: "Design trends, Inspiration",
          description: "Aliquet parturient scele risque scele risque nibh pretium parturient suspendisse platea sapien torquent feugiat parturient hac ame...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-3.jpg",
          buttonText: "Continue reading",
          buttonLink: "#",
        },
        {
          title: "Creative water features and exterior",
          subtitle: "Design trends, Inspiration",
          description: "Adipiscing hac imperdiet id blandit varius scelerisque at sagittis libero dui dis volutpat vehicula mus sed ut. Lacinia dui rutrum...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-13.jpg",
          buttonText: "Continue reading",
          buttonLink: "#",
        },
        {
          title: "Sweet seat: functional seat for IT folks",
          subtitle: "Design trends, Hand made",
          description: "Discover a world of digital art and modern design at our annual exhibition. Explore unique projects from international creators. T...",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2016/07/blog-grid-11.jpg",
          buttonText: "Continue reading",
          buttonLink: "#",
        },
      ],
    },
  },
  {
    id: "grocery-blog-newsletter",
    type: "groceryNewsletter",
    props: {
      title: "Hey you, sign up and connect to Woodmart!",
      subtitle: "Be the first to learn about our latest trends and get exclusive offers",
    },
  },
  {
    id: "grocery-blog-footer",
    type: "groceryFooter",
    props: {},
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
   Source: https://woodmart.xtemos.com/shop/demo/grocery/
   ═══════════════════════════════════════════════════════════════ */

export const GROCERY_SHOP_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "grocery-shop-hero",
    type: "grocerySectionTitle",
    props: {
      subtitle: "",
      title: "Shop",
      align: "center",
    },
  },
  {
    id: "grocery-shop-categories",
    type: "groceryCategoryGrid",
    props: {
      sectionTitle: "Popular Categories",
      categories: [
        { name: "Fruits", slug: "fruits", image: "https://woodmart.xtemos.com/wp-content/uploads/2020/07/grocery-cat-1.jpg", productCount: 12 },
        { name: "Vegetables", slug: "vegetables", image: "https://woodmart.xtemos.com/wp-content/uploads/2020/07/grocery-cat-2.jpg", productCount: 15 },
        { name: "Dairy", slug: "dairy", image: "https://woodmart.xtemos.com/wp-content/uploads/2020/07/grocery-cat-3.jpg", productCount: 8 },
        { name: "Bakery", slug: "bakery", image: "https://woodmart.xtemos.com/wp-content/uploads/2020/07/grocery-cat-4.jpg", productCount: 10 },
      ],
      columns: 4,
    },
  },
  {
    id: "grocery-shop-products",
    type: "groceryProductGrid",
    props: {
      columns: 4,
      maxProducts: 12,
      filter: "all",
      sectionTitle: {
        title: "All Products",
      },
    },
  },
  {
    id: "grocery-shop-newsletter",
    type: "groceryNewsletter",
    props: {
      title: "Hey you, sign up and connect to Woodmart!",
      subtitle: "Be the first to learn about our latest trends and get exclusive offers",
    },
  },
  {
    id: "grocery-shop-footer",
    type: "groceryFooter",
    props: {},
  },
];
