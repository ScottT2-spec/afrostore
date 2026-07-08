import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Interior Design / Decor Template Preset
 * Recreates the WoodMart Decor demo layout with editable blocks.
 */
export const INTERIOR_DECOR_PRESET: TemplateBlock[] = [
  {
    id: "interior-hero",
    type: "interiorHeroSlider",
    props: {
      autoplaySpeed: 5000,
      slides: [
        {
          titleLine1: "Ball-Shaped Table",
          titleLine2: "Night Lamp.",
          subtitle: "$250.00",
          buttonText: "Go To Shop",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-slide-4-right-img.jpg",
        },
        {
          titleLine1: "Home Flower Plant",
          titleLine2: "Glass Vase.",
          subtitle: "$286.00",
          buttonText: "Go To Shop",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-slide-3-right-img.jpg",
        },
        {
          titleLine1: "Modern Nordic",
          titleLine2: "Minimalist Cattle.",
          buttonText: "Go To Shop",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-slide-2-right-img.jpg",
        },
        {
          titleLine1: "Two Bowls Marble",
          titleLine2: "and Brass.",
          buttonText: "Go To Shop",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-slide-1-right-img.jpg",
        },
      ],
    },
  },
  {
    id: "interior-categories",
    type: "interiorCategoryGrid",
    props: {
      sectionTitle: "TOP CATEGORIES",
      columns: 5,
      categories: [
        { name: "Home Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-plant.svg", image: "", link: "/shop" },
        { name: "Celing Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-lamp.svg", image: "", link: "/shop" },
        { name: "Wall Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-art.svg", image: "", link: "/shop" },
        { name: "Vase Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-vase.svg", image: "", link: "/shop" },
        { name: "Holiday Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-baloons.svg", image: "", link: "/shop" },
      ],
    },
  },
  {
    id: "interior-promos",
    type: "interiorPromoBanners",
    props: {
      variant: "garden",
      banners: [
        {
          title: "New Arrivals In Decorations.",
          subtitle: "View More",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-banner-1.jpg",
          buttonText: "View More",
          buttonLink: "/shop",
        },
        {
          title: "Decorative Wall Elements.",
          subtitle: "View More",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-banner-2.jpg",
          buttonText: "View More",
          buttonLink: "/shop",
        },
        {
          title: "Decorations For New Novel.",
          subtitle: "View More",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-banner-3.jpg",
          buttonText: "View More",
          buttonLink: "/shop",
        },
      ],
    },
  },
  {
    id: "interior-featured",
    type: "interiorProductGrid",
    props: {
      columns: 5,
      maxProducts: 10,
      sectionTitle: "Featured Products",
      products: [],
    },
  },
  {
    id: "interior-info",
    type: "interiorInfoBoxes",
    props: {
      items: [
        { icon: "🏠", title: "Home Modern Decoration Decals.", description: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born." },
        { icon: "✨", title: "New Decoration Solutions for Home.", description: "Supported neglected met she therefore unwilling discovery remainder." },
      ],
    },
  },
  {
    id: "interior-blog",
    type: "interiorBlogPosts",
    props: {
      columns: 4,
      sectionTitle: "OUR BLOG",
      posts: [],
    },
  },
  {
    id: "interior-cta",
    type: "interiorCta",
    props: {
      title: "Summer 25% discount on all last year\u2019s products home decor",
      buttonText: "To Shop",
      buttonLink: "/shop",
      backgroundColor: "#f5f0eb",
    },
  },
  {
    id: "interior-footer",
    type: "interiorFooter",
    props: {
      description: "Discover a curated collection of modern home decor designed to bring comfort and elegance into your home.",
      columns: [
        {
          title: "OUR STORES",
          links: [
            { label: "New York", href: "#" },
            { label: "London SF", href: "#" },
            { label: "Edinburgh", href: "#" },
            { label: "Los Angeles", href: "#" },
          ],
        },
        {
          title: "USEFUL LINKS",
          links: [
            { label: "Privacy Policy", href: "#" },
            { label: "Returns", href: "#" },
            { label: "Terms & Conditions", href: "#" },
            { label: "Contact Us", href: "#" },
          ],
        },
      ],
      paymentImage: "https://woodmart.xtemos.com/wp-content/uploads/2018/08/payment.png",
      copyright: "\u00a9 2026. ALL RIGHTS RESERVED.",
    },
  },
];

/**
 * Interior Design / Retail Template Preset
 * Recreates the WoodMart Retail demo layout with editable blocks.
 */
export const INTERIOR_RETAIL_PRESET: TemplateBlock[] = [
  {
    id: "retail-hero",
    type: "interiorHeroSlider",
    props: {
      autoplaySpeed: 5000,
      slides: [
        {
          titleLine1: "COATED ALUMINUM FRAME",
          titleLine2: "",
          description: "Reddington 6-Piece Set Furniture Sectional Living Room Sofa.",
          buttonText: "VIEW MORE",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/08/slide-1.jpg",
        },
        {
          titleLine1: "TIME FOR A NEW SPEAKER?",
          titleLine2: "",
          description: "Bring The Best Experience Home With A Speaker From Marshall.",
          buttonText: "VIEW MORE",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/08/slide-2.jpg",
        },
        {
          titleLine1: "HIGH STRENGTH AND DURABLE",
          titleLine2: "",
          description: "Buy The Best Tourist Equipment For An Excellent Holiday.",
          buttonText: "VIEW MORE",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/08/slide-3.jpg",
        },
      ],
    },
  },
  {
    id: "retail-categories",
    type: "interiorCategoryGrid",
    props: {
      sectionTitle: "TOP CATEGORIES",
      columns: 6,
      categories: [
        { name: "Lighting", image: "", link: "/shop" },
        { name: "Clocks", image: "", link: "/shop" },
        { name: "Furniture", image: "", link: "/shop" },
        { name: "Accessories", image: "", link: "/shop" },
        { name: "Cooking", image: "", link: "/shop" },
        { name: "Toys", image: "", link: "/shop" },
      ],
    },
  },
  {
    id: "retail-sale",
    type: "interiorProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      sectionTitle: "SALE PRODUCTS",
      products: [],
    },
  },
  {
    id: "retail-info",
    type: "interiorInfoBoxes",
    props: {
      items: [
        { icon: "🚚", title: "Home Delivery.", description: "The European languages." },
        { icon: "🎁", title: "Order As a Gift.", description: "Donec odio etiam sceles." },
        { icon: "⭐", title: "High Quality.", description: "Curabitur hac hac maece." },
        { icon: "😊", title: "Buy With Joy.", description: "Ullamcorper magna nec." },
      ],
    },
  },
  {
    id: "retail-popular",
    type: "interiorFurnitureProducts",
    props: {
      columns: 4,
      maxProducts: 8,
      products: [],
    },
  },
  {
    id: "retail-furniture-cats",
    type: "interiorFurnitureCategories",
    props: {
      columns: 6,
      categories: [],
    },
  },
  {
    id: "retail-blog",
    type: "interiorBlogPosts",
    props: {
      columns: 4,
      sectionTitle: "OUR BLOG",
      posts: [],
    },
  },
  {
    id: "retail-brands",
    type: "interiorBrandsBar",
    props: {
      brands: [],
    },
  },
  {
    id: "retail-cta",
    type: "interiorCta",
    props: {
      title: "CURABITUR ALIQUET QUAM POSUERE",
      buttonText: "TO SHOP",
      buttonLink: "/shop",
    },
  },
  {
    id: "retail-footer",
    type: "interiorFooter",
    props: {
      description: "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
      columns: [
        {
          title: "CUSTOMER SERVICE",
          links: [
            { label: "Help Centre", href: "#" },
            { label: "Returns", href: "#" },
            { label: "Contact Us", href: "#" },
          ],
        },
        {
          title: "INFORMATION",
          links: [
            { label: "About Us", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Store Finder", href: "#" },
          ],
        },
      ],
      paymentImage: "https://woodmart.xtemos.com/wp-content/uploads/2018/08/payment.png",
      copyright: "\u00a9 2026. ALL RIGHTS RESERVED.",
    },
  },
];
