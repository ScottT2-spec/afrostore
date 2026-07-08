import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Grocery Template Preset
 * Recreates the WoodMart Grocery demo layout with editable blocks.
 */
export const GROCERY_TEMPLATE_PRESET: TemplateBlock[] = [
  {
    id: "grocery-hero",
    type: "groceryHeroSlider",
    props: {
      autoplaySpeed: 5000,
      slides: [
        {
          label: "WEEKLY DISCOUNTS",
          titleLine1: "-30% Discount Products",
          titleLine2: "On Barilla",
          description: "Chances are there wasn\u2019t collaboration, communication there wasn\u2019t a process agreed upon or specified with.",
          buttonText: "Read more",
          buttonLink: "/shop",
          backgroundColor: "#fdf3e7",
          productImage: "https://woodmart.xtemos.com/wp-content/uploads/2020/06/grocery-slide-1-product.png",
        },
        {
          label: "NEW SAUCES RANGE",
          titleLine1: "Korean Style",
          titleLine2: "Barbecue Sauce",
          buttonText: "Read more",
          buttonLink: "/shop",
          backgroundColor: "#e8f5e9",
          productImage: "https://woodmart.xtemos.com/wp-content/uploads/2020/06/grocery-slide-2-product.png",
        },
        {
          label: "FRUITS PREMIUM DRINK",
          titleLine1: "Best Juice Is",
          titleLine2: "For Drink For You",
          description: "It\u2019s like saying you\u2019re a bad designer, use less bold text, don\u2019t use italics in every other paragraph.",
          buttonText: "Read more",
          buttonLink: "/shop",
          backgroundColor: "#fff3e0",
          productImage: "https://woodmart.xtemos.com/wp-content/uploads/2020/06/grocery-slide-3-product.png",
        },
      ],
    },
  },
  {
    id: "grocery-features",
    type: "groceryFeaturesBar",
    props: {
      features: [
        { icon: "⭐", title: "Best Quality", description: "It\u2019s content strategy gone awry right from the start are wasn\u2019t." },
        { icon: "💳", title: "Online Payment", description: "Forswearing the use of Lorem Ipsum wouldn\u2019t have helped." },
        { icon: "🚚", title: "Fast Delivery", description: "It\u2019s like saying you\u2019re a bad designer, use less bold text, italics." },
      ],
    },
  },
  {
    id: "grocery-products",
    type: "groceryProductGrid",
    props: {
      columns: 5,
      maxProducts: 10,
      sectionTitle: "SALE PRODUCTS",
      tabs: ["All", "Bestsellers", "New Arrivals"],
      products: [],
    },
  },
  {
    id: "grocery-promos",
    type: "groceryPromoBanners",
    props: {
      banners: [
        {
          subtitle: "WEEKLY DISCOUNTS",
          title: "Using dummy content or fake information",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2020/06/grocery-banner-1.jpg",
          buttonText: "Read more",
          buttonLink: "/shop",
        },
        {
          subtitle: "NEW PRODUCTS",
          title: "Products with elegant design can quickly begin to bloat",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2020/06/grocery-banner-2.jpg",
          buttonText: "Read more",
          buttonLink: "/shop",
        },
      ],
    },
  },
  {
    id: "grocery-categories",
    type: "groceryCategoryGrid",
    props: {
      sectionTitle: "POPULAR CATEGORIES",
      columns: 4,
      categories: [
        { name: "Clocks", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Toys", image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Cooking", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop", link: "/shop" },
      ],
    },
  },
  {
    id: "grocery-bestsellers",
    type: "groceryBestSellers",
    props: {
      columns: 5,
      maxProducts: 10,
      products: [],
    },
  },
  {
    id: "grocery-newsletter",
    type: "groceryNewsletter",
    props: {
      title: "Join our newsletter!",
      description: "Will be used in accordance with our Privacy Policy",
      buttonText: "Subscribe",
      backgroundColor: "#4caf50",
    },
  },
  {
    id: "grocery-footer",
    type: "groceryFooter",
    props: {
      description: "Discover a curated collection of fresh produce and grocery essentials delivered to your door.",
      contactPhone: "(+035) 527-1710-70",
      contactEmail: "grocery@google.com",
      contactAddress: "451 Wall Street, UK, London",
      columns: [
        {
          title: "CUSTOMER SERVICE",
          links: [
            { label: "Help Centre", href: "#" },
            { label: "Returns", href: "#" },
            { label: "Product Recalls", href: "#" },
            { label: "Accessibility", href: "#" },
            { label: "Contact Us", href: "#" },
          ],
        },
        {
          title: "INFORMATION",
          links: [
            { label: "About Us", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Corporate News", href: "#" },
            { label: "Store Finder", href: "#" },
          ],
        },
      ],
      paymentImage: "https://woodmart.xtemos.com/wp-content/uploads/2018/08/payment.png",
      copyright: "\u00a9 2026. ALL RIGHTS RESERVED.",
    },
  },
];
