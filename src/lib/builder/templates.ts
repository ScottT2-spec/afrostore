import { BuilderBlock, blockDefaults } from "./types";

export interface BlockTemplate {
  name: string;
  description: string;
  icon: string;
  blocks: BuilderBlock[];
}

function uid() { return crypto.randomUUID(); }

export const blockTemplates: BlockTemplate[] = [
  {
    name: "Premium Landing",
    description: "Hero → stats → products → testimonials → features → newsletter",
    icon: "layout",
    blocks: [
      { id: uid(), type: "hero", props: { ...blockDefaults.hero(), badge: "✨ Welcome", bgStyle: "gradient", heading: "Discover Something Amazing", subheading: "Premium quality products crafted for you. Fast delivery, secure payments, and exceptional service.", buttonText: "Shop Now", secondaryButtonText: "Learn More", secondaryButtonHref: "#about" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "stats", props: { ...blockDefaults.stats(), title: "" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "productGrid", props: { ...blockDefaults.productGrid(), title: "Featured Products", subtitle: "Handpicked just for you", columns: 3, limit: 6 } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "testimonials", props: blockDefaults.testimonials() },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "features", props: { ...blockDefaults.features(), bgColor: "surface" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "newsletter", props: { ...blockDefaults.newsletter(), bgColor: "brand" } },
      { id: uid(), type: "spacer", props: { height: 32 } },
      { id: uid(), type: "trustBadges", props: blockDefaults.trustBadges() },
    ],
  },
  {
    name: "Product Showcase",
    description: "Hero → product grid → banner → trust badges",
    icon: "shopping-bag",
    blocks: [
      { id: uid(), type: "hero", props: { ...blockDefaults.hero(), bgStyle: "dark", heading: "Our Best Sellers", subheading: "Handpicked products at amazing prices", buttonText: "Browse All" } },
      { id: uid(), type: "spacer", props: { height: 40 } },
      { id: uid(), type: "productGrid", props: { ...blockDefaults.productGrid(), title: "Featured Products", columns: 4, limit: 8 } },
      { id: uid(), type: "spacer", props: { height: 40 } },
      { id: uid(), type: "banner", props: { title: "🔥 Limited Time Offer", subtitle: "Get free delivery on orders above ₦10,000", buttonText: "Shop Now", bgColor: "accent" } },
      { id: uid(), type: "spacer", props: { height: 32 } },
      { id: uid(), type: "trustBadges", props: blockDefaults.trustBadges() },
    ],
  },
  {
    name: "About Page",
    description: "Hero → story → team → stats → testimonials → CTA",
    icon: "user",
    blocks: [
      { id: uid(), type: "hero", props: { heading: "Our Story", subheading: "From a simple idea to a brand you can trust", bgStyle: "gradient", buttonText: "" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "imageText", props: { ...blockDefaults.imageText(), badge: "Our Mission", title: "Built With Purpose", text: "We believe in quality craftsmanship, fair pricing, and building lasting relationships with our customers. Every product we offer is carefully selected to meet our high standards.", buttonText: "View Products", buttonHref: "#" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "imageText", props: { ...blockDefaults.imageText(), reverse: true, badge: "Our Values", title: "What We Stand For", text: "Authenticity, quality, and customer satisfaction are at the heart of everything we do. We're not just a store — we're a community.", buttonText: "" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "team", props: blockDefaults.team() },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "stats", props: blockDefaults.stats() },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "testimonials", props: { ...blockDefaults.testimonials(), bgColor: "surface" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "banner", props: { title: "Ready to Experience the Difference?", subtitle: "Join thousands of happy customers", buttonText: "Start Shopping", bgColor: "brand" } },
    ],
  },
  {
    name: "FAQ Page",
    description: "Header → FAQ accordion → contact info → CTA",
    icon: "help-circle",
    blocks: [
      { id: uid(), type: "hero", props: { heading: "Frequently Asked Questions", subheading: "Got questions? We've got answers.", bgStyle: "light", buttonText: "" } },
      { id: uid(), type: "spacer", props: { height: 40 } },
      { id: uid(), type: "faq", props: { ...blockDefaults.faq(), title: "", subtitle: "" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "divider", props: { style: "dots" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "contactInfo", props: blockDefaults.contactInfo() },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "banner", props: { title: "Still Have Questions?", subtitle: "Our team is ready to help", buttonText: "Contact Us", buttonHref: "/contact", bgColor: "dark" } },
    ],
  },
  {
    name: "Contact Page",
    description: "Header → contact info → form → newsletter",
    icon: "mail",
    blocks: [
      { id: uid(), type: "hero", props: { heading: "Get in Touch", subheading: "We'd love to hear from you. Reach out anytime.", bgStyle: "light", buttonText: "" } },
      { id: uid(), type: "spacer", props: { height: 40 } },
      { id: uid(), type: "contactInfo", props: blockDefaults.contactInfo() },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "contactForm", props: { title: "Send Us a Message", subtitle: "We'll respond within 24 hours", buttonText: "Send Message" } },
      { id: uid(), type: "spacer", props: { height: 48 } },
      { id: uid(), type: "newsletter", props: { ...blockDefaults.newsletter(), title: "Stay in the Loop", subtitle: "Get updates on new products and exclusive offers." } },
    ],
  },
  {
    name: "Flash Sale",
    description: "Countdown → products → urgency CTA",
    icon: "clock",
    blocks: [
      { id: uid(), type: "countdown", props: { ...blockDefaults.countdown(), title: "🔥 Flash Sale Ends In", buttonText: "Shop the Sale" } },
      { id: uid(), type: "spacer", props: { height: 40 } },
      { id: uid(), type: "productGrid", props: { ...blockDefaults.productGrid(), title: "Sale Items", subtitle: "Grab them before they're gone!", columns: 4, limit: 8 } },
      { id: uid(), type: "spacer", props: { height: 32 } },
      { id: uid(), type: "banner", props: { title: "Don't Miss Out!", subtitle: "Free delivery on all sale items", buttonText: "View All Deals", bgColor: "accent" } },
      { id: uid(), type: "spacer", props: { height: 24 } },
      { id: uid(), type: "trustBadges", props: blockDefaults.trustBadges() },
    ],
  },
];
