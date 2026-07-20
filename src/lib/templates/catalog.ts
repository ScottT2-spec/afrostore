// Template catalog — maps extracted-templates/ HTML files to browsable templates

export interface TemplateMeta {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  previewImage: string; // og:image or fallback
  file: string; // relative path under extracted-templates/
  industries: string[]; // matching INDUSTRIES ids from new-site page
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
  { id: 'landing-portfolio', label: 'Artsy Portfolio' },
  { id: 'landing-kids', label: 'Children-focused' },
  { id: 'landing-tech', label: 'Tech & SaaS' },
] as const;

export const TEMPLATES: TemplateMeta[] = [
  // Fashion
  { slug: 'fashion', name: 'Fashion', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Modern fashion store with bold imagery and clean product layouts', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'fashion/fashion.html', industries: ['fashion'] },
  { slug: 'fashion-colored', name: 'Fashion Color', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Vibrant colorful fashion store with eye-catching design', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'fashion/fashion-colored.html', industries: ['fashion'] },
  { slug: 'handmade-bags', name: 'Handmade Bags', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Artisan handmade bags and leather goods store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'fashion/handmade-bags.html', industries: ['fashion', 'art'] },
  { slug: 't-shirts-prints', name: 'T-Shirts & Prints', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Custom t-shirts and print-on-demand store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'fashion/t-shirts-prints.html', industries: ['fashion'] },

  // Electronics
  { slug: 'electronics', name: 'Electronics', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Tech and electronics store with detailed product specs', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'electronics/electronics.html', industries: ['electronics'] },
  { slug: 'electronics-accessories', name: 'Tech Accessories', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Phone cases, cables, and tech accessories store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'electronics/accessories.html', industries: ['electronics'] },
  { slug: 'hardware', name: 'Hardware', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Computer hardware and components store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'electronics/hardware.html', industries: ['electronics'] },
  { slug: 'tools', name: 'Tools', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Power tools and equipment store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'electronics/tools.html', industries: ['electronics', 'construction'] },

  // Beauty
  { slug: 'cosmetics', name: 'Cosmetics', category: 'beauty', categoryLabel: 'Beauty & Skincare', description: 'Premium cosmetics and skincare product store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'beauty/cosmetics.html', industries: ['beauty'] },
  { slug: 'makeup', name: 'Makeup', category: 'beauty', categoryLabel: 'Beauty & Skincare', description: 'Makeup and beauty products with glamorous design', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'beauty/makeup.html', industries: ['beauty'] },
  { slug: 'perfumes', name: 'Perfumes', category: 'beauty', categoryLabel: 'Beauty & Skincare', description: 'Luxury perfumes and fragrances store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'beauty/perfumes.html', industries: ['beauty'] },



  // Children
  { slug: 'kids', name: 'Kids', category: 'children', categoryLabel: 'Children & Toys', description: 'Children\'s clothing and accessories store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'children/kids.html', industries: ['fashion'] },
  { slug: 'toys', name: 'Toys', category: 'children', categoryLabel: 'Children & Toys', description: 'Toy store with playful and colorful design', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'children/toys.html', industries: ['other'] },

  // Bakery
  { slug: 'sweets-bakery', name: 'Bakery', category: 'bakery', categoryLabel: 'Bakery & Sweets', description: 'Bakery and sweets store with warm, inviting design', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'bakery/sweets-bakery.html', industries: ['food'] },



  // Interior Design
  { slug: 'decor', name: 'Decor', category: 'interior-design', categoryLabel: 'Interior Design', description: 'Home decor and interior design store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'interior-design/decor.html', industries: ['other'] },
  { slug: 'retail', name: 'Retail', category: 'interior-design', categoryLabel: 'Interior Design', description: 'Retail furniture and home goods store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'interior-design/retail.html', industries: ['other'] },

  // Food & Grocery
  { slug: 'grocery', name: 'Grocery', category: 'food-grocery', categoryLabel: 'Grocery', description: 'Online grocery store with fresh produce', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'food-grocery/grocery.html', industries: ['food'] },
  { slug: 'vegetables', name: 'Vegetables', category: 'food-grocery', categoryLabel: 'Grocery', description: 'Farm-fresh vegetables and organic produce store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'food-grocery/vegetables.html', industries: ['food'] },

  // Health
  { slug: 'pills', name: 'Health & Supplements', category: 'health', categoryLabel: 'Health & Wellness', description: 'Health supplements and pharmacy store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'health/pills.html', industries: ['health'] },

  // AI-Generated
  { slug: 'ai', name: 'AI Modern', category: 'ai', categoryLabel: 'AI Templates', description: 'Clean, modern Allbirds-inspired e-commerce template with full-bleed imagery, editorial layout, and video hero', previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', file: 'ai/modern.html', industries: ['fashion', 'lifestyle', 'retail'] },

  // Landing Pages — Simple
  { slug: 'landing-gadget', name: 'Gadget Landing', category: 'landing-simple', categoryLabel: 'Simple Landing Page', description: 'Clean product landing page for gadgets and devices', previewImage: '', file: 'sites/landing-gadget/index.html', industries: ['electronics', 'other'] },

  // Landing Pages — Artsy Portfolio
  { slug: 'landing-artsy', name: 'Artsy Portfolio', category: 'landing-portfolio', categoryLabel: 'Artsy Portfolio', description: 'Creative portfolio landing page with artistic flair', previewImage: '', file: 'sites/landing-artsy/index.html', industries: ['art', 'other'] },
  { slug: 'landing-dev-portfolio', name: 'Dev Portfolio', category: 'landing-portfolio', categoryLabel: 'Artsy Portfolio', description: 'Developer portfolio with project showcase', previewImage: '', file: 'sites/landing-dev-portfolio/index.html', industries: ['other'] },

  // Landing Pages — Children-focused
  { slug: 'landing-kids', name: 'Kids Landing', category: 'landing-kids', categoryLabel: 'Children-focused', description: 'Playful children-focused landing page', previewImage: '', file: 'sites/landing-kids/index.html', industries: ['other'] },

  // Landing Pages — Tech & SaaS
  { slug: 'landing-tech-saas', name: 'Tech SaaS', category: 'landing-tech', categoryLabel: 'Tech & SaaS', description: 'Modern SaaS product landing page with pricing sections', previewImage: '', file: 'sites/landing-tech-saas/index.html', industries: ['other'] },
  { slug: 'landing-travel', name: 'Travel Landing', category: 'landing-tech', categoryLabel: 'Tech & SaaS', description: 'Travel booking and destination landing page', previewImage: '', file: 'sites/landing-travel/index.html', industries: ['other'] },
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
