// ─── BUILDER BLOCK TYPES ─────────────────────────────────────

export type BlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "hero"
  | "spacer"
  | "divider"
  | "columns"
  | "productGrid"
  | "testimonial"
  | "testimonials"
  | "features"
  | "faq"
  | "contactForm"
  | "contactInfo"
  | "video"
  | "countdown"
  | "trustBadges"
  | "stats"
  | "newsletter"
  | "banner"
  | "imageText"
  | "gallery"
  | "team"
  | "brands";

export interface BuilderBlock {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
}

// ─── DEFAULT PROPS PER BLOCK TYPE ────────────────────────────

export const blockDefaults: Record<BlockType, () => Record<string, unknown>> = {
  heading: () => ({
    text: "Your Heading",
    level: "h2",
    align: "left",
    color: "#171717",
    fontSize: "2xl",
  }),
  text: () => ({
    text: "Enter your text here. Click to edit.",
    align: "left",
    color: "#525252",
    fontSize: "base",
  }),
  image: () => ({
    src: "",
    alt: "Image description",
    width: "full",
    rounded: "xl",
  }),
  button: () => ({
    text: "Click Me",
    href: "#",
    variant: "primary",
    align: "left",
    size: "md",
  }),
  hero: () => ({
    heading: "Welcome to Our Store",
    subheading: "Discover amazing products at great prices",
    buttonText: "Shop Now",
    buttonHref: "#",
    bgColor: "#1B2B4B",
    textColor: "#ffffff",
    align: "center",
  }),
  spacer: () => ({
    height: 40,
  }),
  divider: () => ({
    color: "#e5e5e5",
    thickness: 1,
    style: "solid",
  }),
  columns: () => ({
    columns: 2,
    gap: 4,
    children: [
      { id: crypto.randomUUID(), type: "text" as BlockType, props: { text: "Column 1 content", align: "left", color: "#525252", fontSize: "base" } },
      { id: crypto.randomUUID(), type: "text" as BlockType, props: { text: "Column 2 content", align: "left", color: "#525252", fontSize: "base" } },
    ],
  }),
  productGrid: () => ({
    title: "Featured Products",
    columns: 3,
    limit: 6,
    showPrice: true,
    category: "",
  }),
  testimonial: () => ({
    name: "Happy Customer",
    role: "Verified Buyer",
    text: "This product is amazing! Great quality and fast delivery.",
    rating: 5,
    avatar: "",
  }),
  features: () => ({
    title: "Why Choose Us",
    items: [
      { icon: "truck", title: "Fast Delivery", desc: "Get your order in 24-48 hours" },
      { icon: "shield", title: "Secure Payments", desc: "100% secure checkout" },
      { icon: "headphones", title: "24/7 Support", desc: "We're always here to help" },
    ],
  }),
  faq: () => ({
    title: "Frequently Asked Questions",
    items: [
      { question: "How do I place an order?", answer: "Simply browse our products, add to cart, and checkout." },
      { question: "What payment methods do you accept?", answer: "We accept card payments, bank transfers, and mobile money." },
      { question: "How long does delivery take?", answer: "Delivery typically takes 24-48 hours within Lagos." },
    ],
  }),
  contactForm: () => ({
    title: "Get in Touch",
    subtitle: "We'd love to hear from you",
    fields: ["name", "email", "message"],
    buttonText: "Send Message",
  }),
  video: () => ({
    url: "",
    title: "Watch Our Story",
    autoplay: false,
  }),
  countdown: () => ({
    title: "Flash Sale Ends In",
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    bgColor: "#1B2B4B",
    textColor: "#ffffff",
  }),
  trustBadges: () => ({
    items: [
      { icon: "shield", label: "Secure Checkout" },
      { icon: "truck", label: "Free Shipping" },
      { icon: "refresh", label: "Easy Returns" },
      { icon: "headphones", label: "24/7 Support" },
    ],
  }),
  testimonials: () => ({
    title: "What Our Customers Say",
    subtitle: "Real reviews from real customers",
    bgColor: "transparent",
    items: [
      { name: "Amara Okafor", text: "Absolutely love the quality! Fast delivery too.", role: "Verified Buyer", rating: 5 },
      { name: "Kwesi Mensah", text: "Great products and excellent customer service.", role: "Repeat Customer", rating: 5 },
      { name: "Fatima Ibrahim", text: "Best shopping experience I've had online.", role: "First-time Buyer", rating: 5 },
    ],
  }),
  stats: () => ({
    title: "Our Impact",
    bgColor: "brand",
    items: [
      { value: "5,000+", label: "Happy Customers", icon: "users" },
      { value: "10,000+", label: "Orders Delivered", icon: "package" },
      { value: "4.9", label: "Average Rating", icon: "star" },
      { value: "24/7", label: "Customer Support", icon: "headphones" },
    ],
  }),
  newsletter: () => ({
    title: "Stay Updated",
    subtitle: "Subscribe to get the latest offers and updates.",
    bgColor: "surface",
  }),
  banner: () => ({
    title: "Special Offer",
    subtitle: "Get 20% off your first order",
    buttonText: "Shop Now",
    buttonHref: "#",
    bgColor: "brand",
  }),
  imageText: () => ({
    title: "Our Story",
    text: "We started with a simple mission: to bring the best products to our customers.",
    image: "",
    imageAlt: "",
    reverse: false,
    badge: "About Us",
    buttonText: "Learn More",
    buttonHref: "#",
  }),
  contactInfo: () => ({
    title: "Contact Information",
    items: [
      { icon: "mail", title: "Email", value: "hello@store.com" },
      { icon: "phone", title: "Phone", value: "+234 800 000 0000" },
      { icon: "map-pin", title: "Address", value: "Lagos, Nigeria" },
      { icon: "message", title: "WhatsApp", value: "+234 800 000 0000" },
    ],
    hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
  }),
  gallery: () => ({
    title: "Gallery",
    images: [],
  }),
  team: () => ({
    title: "Meet Our Team",
    subtitle: "The people behind the brand",
    members: [
      { name: "John Doe", role: "Founder & CEO" },
      { name: "Jane Smith", role: "Head of Design" },
      { name: "Mike Johnson", role: "Operations Manager" },
    ],
  }),
  brands: () => ({
    title: "Trusted By",
    names: ["Brand A", "Brand B", "Brand C", "Brand D", "Brand E"],
  }),
};

