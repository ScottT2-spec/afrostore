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
    id: "cosmetics-terms-hero",
    type: "cosmeticsHeroSlider",
    props: {
      slides: [
        {
          subtitle: "LEGAL",
          titleLine1: "Terms and",
          titleLine2: "Conditions",
          description: "Please read our terms and conditions carefully before using our services.",
          buttonLink: "",
          buttonText: "",
          secondButtonLink: "",
          secondButtonText: "",
        },
      ],
      minHeight: "400px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "cosmetics-terms-content",
    type: "cosmeticsInfoBoxes",
    props: {
      sectionTitle: {
        title: "TERMS AND CONDITIONS",
      },
      boxes: [
        {
          image: "",
          number: "01",
          title: "General Terms",
          description: "By placing an order through our website, you warrant that you are at least 18 years old and are legally capable of entering into binding contracts. We reserve the right to refuse service to anyone for any reason at any time. All products are subject to availability.",
        },
        {
          image: "",
          number: "02",
          title: "Products & Pricing",
          description: "We reserve the right to discontinue any product at any time. Prices are subject to change without notice. We make every effort to display accurate pricing, but errors may occur. In the event of a pricing error, we reserve the right to cancel the order.",
        },
        {
          image: "",
          number: "03",
          title: "Orders & Payment",
          description: "When you place an order, you will receive an email confirmation. This does not mean your order has been accepted. We reserve the right to refuse or cancel any order. Payment must be made in full at the time of purchase through our accepted payment methods.",
        },
        {
          image: "",
          number: "04",
          title: "Shipping & Delivery",
          description: "Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers, customs, or events beyond our control. Risk of loss passes to you upon delivery to the carrier.",
        },
        {
          image: "",
          number: "05",
          title: "Returns & Refunds",
          description: "We accept returns within 30 days of delivery for items in their original, unused condition. Refunds will be processed to the original payment method within 5-10 business days. Shipping costs are non-refundable unless the return is due to our error.",
        },
        {
          image: "",
          number: "06",
          title: "Privacy & Data",
          description: "We collect and process personal data in accordance with our Privacy Policy. By using our website, you consent to our data practices as described therein. We do not sell your personal information to third parties.",
        },
        {
          image: "",
          number: "07",
          title: "Cookies",
          description: "We may use cookies and similar technologies to remember preferences, improve site performance, and better understand how visitors use the store. You can manage cookie preferences through your browser settings.",
        },
        {
          image: "",
          number: "08",
          title: "Limitation of Liability",
          description: "To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or services. Our liability is limited to the purchase price of the product.",
        },
        {
          image: "",
          number: "09",
          title: "Contact Information",
          description: "If you have any questions about these Terms and Conditions, please contact us through our contact page or email us at support@cosmetics.com. We will respond to your inquiry within 2-3 business days.",
        },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_SHOP_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-shop-header",
    type: "cosmeticsShopPageHeader",
    props: {
      title: "Shop",
      allLabel: "All",
      subtitle: "Browse all products at {store name}",
      emptyState: "No products found",
      filterLabel: "Filters",
      loadMoreText: "Load More",
      categoriesLabel: "Categories",
      sortLabelNewest: "Newest",
      searchPlaceholder: "Search products...",
      sortLabelPriceLow: "Price: Low → High",
      sortLabelPriceHigh: "Price: High → Low",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_BLOG_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-blog-title",
    type: "cosmeticsSectionTitle",
    props: {
      subtitle: "",
      title: "Blog",
      description: "Latest news and updates from our store",
      align: "center",
      maxWidth: "60%",
    },
  },
  {
    id: "cosmetics-blog-posts",
    type: "cosmeticsBlogPosts",
    props: {
      maxPosts: 9,
      columns: 3,
      showExcerpt: true,
      showDate: true,
      sectionTitle: {},
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   ABOUT PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_ABOUT_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-about-hero",
    type: "cosmeticsSectionTitle",
    props: {
      subtitle: "BEAUTY & COSMETICS",
      title: "Our success and company history.",
      description: "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "0px",
    },
  },
  {
    id: "cosmetics-about-story",
    type: "fashionAboutContent",
    props: {
      layout: "text-with-heading",
      subtitle: "PREMIUM BEAUTY SINCE 2020",
      title: "About Our Online Store",
      paragraphs: [
        "We believe that beauty is more than skin deep. Our curated collection of premium cosmetics and skincare products is designed to help you look and feel your best, naturally.",
        "From luxurious moisturizers to vibrant color cosmetics, every product in our store is carefully selected for quality, efficacy, and sustainability. We partner with trusted brands that share our commitment to clean beauty.",
        "Our team of beauty experts is passionate about helping you discover products that work for your unique skin type and style. Whether you're building a daily routine or exploring new trends, we're here to guide you.",
        "Founded with a vision to make premium beauty accessible to everyone, we've grown from a small boutique into a trusted destination for beauty enthusiasts worldwide.",
      ],
      credit: "Established 2020",
    },
  },
  {
    id: "cosmetics-about-stats",
    type: "fashionStatsCounters",
    props: {
      counters: [
        { value: 15000, label: "SATISFIED CLIENTS" },
        { value: 850, label: "FINISHED PROJECTS" },
        { value: 45, label: "TEAM MEMBERS" },
        { value: 12, label: "OFFICES" },
      ],
    },
  },
  {
    id: "cosmetics-about-convert",
    type: "fashionAboutContent",
    props: {
      layout: "text-with-heading",
      subtitle: "BEAUTY INNOVATION",
      title: "We convert your idea into a reality.",
      paragraphs: [
        "Our commitment to innovation drives us to continuously explore new formulations, sustainable packaging, and cutting-edge beauty technologies. We work closely with dermatologists and beauty scientists to bring you products that deliver real results.",
      ],
      buttons: [
        { text: "SHOP NOW", link: "/shop" },
        { text: "LEARN MORE", link: "#" },
      ],
    },
  },
  {
    id: "cosmetics-about-services",
    type: "fashionServicesGrid",
    props: {
      subtitle: "WHAT WE OFFER",
      title: "Our Expertise",
      services: [
        {
          icon: "✨",
          title: "SKINCARE",
          description: "Premium skincare solutions for every skin type and concern.",
        },
        {
          icon: "💄",
          title: "COLOR COSMETICS",
          description: "Vibrant, long-lasting makeup for every occasion.",
        },
        {
          icon: "🌿",
          title: "CLEAN BEAUTY",
          description: "Natural and organic products free from harmful chemicals.",
        },
        {
          icon: "🧴",
          title: "PERSONAL CARE",
          description: "Complete body care and wellness essentials.",
        },
      ],
    },
  },
  {
    id: "cosmetics-about-team",
    type: "fashionTeamSection",
    props: {
      members: [
        {
          name: "SARAH JOHNSON",
          role: "CEO / FOUNDER",
          image: "",
          socials: ["facebook", "twitter", "instagram", "linkedin"],
        },
        {
          name: "EMMA DAVIS",
          role: "CREATIVE DIRECTOR",
          image: "",
          socials: ["facebook", "twitter", "instagram"],
        },
        {
          name: "OLIVIA MARTINEZ",
          role: "HEAD OF PRODUCT",
          image: "",
          socials: ["facebook", "instagram", "linkedin"],
        },
        {
          name: "SOPHIA CHEN",
          role: "LEAD DERMATOLOGIST",
          image: "",
          socials: ["twitter", "instagram", "linkedin"],
        },
      ],
    },
  },
  {
    id: "cosmetics-about-offices",
    type: "fashionOfficeLocations",
    props: {
      subtitle: "GET IN TOUCH WITH US",
      title: "Our Locations",
      description: "Visit us at any of our locations worldwide. Our beauty consultants are ready to help you find the perfect products.",
      offices: [
        {
          city: "NEW YORK",
          address: "113 New Avenue, Roadway,\n67 Brewer St, New York, USA",
          phone: "+1 234-567-8901",
          email: "newyork@store.com",
        },
        {
          city: "LONDON",
          address: "45 Oxford Street,\nMayfair, London, UK",
          phone: "+44 20 7946 0958",
          email: "london@store.com",
        },
        {
          city: "PARIS",
          address: "23 Rue de Rivoli,\n75001 Paris, France",
          phone: "+33 1 42 60 31 70",
          email: "paris@store.com",
        },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_CONTACT_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-contact-store",
    type: "fashionStoreVisit",
    props: {
      subtitle: "OUR STORES",
      title: "VISIT OUR NEW\nSTORE IN NEW YORK",
      address: "294 Bay Meadows Ave.\nBay Shore, NY 11706",
      buttonText: "See More About",
      buttonLink: "#",
    },
  },
  {
    id: "cosmetics-contact-faq",
    type: "fashionFaqAccordion",
    props: {
      subtitle: "INFORMATION QUESTIONS",
      title: "FREQUENTLY ASKED QUESTIONS",
      items: [
        {
          question: "Will I receive the same product that I see in the picture?",
          answer: "Yes, all product images on our site accurately represent the items you will receive. We use high-quality photography to showcase our cosmetics and skincare products. Minor variations in color may occur due to screen settings.",
        },
        {
          question: "Where can I view my sales receipt?",
          answer: "You can view your sales receipt by logging into your account and navigating to 'Order History'. Each order has a detailed receipt that you can view online or download as a PDF for your records.",
        },
        {
          question: "How can I return an item?",
          answer: "We accept returns within 30 days of delivery for unopened items in their original packaging. To initiate a return, go to 'My Orders', select the order, and click 'Request Return'. You'll receive a prepaid shipping label via email.",
        },
        {
          question: "Are your products cruelty-free?",
          answer: "Yes, we are committed to cruelty-free beauty. None of our products are tested on animals, and we work exclusively with brands that share our ethical values. Look for the cruelty-free badge on each product page.",
        },
        {
          question: "Where can I ship my order?",
          answer: "We currently ship to over 50 countries worldwide. Shipping costs and delivery times vary by destination. You can check available shipping options and estimated delivery dates at checkout before placing your order.",
        },
      ],
    },
  },
  {
    id: "cosmetics-contact-form",
    type: "fashionContactForm",
    props: {
      subtitle: "REACH OUT TO US",
      title: "CONTACT US FOR ANY QUESTIONS",
      fields: ["name", "email", "phone", "company", "message"],
    },
  },
  {
    id: "cosmetics-contact-newsletter",
    type: "cosmeticsNewsletter",
    props: {
      backgroundImage: "",
      title: "Stay Updated",
      description: "Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and beauty tips.",
      buttonText: "Subscribe",
    },
  },
];
