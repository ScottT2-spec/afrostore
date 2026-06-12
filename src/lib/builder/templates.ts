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
    name: "Landing Page",
    description: "Hero + features + testimonial + CTA",
    icon: "layout",
    blocks: [
      { id: uid(), type: "hero", props: blockDefaults.hero() },
      { id: uid(), type: "features", props: blockDefaults.features() },
      { id: uid(), type: "spacer", props: { height: 32 } },
      { id: uid(), type: "testimonial", props: blockDefaults.testimonial() },
      { id: uid(), type: "spacer", props: { height: 32 } },
      { id: uid(), type: "heading", props: { text: "Ready to Get Started?", level: "h2", align: "center", color: "#171717", fontSize: "3xl" } },
      { id: uid(), type: "button", props: { text: "Shop Now", href: "#", variant: "primary", align: "center", size: "lg" } },
    ],
  },
  {
    name: "Product Showcase",
    description: "Hero + product grid + trust badges",
    icon: "shopping-bag",
    blocks: [
      { id: uid(), type: "hero", props: { ...blockDefaults.hero(), heading: "Our Best Sellers", subheading: "Handpicked products just for you" } },
      { id: uid(), type: "spacer", props: { height: 24 } },
      { id: uid(), type: "productGrid", props: { ...blockDefaults.productGrid(), title: "Featured Products", columns: 3, limit: 6 } },
      { id: uid(), type: "spacer", props: { height: 24 } },
      { id: uid(), type: "trustBadges", props: blockDefaults.trustBadges() },
    ],
  },
  {
    name: "About Page",
    description: "Heading + text + features + contact",
    icon: "user",
    blocks: [
      { id: uid(), type: "heading", props: { text: "About Us", level: "h1", align: "center", color: "#171717", fontSize: "4xl" } },
      { id: uid(), type: "spacer", props: { height: 16 } },
      { id: uid(), type: "text", props: { text: "We are a passionate team dedicated to bringing you the best products from across Africa. Our mission is to connect local artisans and businesses with customers who appreciate quality, authenticity, and craftsmanship.", align: "center", color: "#525252", fontSize: "base" } },
      { id: uid(), type: "spacer", props: { height: 32 } },
      { id: uid(), type: "features", props: { ...blockDefaults.features(), title: "Our Values" } },
      { id: uid(), type: "spacer", props: { height: 32 } },
      { id: uid(), type: "contactForm", props: blockDefaults.contactForm() },
    ],
  },
  {
    name: "Flash Sale",
    description: "Countdown + products + urgency CTA",
    icon: "clock",
    blocks: [
      { id: uid(), type: "countdown", props: blockDefaults.countdown() },
      { id: uid(), type: "spacer", props: { height: 24 } },
      { id: uid(), type: "heading", props: { text: "🔥 Don't Miss Out!", level: "h2", align: "center", color: "#171717", fontSize: "3xl" } },
      { id: uid(), type: "productGrid", props: { ...blockDefaults.productGrid(), title: "Sale Items", columns: 4, limit: 8 } },
      { id: uid(), type: "spacer", props: { height: 24 } },
      { id: uid(), type: "button", props: { text: "View All Deals", href: "#", variant: "accent", align: "center", size: "lg" } },
    ],
  },
  {
    name: "FAQ Page",
    description: "Heading + FAQ accordion + contact",
    icon: "help-circle",
    blocks: [
      { id: uid(), type: "heading", props: { text: "Frequently Asked Questions", level: "h1", align: "center", color: "#171717", fontSize: "3xl" } },
      { id: uid(), type: "spacer", props: { height: 16 } },
      { id: uid(), type: "text", props: { text: "Find answers to the most common questions about our products and services.", align: "center", color: "#525252", fontSize: "base" } },
      { id: uid(), type: "spacer", props: { height: 24 } },
      { id: uid(), type: "faq", props: blockDefaults.faq() },
      { id: uid(), type: "divider", props: blockDefaults.divider() },
      { id: uid(), type: "heading", props: { text: "Still have questions?", level: "h3", align: "center", color: "#171717", fontSize: "2xl" } },
      { id: uid(), type: "contactForm", props: { ...blockDefaults.contactForm(), title: "Contact Us", subtitle: "We'll get back to you within 24 hours" } },
    ],
  },
];