// ─── BLOCK PALETTE ───────────────────────────────────────────

export interface PaletteItem {
  type: BlockType;
  label: string;
  icon: string;
  category: "basic" | "layout" | "commerce" | "social" | "marketing";
}

export const blockPalette: PaletteItem[] = [
  { type: "heading", label: "Heading", icon: "type", category: "basic" },
  { type: "text", label: "Text", icon: "align-left", category: "basic" },
  { type: "image", label: "Image", icon: "image", category: "basic" },
  { type: "button", label: "Button", icon: "mouse-pointer", category: "basic" },
  { type: "spacer", label: "Spacer", icon: "move-vertical", category: "basic" },
  { type: "divider", label: "Divider", icon: "minus", category: "basic" },
  { type: "video", label: "Video", icon: "play", category: "basic" },
  { type: "hero", label: "Hero Section", icon: "layout", category: "layout" },
  { type: "columns", label: "Columns", icon: "columns", category: "layout" },
  { type: "features", label: "Features Grid", icon: "grid", category: "layout" },
  { type: "imageText", label: "Image + Text", icon: "image", category: "layout" },
  { type: "gallery", label: "Gallery", icon: "image", category: "layout" },
  { type: "productGrid", label: "Product Grid", icon: "shopping-bag", category: "commerce" },
  { type: "countdown", label: "Countdown", icon: "clock", category: "commerce" },
  { type: "banner", label: "Promo Banner", icon: "zap", category: "commerce" },
  { type: "testimonial", label: "Testimonial", icon: "message-circle", category: "social" },
  { type: "testimonials", label: "Testimonials Grid", icon: "message-circle", category: "social" },
  { type: "faq", label: "FAQ", icon: "help-circle", category: "social" },
  { type: "contactForm", label: "Contact Form", icon: "mail", category: "social" },
  { type: "contactInfo", label: "Contact Info", icon: "map-pin", category: "social" },
  { type: "team", label: "Team", icon: "users", category: "social" },
  { type: "stats", label: "Stats Counter", icon: "trending-up", category: "marketing" },
  { type: "newsletter", label: "Newsletter", icon: "send", category: "marketing" },
  { type: "trustBadges", label: "Trust Badges", icon: "shield", category: "marketing" },
  { type: "brands", label: "Brand Logos", icon: "globe", category: "marketing" },
];
