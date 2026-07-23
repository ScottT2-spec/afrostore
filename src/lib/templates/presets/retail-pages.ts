import type { BuilderBlock } from "@/components/storefront/BlockRenderer";

/**
 * Retail Template – Page Block Presets
 * 
 * These replicate the hardcoded page content as editable BuilderBlocks
 * so store owners can customise them through the page builder.
 * Theme: Home & Garden Decor (WoodMart Retail demo style)
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT PAGE
   Matching home-garden-decor-02 demo exactly
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_ABOUT_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-about-hero",
    type: "hero",
    props: {
      heading: "Style Is What You Make It",
      subheading: "Bringing style, serenity, and natural beauty to every corner of your home and garden.",
      buttonText: "Shop Collection",
      buttonHref: "/shop",
      bgImage: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1920&h=900&fit=crop",
      bgStyle: "custom",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
      overlayColor: "#000000",
      overlayOpacity: 0.45,
      layout: "center",
      badge: "ABOUT US",
    },
  },
  {
    id: "retail-about-spacer-1",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-about-who-heading",
    type: "heading",
    props: {
      text: "Who We Are",
      level: "h2",
      fontSize: "3xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-about-who-text",
    type: "text",
    props: {
      text: "We are a passionate home and garden décor brand dedicated to creating spaces that feel alive, warm, and beautifully curated. With a love for nature, craftsmanship, and thoughtful design, we offer pieces that transform houses into homes.\n\nEvery item in our collection is chosen with intention. We partner with artisans and sustainable makers who share our belief that beautiful design should be accessible, ethical, and built to last.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-about-spacer-2",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-about-mission-heading",
    type: "heading",
    props: {
      text: "Our Mission",
      level: "h2",
      fontSize: "3xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-about-mission-text",
    type: "text",
    props: {
      text: "We started with a simple idea: your living space shapes how you feel. A well-chosen vase, a handwoven throw, a terracotta planter with character — these small details create an atmosphere of calm, warmth, and personality.\n\nToday we serve customers across Africa and beyond, delivering pieces that bridge traditional craftsmanship with modern living. We're not just selling decor — we're helping you build a home that breathes.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-about-spacer-3",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-about-founder-heading",
    type: "heading",
    props: {
      text: "Elizabeth Harris",
      level: "h2",
      fontSize: "2xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-about-founder-text",
    type: "text",
    props: {
      text: "Our founder is a passionate creator who believes that a beautiful home starts with meaningful details. With an eye for design and a love for craftsmanship, they built this brand to bring thoughtful garden décor to every home.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-about-founder-social",
    type: "socialLinks",
    props: {
      platforms: [
        { platform: "facebook", url: "https://facebook.com" },
        { platform: "twitter", url: "https://twitter.com" },
        { platform: "youtube", url: "https://youtube.com" },
      ],
      align: "center",
    },
  },
  {
    id: "retail-about-spacer-4",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-about-instagram-heading",
    type: "heading",
    props: {
      text: "Follow @antiques",
      level: "h3",
      fontSize: "xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-about-instagram-text",
    type: "text",
    props: {
      text: "Follow us on Instagram for daily décor inspiration and new arrivals.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-about-instagram-gallery",
    type: "gallery",
    props: {
      images: [
        { src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop", alt: "Instagram post 1" },
        { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=400&fit=crop", alt: "Instagram post 2" },
        { src: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=400&h=400&fit=crop", alt: "Instagram post 3" },
        { src: "https://images.unsplash.com/photo-1615870210515-3d5c4b0f2f8e?w=400&h=400&fit=crop", alt: "Instagram post 4" },
      ],
      columns: 4,
    },
  },
  {
    id: "retail-about-spacer-5",
    type: "spacer",
    props: { height: 80 },
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT PAGE
   Matching love-nature-02 demo exactly
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_CONTACT_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-contact-hero",
    type: "hero",
    props: {
      heading: "contact us",
      subheading: "",
      bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=900&fit=crop",
      bgStyle: "custom",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
      overlayColor: "#000000",
      overlayOpacity: 0.45,
      layout: "center",
    },
  },
  {
    id: "retail-contact-spacer-1",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-contact-info-heading",
    type: "heading",
    props: {
      text: "You can find us at",
      level: "h2",
      fontSize: "2xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-contact-spacer-2",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-contact-info",
    type: "features",
    props: {
      columns: 3,
      items: [
        {
          icon: "mail",
          title: "EMAIL",
          description: "hello@tyler.com",
        },
        {
          icon: "phone",
          title: "PHONE NUMBER",
          description: "202-555-0188",
        },
        {
          icon: "map-pin",
          title: "LOCATION",
          description: "2360 Hood Avenue, San Diego, CA, 92123",
        },
      ],
    },
  },
  {
    id: "retail-contact-spacer-3",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-contact-social",
    type: "features",
    props: {
      columns: 3,
      items: [
        {
          icon: "message",
          title: "Twitter",
          description: "",
        },
        {
          icon: "message",
          title: "Instagram",
          description: "",
        },
        {
          icon: "message",
          title: "Youtube",
          description: "",
        },
      ],
    },
  },
  {
    id: "retail-contact-spacer-4",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-contact-form-heading",
    type: "heading",
    props: {
      text: "Let's get in touch",
      level: "h2",
      fontSize: "2xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-contact-spacer-5",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-contact-form",
    type: "contactForm",
    props: {
      submitButtonText: "Send Message",
    },
  },
  {
    id: "retail-contact-spacer-6",
    type: "spacer",
    props: { height: 80 },
  },
  {
    id: "retail-contact-closing",
    type: "heading",
    props: {
      text: "We are optimists who love to work together",
      level: "h3",
      fontSize: "xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-contact-spacer-7",
    type: "spacer",
    props: { height: 80 },
  },
];

/* ═══════════════════════════════════════════════════════════════
   OUR STORY PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_OUR_STORY_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-story-hero",
    type: "hero",
    props: {
      heading: "From a Small Idea\nto Your Home",
      subheading: "A journey of passion, craftsmanship, and the belief that everyone deserves a beautiful living space.",
      buttonText: "Explore Collection",
      buttonHref: "/shop",
      bgImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=900&fit=crop",
      bgStyle: "custom",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
      overlayColor: "#000000",
      overlayOpacity: 0.45,
      layout: "center",
      badge: "OUR STORY",
    },
  },
  {
    id: "retail-story-spacer-1",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-story-intro-heading",
    type: "heading",
    props: {
      text: "How It All Started",
      level: "h2",
      fontSize: "3xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-story-intro-text",
    type: "text",
    props: {
      text: "In 2018, in a modest studio filled with ceramic samples and fabric swatches, our founder set out with a simple vision: to make thoughtfully designed home goods accessible to everyone.\n\nWhat began as a weekend market stall quickly grew into something bigger. Customers kept coming back — not just for the products, but for the stories behind them. The potter in Abeokuta. The weaver in Kigali. The woodworker in Cape Town. Every piece had a maker, and every maker had a story worth sharing.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-story-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-story-gallery",
    type: "gallery",
    props: {
      title: "Milestones",
      columns: 3,
      items: [
        {
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=1000&fit=crop",
          title: "2018 — The Beginning",
          description: "Started at weekend markets with a curated collection of handmade home goods from local artisans.",
        },
        {
          image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=1000&fit=crop",
          title: "2020 — Online Launch",
          description: "Brought our full collection online, reaching customers across the country and beyond.",
        },
        {
          image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=1000&fit=crop",
          title: "2023 — Growing Together",
          description: "Expanded to 30+ artisan partners and opened our first permanent showroom.",
        },
      ],
    },
  },
  {
    id: "retail-story-spacer-3",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-story-philosophy-heading",
    type: "heading",
    props: {
      text: "What Drives Us",
      level: "h2",
      fontSize: "3xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-story-philosophy-text",
    type: "text",
    props: {
      text: "We believe that true quality isn't about luxury price tags — it's about the care that goes into making something. It's the potter who fires each piece twice for durability. The weaver who selects every strand by hand. The commitment to materials that age beautifully rather than fall apart.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-story-spacer-4",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-story-values",
    type: "features",
    props: {
      columns: 2,
      items: [
        {
          icon: "heart",
          title: "Heritage Techniques",
          description: "We preserve traditional craftsmanship methods passed down through generations, combining them with modern design for pieces that are both timeless and contemporary.",
        },
        {
          icon: "globe",
          title: "Ethical Sourcing",
          description: "Every material we use comes from suppliers who share our commitment to fair labour, environmental sustainability, and community development.",
        },
      ],
    },
  },
  {
    id: "retail-story-spacer-5",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-story-newsletter",
    type: "newsletter",
    props: {
      title: "Be Part of Our Story",
      subtitle: "Join thousands of customers who have made our pieces part of their homes. Subscribe for exclusive updates and early access to new collections.",
      buttonText: "Subscribe",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   TERMS & CONDITIONS PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_TERMS_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-terms-heading",
    type: "heading",
    props: {
      text: "Terms & Conditions",
      level: "h1",
      fontSize: "4xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-terms-spacer-1",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-terms-intro",
    type: "text",
    props: {
      text: "Welcome to our store. By accessing or using our website, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase.",
      align: "left",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-spacer-2",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-general-h",
    type: "heading",
    props: { text: "1. General Terms", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-general",
    type: "text",
    props: {
      text: "By placing an order through our website, you warrant that you are at least 18 years old and are legally capable of entering into binding contracts. We reserve the right to refuse service to anyone for any reason at any time.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s3",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-products-h",
    type: "heading",
    props: { text: "2. Products & Pricing", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-products",
    type: "text",
    props: {
      text: "All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice. We make every effort to display accurate pricing, but errors may occur. In the event of a pricing error, we reserve the right to cancel the order.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s4",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-orders-h",
    type: "heading",
    props: { text: "3. Orders & Payment", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-orders",
    type: "text",
    props: {
      text: "When you place an order, you will receive an email confirmation. This does not mean your order has been accepted. We reserve the right to refuse or cancel any order. Payment must be made in full at the time of purchase through our accepted payment methods.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s5",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-shipping-h",
    type: "heading",
    props: { text: "4. Shipping & Delivery", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-shipping",
    type: "text",
    props: {
      text: "Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers, customs, or events beyond our control. Risk of loss passes to you upon delivery to the carrier.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s6",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-returns-h",
    type: "heading",
    props: { text: "5. Returns & Refunds", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-returns",
    type: "text",
    props: {
      text: "We accept returns within 30 days of delivery for items in their original, unused condition. Refunds will be processed to the original payment method within 5-10 business days. Shipping costs are non-refundable unless the return is due to our error.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s7",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-privacy-h",
    type: "heading",
    props: { text: "6. Privacy & Data", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-privacy",
    type: "text",
    props: {
      text: "We collect and process personal data in accordance with our Privacy Policy. By using our website, you consent to our data practices as described therein. We do not sell your personal information to third parties.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s8",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-cookies-h",
    type: "heading",
    props: { text: "7. Cookies", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-cookies",
    type: "text",
    props: {
      text: "We may use cookies and similar technologies to remember preferences, improve site performance, and better understand how visitors use the store.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s9",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-contact-h",
    type: "heading",
    props: { text: "8. Contact Information", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-contact",
    type: "text",
    props: {
      text: "If you have any questions about these Terms and Conditions, please contact us through our contact page or email us at support@store.com.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s10",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-changes-h",
    type: "heading",
    props: { text: "9. Changes to Terms", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-changes",
    type: "text",
    props: {
      text: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website following the posting of changes constitutes your acceptance of such changes.",
      fontSize: "base",
      color: "#555555",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   REVIEWS PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_REVIEWS_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-reviews-hero",
    type: "hero",
    props: {
      heading: "What Our Customers Say",
      subheading: "Real reviews from real people who've made our pieces part of their homes.",
      bgStyle: "gradient",
      layout: "center",
      badge: "REVIEWS",
    },
  },
  {
    id: "retail-reviews-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-reviews-testimonials",
    type: "testimonials",
    props: {
      title: "Customer Reviews",
      style: "marquee",
      items: [
        { name: "Amara O.", text: "The terracotta planters are absolutely gorgeous. They look even better in person and the quality is outstanding.", role: "Verified Buyer", rating: 5 },
        { name: "David K.", text: "Fast delivery and beautiful packaging. The rattan basket is now my favourite piece in the living room.", role: "Verified Buyer", rating: 5 },
        { name: "Fatima N.", text: "I've ordered three times now and every piece has exceeded my expectations. The ceramic vases are stunning.", role: "Repeat Customer", rating: 5 },
        { name: "James M.", text: "Great customer service too — they helped me choose the right pieces for my apartment. Highly recommend!", role: "Verified Buyer", rating: 4 },
        { name: "Zuri A.", text: "The macramé wall hanging transformed my bedroom. It's the perfect statement piece.", role: "Verified Buyer", rating: 5 },
        { name: "Chen W.", text: "Love the sustainability focus. Every product feels intentional and well-made. Will definitely be back.", role: "Verified Buyer", rating: 5 },
      ],
    },
  },
  {
    id: "retail-reviews-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-reviews-stats",
    type: "stats",
    props: {
      items: [
        { value: "4.8", label: "Average Rating" },
        { value: "2,500+", label: "Happy Customers" },
        { value: "98%", label: "Would Recommend" },
        { value: "500+", label: "5-Star Reviews" },
      ],
    },
  },
  {
    id: "retail-reviews-spacer-3",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-reviews-cta",
    type: "newsletter",
    props: {
      title: "Love Your Purchase?",
      subtitle: "Leave a review and help other customers find their perfect home pieces.",
      buttonText: "Write a Review",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   BESTSELLER PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_BESTSELLER_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-best-hero",
    type: "hero",
    props: {
      heading: "Bestsellers",
      subheading: "Our most-loved pieces — tried, tested, and adored by our customers.",
      bgStyle: "gradient",
      layout: "center",
      badge: "TOP PICKS",
    },
  },
  {
    id: "retail-best-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-best-products",
    type: "best_sellers",
    props: {
      title: "Customer Favourites",
      subtitle: "The pieces our customers keep coming back for.",
      columns: 4,
      limit: 8,
      showFeatured: false,
    },
  },
  {
    id: "retail-best-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-best-banner",
    type: "banner",
    props: {
      title: "New Arrivals Every Month",
      subtitle: "Subscribe to get notified when new pieces drop.",
      buttonText: "Shop All",
      buttonHref: "/shop",
      bgColor: "#f5f0eb",
      textColor: "#1a1a1a",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   NEW IN PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_NEW_IN_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-new-hero",
    type: "hero",
    props: {
      heading: "New Arrivals",
      subheading: "Fresh finds for your home — just landed in our collection.",
      bgStyle: "gradient",
      layout: "center",
      badge: "JUST IN",
    },
  },
  {
    id: "retail-new-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-new-products",
    type: "new_arrivals",
    props: {
      title: "Latest Additions",
      subtitle: "Freshly curated pieces added to our collection.",
      columns: 4,
      limit: 8,
    },
  },
  {
    id: "retail-new-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-new-newsletter",
    type: "newsletter",
    props: {
      title: "Never Miss a Drop",
      subtitle: "Be the first to know when new pieces arrive. Subscribe for early access.",
      buttonText: "Subscribe",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   ORDER TRACKING PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_ORDER_TRACKING_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-tracking-heading",
    type: "heading",
    props: {
      text: "Track Your Order",
      level: "h1",
      fontSize: "4xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-tracking-spacer-1",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-tracking-text",
    type: "text",
    props: {
      text: "Enter your order number below to check the status of your delivery. You can find your order number in the confirmation email we sent you.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-tracking-spacer-2",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-tracking-features",
    type: "features",
    props: {
      title: "Delivery Process",
      columns: 4,
      items: [
        { icon: "check", title: "Order Confirmed", description: "We've received your order and it's being prepared." },
        { icon: "package", title: "Being Packed", description: "Your items are being carefully packed for shipping." },
        { icon: "truck", title: "On Its Way", description: "Your order is with our delivery partner and en route." },
        { icon: "heart", title: "Delivered", description: "Your order has arrived. Enjoy your new pieces!" },
      ],
    },
  },
  {
    id: "retail-tracking-spacer-3",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-tracking-faq",
    type: "faq",
    props: {
      title: "Shipping FAQ",
      items: [
        { question: "How long does delivery take?", answer: "Standard delivery takes 3-5 business days. Express delivery is 1-2 business days. International orders take 7-14 business days." },
        { question: "Can I change my delivery address?", answer: "You can change your delivery address within 2 hours of placing your order. Contact our support team for assistance." },
        { question: "What if my order is damaged?", answer: "If your order arrives damaged, please contact us within 48 hours with photos. We'll arrange a replacement or refund immediately." },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   MY ACCOUNT PAGE (placeholder blocks — actual logic is dynamic)
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_MY_ACCOUNT_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-account-heading",
    type: "heading",
    props: {
      text: "My Account",
      level: "h1",
      fontSize: "4xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-account-spacer-1",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-account-text",
    type: "text",
    props: {
      text: "Manage your account, view orders, and update your details.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-account-spacer-2",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-account-features",
    type: "features",
    props: {
      columns: 3,
      items: [
        { icon: "package", title: "My Orders", description: "View and track your recent orders." },
        { icon: "heart", title: "Wishlist", description: "Browse items you've saved for later." },
        { icon: "map-pin", title: "Addresses", description: "Manage your delivery addresses." },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   SKINCARE / CATEGORY LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_SKINCARE_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-skincare-hero",
    type: "hero",
    props: {
      heading: "Home Care Essentials",
      subheading: "Natural, effective products for a clean and fresh home.",
      bgStyle: "light",
      layout: "center",
      badge: "COLLECTION",
    },
  },
  {
    id: "retail-skincare-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-skincare-products",
    type: "featured_products",
    props: {
      title: "Featured in This Collection",
      columns: 4,
      limit: 8,
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   FRAGRANCES / CATEGORY LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_FRAGRANCES_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-fragrances-hero",
    type: "hero",
    props: {
      heading: "Home Fragrances",
      subheading: "Candles, diffusers, and scented accents to set the mood in every room.",
      bgStyle: "light",
      layout: "center",
      badge: "COLLECTION",
    },
  },
  {
    id: "retail-fragrances-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-fragrances-products",
    type: "featured_products",
    props: {
      title: "Explore Our Fragrances",
      columns: 4,
      limit: 8,
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   JOURNAL / BLOG LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_JOURNAL_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-journal-hero",
    type: "hero",
    props: {
      heading: "Journal",
      subheading: "Tips, stories, and inspiration for making your house a home.",
      bgStyle: "light",
      layout: "center",
      badge: "OUR BLOG",
    },
  },
  {
    id: "retail-journal-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-journal-text",
    type: "text",
    props: {
      text: "From styling guides to artisan spotlights, our journal is your source for home inspiration. Explore our latest posts below.",
      align: "center",
      fontSize: "lg",
      color: "#555555",
    },
  },
  {
    id: "retail-journal-spacer-2",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-journal-newsletter",
    type: "newsletter",
    props: {
      title: "Get Inspired Weekly",
      subtitle: "Subscribe for styling tips, new arrivals, and stories from our artisan partners.",
      buttonText: "Subscribe",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   PROJECTS PAGE
   Matching sierra-nature-02 demo exactly
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_PROJECTS_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-projects-hero",
    type: "hero",
    props: {
      heading: "Projects",
      subheading: "Explore our latest home and garden transformations",
      bgStyle: "light",
      layout: "center",
      badge: "OUR WORK",
    },
  },
  {
    id: "retail-projects-spacer-1",
    type: "spacer",
    props: { height: 80 },
  },
  {
    id: "retail-projects-grid",
    type: "projects",
    props: {
      title: "",
      columns: 2,
      items: [
        {
          id: "project-1",
          title: "Look Deep Into Nature",
          description: "Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Proin gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis.",
          image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop",
          link: "/blog/project-look-deep-into-nature",
          linkText: "Continue Reading",
        },
        {
          id: "project-2",
          title: "Just Living Is Not Enough",
          description: "Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Proin gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis.",
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
          link: "/blog/project-just-living-is-not-enough",
          linkText: "Continue Reading",
        },
        {
          id: "project-3",
          title: "Adopt the pace of Nature",
          description: "Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Proin gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis.",
          image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop",
          link: "/blog/project-adopt-the-pace-of-nature",
          linkText: "Continue Reading",
        },
        {
          id: "project-4",
          title: "Go Along With the Nature",
          description: "Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Proin gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis.",
          image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop",
          link: "/blog/project-go-along-with-nature",
          linkText: "Continue Reading",
        },
      ],
    },
  },
  {
    id: "retail-projects-spacer-2",
    type: "spacer",
    props: { height: 80 },
  },
  {
    id: "retail-projects-cta",
    type: "newsletter",
    props: {
      title: "Get started with lorem ipsum dolor sit amet consectetur.",
      subtitle: "",
      buttonText: "Learn More",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   PROJECT DETAIL PAGES
   Individual project detail pages with rich content
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_PROJECT_DETAIL_BLOCKS: Record<string, BuilderBlock[]> = {
  "project-look-deep-into-nature": [
    {
      id: "project-1-detail-hero",
      type: "hero",
      props: {
        heading: "Look Deep Into Nature",
        subheading: "A journey through untouched landscapes",
        bgImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=900&fit=crop",
        bgStyle: "custom",
        bgColor: "#2c2c2c",
        textColor: "#ffffff",
        overlayColor: "#000000",
        overlayOpacity: 0.45,
        layout: "center",
      },
    },
    {
      id: "project-1-detail-spacer-1",
      type: "spacer",
      props: { height: 60 },
    },
    {
      id: "project-1-detail-heading",
      type: "heading",
      props: {
        text: "Project Overview",
        level: "h2",
        fontSize: "2xl",
        align: "center",
        color: "#1a1a1a",
      },
    },
    {
      id: "project-1-detail-spacer-2",
      type: "spacer",
      props: { height: 40 },
    },
    {
      id: "project-1-detail-content",
      type: "text",
      props: {
        text: "This project explores the untouched beauty of natural landscapes, capturing moments where light and shadow dance across mountains, forests, and rivers. Our team spent weeks documenting these pristine environments, from misty mornings at dawn to golden sunsets that paint the sky in vibrant hues.\n\nThrough careful observation and artistic vision, we've created a collection that celebrates the raw, unfiltered essence of nature. Each image tells a story of resilience, growth, and the timeless beauty that surrounds us.",
        align: "center",
        fontSize: "base",
        color: "#555555",
      },
    },
    {
      id: "project-1-detail-spacer-3",
      type: "spacer",
      props: { height: 60 },
    },
    {
      id: "project-1-detail-gallery",
      type: "gallery",
      props: {
        images: [
          { src: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop", alt: "Nature landscape 1" },
          { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop", alt: "Nature landscape 2" },
          { src: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop", alt: "Nature landscape 3" },
          { src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop", alt: "Nature landscape 4" },
        ],
        columns: 2,
      },
    },
    {
      id: "project-1-detail-spacer-4",
      type: "spacer",
      props: { height: 80 },
    },
  ],
  "project-just-living-is-not-enough": [
    {
      id: "project-2-detail-hero",
      type: "hero",
      props: {
        heading: "Just Living Is Not Enough",
        subheading: "Finding meaning in everyday moments",
        bgImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=900&fit=crop",
        bgStyle: "custom",
        bgColor: "#2c2c2c",
        textColor: "#ffffff",
        overlayColor: "#000000",
        overlayOpacity: 0.45,
        layout: "center",
      },
    },
    {
      id: "project-2-detail-spacer-1",
      type: "spacer",
      props: { height: 60 },
    },
    {
      id: "project-2-detail-heading",
      type: "heading",
      props: {
        text: "Project Overview",
        level: "h2",
        fontSize: "2xl",
        align: "center",
        color: "#1a1a1a",
      },
    },
    {
      id: "project-2-detail-spacer-2",
      type: "spacer",
      props: { height: 40 },
    },
    {
      id: "project-2-detail-content",
      type: "text",
      props: {
        text: "Life is more than just existing—it's about finding purpose, connection, and joy in the everyday. This project explores the art of mindful living, from the simple pleasure of a morning coffee to the profound beauty of human connection.\n\nWe've documented stories of people who have transformed their lives by embracing intentionality, creativity, and gratitude. Their journeys remind us that fulfillment isn't found in grand gestures, but in the conscious choices we make each day.",
        align: "center",
        fontSize: "base",
        color: "#555555",
      },
    },
    {
      id: "project-2-detail-spacer-3",
      type: "spacer",
      props: { height: 60 },
    },
    {
      id: "project-2-detail-gallery",
      type: "gallery",
      props: {
        images: [
          { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop", alt: "Lifestyle 1" },
          { src: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop", alt: "Lifestyle 2" },
          { src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop", alt: "Lifestyle 3" },
          { src: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop", alt: "Lifestyle 4" },
        ],
        columns: 2,
      },
    },
    {
      id: "project-2-detail-spacer-4",
      type: "spacer",
      props: { height: 80 },
    },
  ],
  "project-adopt-the-pace-of-nature": [
    {
      id: "project-3-detail-hero",
      type: "hero",
      props: {
        heading: "Adopt the pace of Nature",
        subheading: "Finding harmony in natural rhythms",
        bgImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920&h=900&fit=crop",
        bgStyle: "custom",
        bgColor: "#2c2c2c",
        textColor: "#ffffff",
        overlayColor: "#000000",
        overlayOpacity: 0.45,
        layout: "center",
      },
    },
    {
      id: "project-3-detail-spacer-1",
      type: "spacer",
      props: { height: 60 },
    },
    {
      id: "project-3-detail-heading",
      type: "heading",
      props: {
        text: "Project Overview",
        level: "h2",
        fontSize: "2xl",
        align: "center",
        color: "#1a1a1a",
      },
    },
    {
      id: "project-3-detail-spacer-2",
      type: "spacer",
      props: { height: 40 },
    },
    {
      id: "project-3-detail-content",
      type: "text",
      props: {
        text: "In a world that moves faster every day, nature reminds us to slow down and find our own rhythm. This project explores the wisdom of natural cycles—the changing seasons, the ebb and flow of tides, the gentle unfolding of flowers.\n\nBy observing and learning from these natural patterns, we've discovered ways to bring balance and tranquility into modern life. From sustainable design principles to mindfulness practices inspired by forest bathing, this collection offers practical insights for living in harmony with the natural world.",
        align: "center",
        fontSize: "base",
        color: "#555555",
      },
    },
    {
      id: "project-3-detail-spacer-3",
      type: "spacer",
      props: { height: 60 },
    },
    {
      id: "project-3-detail-gallery",
      type: "gallery",
      props: {
        images: [
          { src: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop", alt: "Nature rhythm 1" },
          { src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop", alt: "Nature rhythm 2" },
          { src: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop", alt: "Nature rhythm 3" },
          { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop", alt: "Nature rhythm 4" },
        ],
        columns: 2,
      },
    },
    {
      id: "project-3-detail-spacer-4",
      type: "spacer",
      props: { height: 80 },
    },
  ],
  "project-go-along-with-nature": [
    {
      id: "project-4-detail-hero",
      type: "hero",
      props: {
        heading: "Go Along With the Nature",
        subheading: "Embracing sustainable living",
        bgImage: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1920&h=900&fit=crop",
        bgStyle: "custom",
        bgColor: "#2c2c2c",
        textColor: "#ffffff",
        overlayColor: "#000000",
        overlayOpacity: 0.45,
        layout: "center",
      },
    },
    {
      id: "project-4-detail-spacer-1",
      type: "spacer",
      props: { height: 60 },
    },
    {
      id: "project-4-detail-heading",
      type: "heading",
      props: {
        text: "Project Overview",
        level: "h2",
        fontSize: "2xl",
        align: "center",
        color: "#1a1a1a",
      },
    },
    {
      id: "project-4-detail-spacer-2",
      type: "spacer",
      props: { height: 40 },
    },
    {
      id: "project-4-detail-content",
      type: "text",
      props: {
        text: "Sustainable living isn't just about reducing our footprint—it's about creating a future where humans and nature thrive together. This project showcases innovative approaches to eco-friendly living, from zero-waste homes to community gardens that transform urban spaces.\n\nWe've gathered stories of individuals and communities who are leading the way in environmental stewardship. Their experiences demonstrate that small, consistent actions can create meaningful change, and that living sustainably can be both practical and beautiful.",
        align: "center",
        fontSize: "base",
        color: "#555555",
      },
    },
    {
      id: "project-4-detail-spacer-3",
      type: "spacer",
      props: { height: 60 },
    },
    {
      id: "project-4-detail-gallery",
      type: "gallery",
      props: {
        images: [
          { src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop", alt: "Sustainable living 1" },
          { src: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop", alt: "Sustainable living 2" },
          { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop", alt: "Sustainable living 3" },
          { src: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop", alt: "Sustainable living 4" },
        ],
        columns: 2,
      },
    },
    {
      id: "project-4-detail-spacer-4",
      type: "spacer",
      props: { height: 80 },
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   ALL RETAIL PAGE PRESETS (convenience export)
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_PAGE_PRESETS: Record<string, BuilderBlock[]> = {
  about: RETAIL_ABOUT_BLOCKS,
  contact: RETAIL_CONTACT_BLOCKS,
  projects: RETAIL_PROJECTS_BLOCKS,
  "our-story": RETAIL_OUR_STORY_BLOCKS,
  terms: RETAIL_TERMS_BLOCKS,
  reviews: RETAIL_REVIEWS_BLOCKS,
  bestseller: RETAIL_BESTSELLER_BLOCKS,
  "new-in": RETAIL_NEW_IN_BLOCKS,
  "order-tracking": RETAIL_ORDER_TRACKING_BLOCKS,
  "my-account": RETAIL_MY_ACCOUNT_BLOCKS,
  skincare: RETAIL_SKINCARE_BLOCKS,
  fragrances: RETAIL_FRAGRANCES_BLOCKS,
  journal: RETAIL_JOURNAL_BLOCKS,
};
