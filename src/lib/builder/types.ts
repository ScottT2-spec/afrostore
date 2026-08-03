// Compatibility layer for old builder types
// This provides backward compatibility for existing code that still uses the old builder system

export type BlockType = string;

export interface BuilderBlock {
  id: string;
  type: BlockType;
  order?: number;
  props?: Record<string, any>;
  content?: Record<string, any>;
  styles?: Record<string, any>;
  styleOverrides?: Record<string, any>;
  elements?: BuilderBlock[];
  visible?: boolean;
}

export const blockDefaults: Record<BlockType, Partial<BuilderBlock>> = {
  hero: {
    type: "hero",
    content: {
      title: "Welcome to Our Store",
      subtitle: "Discover amazing products",
      buttonText: "Shop Now",
      buttonLink: "/products",
    },
  },
  features: {
    type: "features",
    content: {
      title: "Why Choose Us",
      features: [
        { title: "Quality", description: "Premium products" },
        { title: "Fast Delivery", description: "Quick shipping" },
        { title: "Support", description: "24/7 assistance" },
      ],
    },
  },
  products: {
    type: "products",
    content: {
      title: "Featured Products",
      limit: 8,
    },
  },
  testimonials: {
    type: "testimonials",
    content: {
      title: "What Our Customers Say",
    },
  },
  cta: {
    type: "cta",
    content: {
      title: "Ready to Get Started?",
      buttonText: "Shop Now",
      buttonLink: "/products",
    },
  },
  about: {
    type: "about",
    content: {
      title: "About Us",
      description: "Learn more about our story",
    },
  },
  contact: {
    type: "contact",
    content: {
      title: "Contact Us",
    },
  },
  gallery: {
    type: "gallery",
    content: {
      title: "Gallery",
    },
  },
  video: {
    type: "video",
    content: {
      title: "Video",
    },
  },
  text: {
    type: "text",
    content: {
      content: "Your text here",
    },
  },
  image: {
    type: "image",
    content: {
      src: "",
      alt: "Image",
    },
  },
  divider: {
    type: "divider",
  },
  spacer: {
    type: "spacer",
    content: {
      height: 40,
    },
  },
  social: {
    type: "social",
    content: {
      title: "Follow Us",
    },
  },
  map: {
    type: "map",
    content: {
      title: "Find Us",
    },
  },
  form: {
    type: "form",
    content: {
      title: "Contact Form",
    },
  },
  html: {
    type: "html",
    content: {
      code: "",
    },
  },
  custom: {
    type: "custom",
  },
};
