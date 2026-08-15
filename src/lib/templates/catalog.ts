// Template catalog — maps extracted-templates/ HTML files to browsable templates

export type SiteType = 'ECOMMERCE' | 'WEBSITE' | 'LANDING_PAGE';

export interface TemplateMeta {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  previewImage: string; // og:image or fallback
  file: string; // relative path under extracted-templates/
  industries: string[]; // matching INDUSTRIES ids from new-site page
  siteType: SiteType; // which site type this template belongs to
}

export const TEMPLATE_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & Clothing' },
  { id: 'electronics', label: 'Electronics & Gadgets' },
  { id: 'beauty', label: 'Beauty & Skincare' },
  { id: 'food', label: 'Food & Restaurant' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'children', label: 'Children & Toys' },

  { id: 'bakery', label: 'Bakery & Sweets' },

  { id: 'interior-design', label: 'Interior Design' },
  { id: 'food-grocery', label: 'Grocery' },
  { id: 'landing-simple', label: 'Simple Landing Page' },
  { id: 'landing-health', label: 'Health & Medical' },
] as const;

export const TEMPLATES: TemplateMeta[] = [
  // Fashion
  { slug: 'fashion', name: 'Fashion', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Modern fashion store with bold imagery and clean product layouts', previewImage: '/prokip-logo.png', file: 'fashion/fashion.html', siteType: 'ECOMMERCE', industries: ['fashion'] },
  { slug: 'fashion-colored', name: 'Fashion Color', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Vibrant colorful fashion store with eye-catching design', previewImage: '/prokip-logo.png', file: 'fashion/fashion-colored.html', siteType: 'ECOMMERCE', industries: ['fashion'] },
  { slug: 'handmade-bags', name: 'Handmade Bags', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Artisan handmade bags and leather goods store', previewImage: '/prokip-logo.png', file: 'fashion/handmade-bags.html', siteType: 'ECOMMERCE', industries: ['fashion', 'art'] },
  { slug: 't-shirts-prints', name: 'T-Shirts & Prints', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Custom t-shirts and print-on-demand store', previewImage: '/prokip-logo.png', file: 'fashion/t-shirts-prints.html', siteType: 'ECOMMERCE', industries: ['fashion'] },

  // Electronics
  { slug: 'electronics', name: 'Electronics', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Tech and electronics store with detailed product specs', previewImage: '/prokip-logo.png', file: 'electronics/electronics.html', siteType: 'ECOMMERCE', industries: ['electronics'] },
  { slug: 'electronics-accessories', name: 'Tech Accessories', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Phone cases, cables, and tech accessories store', previewImage: '/prokip-logo.png', file: 'electronics/accessories.html', siteType: 'ECOMMERCE', industries: ['electronics'] },
  { slug: 'hardware', name: 'Hardware', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Computer hardware and components store', previewImage: '/prokip-logo.png', file: 'electronics/hardware.html', siteType: 'ECOMMERCE', industries: ['electronics'] },
  { slug: 'tools', name: 'Tools', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Power tools and equipment store', previewImage: '/prokip-logo.png', file: 'electronics/tools.html', siteType: 'ECOMMERCE', industries: ['electronics', 'construction'] },

  // Beauty
  { slug: 'cosmetics', name: 'Cosmetics', category: 'beauty', categoryLabel: 'Beauty & Skincare', description: 'Premium cosmetics and skincare product store', previewImage: '/prokip-logo.png', file: 'beauty/cosmetics.html', siteType: 'ECOMMERCE', industries: ['beauty'] },
  { slug: 'makeup', name: 'Makeup', category: 'beauty', categoryLabel: 'Beauty & Skincare', description: 'Makeup and beauty products with glamorous design', previewImage: '/prokip-logo.png', file: 'beauty/makeup.html', siteType: 'ECOMMERCE', industries: ['beauty'] },
  { slug: 'perfumes', name: 'Perfumes', category: 'beauty', categoryLabel: 'Beauty & Skincare', description: 'Luxury perfumes and fragrances store', previewImage: '/prokip-logo.png', file: 'beauty/perfumes.html', siteType: 'ECOMMERCE', industries: ['beauty'] },



  // Children
  { slug: 'kids', name: 'Kids', category: 'children', categoryLabel: 'Children & Toys', description: 'Children\'s clothing and accessories store', previewImage: '/prokip-logo.png', file: 'children/kids.html', siteType: 'ECOMMERCE', industries: ['fashion'] },
  { slug: 'toys', name: 'Toys', category: 'children', categoryLabel: 'Children & Toys', description: 'Toy store with playful and colorful design', previewImage: '/prokip-logo.png', file: 'children/toys.html', siteType: 'ECOMMERCE', industries: ['other'] },

  // Bakery
  { slug: 'sweets-bakery', name: 'Bakery', category: 'bakery', categoryLabel: 'Bakery & Sweets', description: 'Bakery and sweets store with warm, inviting design', previewImage: '/prokip-logo.png', file: 'bakery/sweets-bakery.html', siteType: 'ECOMMERCE', industries: ['food'] },



  // Interior Design
  { slug: 'decor', name: 'Decor', category: 'interior-design', categoryLabel: 'Interior Design', description: 'Home decor and interior design store', previewImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&auto=format&fit=crop', file: 'interior-design/decor.html', siteType: 'ECOMMERCE', industries: ['other'] },
  { slug: 'retail', name: 'Retail', category: 'interior-design', categoryLabel: 'Interior Design', description: 'Retail furniture and home goods store', previewImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80&auto=format&fit=crop', file: 'interior-design/retail.html', siteType: 'ECOMMERCE', industries: ['other'] },

  // Food & Grocery
  { slug: 'grocery', name: 'Grocery', category: 'food-grocery', categoryLabel: 'Grocery', description: 'Online grocery store with fresh produce', previewImage: '/prokip-logo.png', file: 'food-grocery/grocery.html', siteType: 'ECOMMERCE', industries: ['food'] },
  { slug: 'vegetables', name: 'Vegetables', category: 'food-grocery', categoryLabel: 'Grocery', description: 'Farm-fresh vegetables and organic produce store', previewImage: '/prokip-logo.png', file: 'food-grocery/vegetables.html', siteType: 'ECOMMERCE', industries: ['food'] },

  // Health
  { slug: 'pills', name: 'Health & Supplements', category: 'health', categoryLabel: 'Health & Wellness', description: 'Health supplements and pharmacy store', previewImage: '/prokip-logo.png', file: 'health/pills.html', siteType: 'ECOMMERCE', industries: ['health'] },

  // AI-Generated
  { slug: 'ai', name: 'AI Modern', category: 'ai', categoryLabel: 'AI Templates', description: 'Clean, modern Allbirds-inspired e-commerce template with full-bleed imagery, editorial layout, and video hero', previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', file: 'ai/modern.html', siteType: 'ECOMMERCE', industries: ['fashion', 'lifestyle', 'retail'] },

  // Landing Pages — Simple
  { slug: 'landing-gadget', name: 'Gadget Landing', category: 'landing-simple', categoryLabel: 'Simple Landing Page', description: 'Clean product landing page for gadgets and devices', previewImage: '', file: 'sites/landing-gadget/index.html', siteType: 'LANDING_PAGE', industries: ['electronics', 'other'] },

  // Landing Pages — Health & Medical
  { slug: 'aegis', name: 'Aegis Health', category: 'landing-health', categoryLabel: 'Health & Medical', description: 'Health and medical landing page with bento stats, service cards, testimonials, and CTA sections', previewImage: '', file: '', siteType: 'LANDING_PAGE', industries: ['health', 'other'] },

  // Landing Pages — Recruitment
  { slug: 'prokip-agent', name: 'Prokip Sales Agent', category: 'landing-simple', categoryLabel: 'Simple Landing Page', description: 'Dark navy recruitment landing page for sales agent opportunities with video, benefits, and conversion sections', previewImage: '', file: '', siteType: 'LANDING_PAGE', industries: ['other'] },

  // Landing Pages — Demo Booking
  { slug: 'prokip-booking', name: 'Prokip Demo Booking', category: 'landing-simple', categoryLabel: 'Simple Landing Page', description: 'Demo booking landing page with multi-step form, video hero, problem/solution sections, testimonials, and process timeline', previewImage: '', file: '', siteType: 'LANDING_PAGE', industries: ['other'] },
];

export function getTemplateBySlug(slug: string): TemplateMeta | undefined {
  return TEMPLATES.find(t => t.slug === slug);
}

export function getTemplatesByCategory(category: string): TemplateMeta[] {
  return TEMPLATES.filter(t => t.category === category);
}

export function getTemplatesByIndustry(industry: string): TemplateMeta[] {
  return TEMPLATES.filter(t => t.industries.includes(industry));
}
