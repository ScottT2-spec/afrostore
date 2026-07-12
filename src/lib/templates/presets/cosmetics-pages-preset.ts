import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Cosmetics Template — Page-specific block presets
 * Converts the hardcoded bestseller, new-in, skincare, and terms pages
 * into editable block arrays that match the original content exactly.
 */

/* ═══════════════════════════════════════════════════════════════
   BESTSELLER PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_BESTSELLER_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-bestseller-title",
    type: "cosmeticsSectionTitle",
    props: {
      subtitle: "",
      title: "Bestsellers",
      description:
        "Discover our most loved products. These customer favorites have earned their place in our collection.",
      align: "center",
      maxWidth: "60%",
    },
  },
  {
    id: "cosmetics-bestseller-products",
    type: "cosmeticsProductGrid",
    props: {
      columns: 4,
      maxProducts: 12,
      filter: "bestseller",
      showCategory: true,
      showHoverImage: true,
      sectionTitle: {},
      products: [],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   NEW-IN PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_NEW_IN_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-newin-title",
    type: "cosmeticsSectionTitle",
    props: {
      subtitle: "NEW ARRIVALS",
      title: "Just Arrived",
      description:
        "Be the first to discover our latest additions. Limited quantities available.",
      align: "center",
      maxWidth: "60%",
    },
  },
  {
    id: "cosmetics-newin-countdown",
    type: "cosmeticsCountdownBanner",
    props: {
      title: "Limited Time Offer",
      description:
        "Shop our newest arrivals before they sell out. New products added weekly.",
      image: "",
      buttonText: "SHOP ALL NEW ARRIVALS",
      buttonLink: "/shop?sort=newest",
      secondButtonText: "",
      secondButtonLink: "",
    },
  },
  {
    id: "cosmetics-newin-products",
    type: "cosmeticsProductGrid",
    props: {
      columns: 4,
      maxProducts: 12,
      filter: "newest",
      filterTag: "new-arrival",
      showCategory: true,
      showHoverImage: true,
      sectionTitle: {},
      products: [],
    },
  },
  {
    id: "cosmetics-newin-newsletter",
    type: "cosmeticsNewsletter",
    props: {
      backgroundImage: "",
      title: "Stay Updated",
      description:
        "Subscribe to our newsletter and be the first to know about new arrivals and exclusive offers.",
      buttonText: "Subscribe",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   SKINCARE PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_SKINCARE_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-skincare-hero",
    type: "cosmeticsDiscovery",
    props: {
      title: "Premium Skincare Collection",
      description:
        "Discover our curated selection of skincare products designed to nourish, protect, and rejuvenate your skin. From cleansers to serums, find everything you need for your daily routine.",
      image: "",
      features: [
        { icon: "✨", titleLine1: "Nourish", titleLine2: "& Protect" },
        { icon: "🧴", titleLine1: "Daily", titleLine2: "Routine" },
        { icon: "🌿", titleLine1: "Natural", titleLine2: "Care" },
      ],
      buttonText: "SHOP SKINCARE",
      buttonLink: "/shop?category=skincare",
      secondButtonText: "",
      secondButtonLink: "",
    },
  },
  {
    id: "cosmetics-skincare-benefits",
    type: "cosmeticsInfoBoxes",
    props: {
      sectionTitle: { title: "WHY CHOOSE OUR SKINCARE?" },
      boxes: [
        {
          image: "",
          number: "01",
          title: "Natural Ingredients",
          description:
            "Formulated with organic and natural ingredients for gentle care",
        },
        {
          image: "",
          number: "02",
          title: "Dermatologist Tested",
          description:
            "All products are tested and approved by skincare experts",
        },
        {
          image: "",
          number: "03",
          title: "Cruelty Free",
          description:
            "We never test on animals, committed to ethical beauty",
        },
        {
          image: "",
          number: "04",
          title: "Fast Results",
          description:
            "Visible improvements in skin texture and tone within weeks",
        },
      ],
    },
  },
  {
    id: "cosmetics-skincare-products",
    type: "cosmeticsProductGrid",
    props: {
      columns: 4,
      maxProducts: 12,
      filter: "all",
      filterTag: "skincare",
      showCategory: true,
      showHoverImage: true,
      sectionTitle: {
        subtitle: "",
        title: "SKINCARE PRODUCTS",
      },
      products: [],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   TERMS PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_TERMS_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-terms-title",
    type: "cosmeticsSectionTitle",
    props: {
      subtitle: "",
      title: "Terms and Conditions",
      description: "",
      align: "center",
      maxWidth: "60%",
    },
  },
  {
    id: "cosmetics-terms-introduction",
    type: "heading",
    props: {
      text: "1. Introduction",
      level: "h2",
      align: "left",
      color: "#242424",
    },
  },
  {
    id: "cosmetics-terms-introduction-text",
    type: "text",
    props: {
      text: "Welcome to our store. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.",
      color: "#767676",
    },
  },
  {
    id: "cosmetics-terms-products",
    type: "heading",
    props: {
      text: "2. Products and Services",
      level: "h2",
      align: "left",
      color: "#242424",
    },
  },
  {
    id: "cosmetics-terms-products-text",
    type: "text",
    props: {
      text: "We strive to provide accurate descriptions and images of our cosmetics and skincare products. However, we do not warrant that product descriptions, colors, or other content are accurate, complete, reliable, current, or error-free.\n\nAll prices are listed in the store currency and are subject to change without notice. We reserve the right to discontinue any product at any time.",
      color: "#767676",
    },
  },
  {
    id: "cosmetics-terms-orders",
    type: "heading",
    props: {
      text: "3. Orders and Payment",
      level: "h2",
      align: "left",
      color: "#242424",
    },
  },
  {
    id: "cosmetics-terms-orders-text",
    type: "text",
    props: {
      text: "By placing an order, you offer to purchase the products listed. We reserve the right to accept or decline your order at our discretion. All orders are subject to availability and confirmation of the order price.\n\nPayment is due at the time of placing your order. We accept various payment methods as indicated on our website.",
      color: "#767676",
    },
  },
  {
    id: "cosmetics-terms-shipping",
    type: "heading",
    props: {
      text: "4. Shipping and Delivery",
      level: "h2",
      align: "left",
      color: "#242424",
    },
  },
  {
    id: "cosmetics-terms-shipping-text",
    type: "text",
    props: {
      text: "Shipping times provided at checkout are estimates only. We are not liable for any delays in delivery.\n\nRisk of loss and title for items purchased pass to you upon delivery to the shipping carrier.",
      color: "#767676",
    },
  },
  {
    id: "cosmetics-terms-returns",
    type: "heading",
    props: {
      text: "5. Returns and Refunds",
      level: "h2",
      align: "left",
      color: "#242424",
    },
  },
  {
    id: "cosmetics-terms-returns-text",
    type: "text",
    props: {
      text: "We accept returns within 14 days of delivery for unopened and unused products. Products must be returned in their original packaging.\n\nTo initiate a return, please contact our customer service team. Refunds will be processed within 5-7 business days of receiving the returned item.",
      color: "#767676",
    },
  },
  {
    id: "cosmetics-terms-privacy",
    type: "heading",
    props: {
      text: "6. Privacy Policy",
      level: "h2",
      align: "left",
      color: "#242424",
    },
  },
  {
    id: "cosmetics-terms-privacy-text",
    type: "text",
    props: {
      text: "Your use of our website is also subject to our Privacy Policy. Please review our Privacy Policy, which also governs the website and informs users of our data collection practices.",
      color: "#767676",
    },
  },
  {
    id: "cosmetics-terms-cookies",
    type: "heading",
    props: {
      text: "7. Cookies",
      level: "h2",
      align: "left",
      color: "#242424",
    },
  },
  {
    id: "cosmetics-terms-cookies-text",
    type: "text",
    props: {
      text: "We may use cookies and similar technologies to remember preferences, improve site performance, and better understand how visitors use the store.",
      color: "#767676",
    },
  },
  {
    id: "cosmetics-terms-contact",
    type: "heading",
    props: {
      text: "8. Contact Information",
      level: "h2",
      align: "left",
      color: "#242424",
    },
  },
  {
    id: "cosmetics-terms-contact-text",
    type: "text",
    props: {
      text: "If you have any questions about these Terms and Conditions, please contact us through our contact page or email us at our support address.",
      color: "#767676",
    },
  },
  {
    id: "cosmetics-terms-changes",
    type: "heading",
    props: {
      text: "9. Changes to Terms",
      level: "h2",
      align: "left",
      color: "#242424",
    },
  },
  {
    id: "cosmetics-terms-changes-text",
    type: "text",
    props: {
      text: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website following the posting of changes constitutes your acceptance of such changes.",
      color: "#767676",
    },
  },
];
