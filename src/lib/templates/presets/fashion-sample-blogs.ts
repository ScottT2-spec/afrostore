/**
 * Fashion Template — Sample Blog Posts
 * These get created as real blog entries in the merchant's store when they pick the Fashion template.
 * Merchants can edit or delete them from their Blog dashboard, just like Shopify.
 * They appear in the "Our Latest News" section on the storefront.
 */

export interface SampleBlog {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  status: "PUBLISHED";
}

export const FASHION_SAMPLE_BLOGS: SampleBlog[] = [
  {
    title: "Summer Fashion Trends You Need to Know",
    slug: "summer-fashion-trends-you-need-to-know",
    excerpt:
      "Discover the hottest trends this season — from bold colors to relaxed silhouettes that define modern style...",
    contentHtml: `
      <h2>Summer Fashion Trends You Need to Know</h2>
      <p>This summer is all about embracing bold colors, relaxed silhouettes, and statement accessories. Whether you're heading to the beach or a rooftop dinner, these trends will keep you looking effortlessly chic.</p>
      <h3>1. Bold & Bright Colors</h3>
      <p>Gone are the days of playing it safe with neutrals. This season, designers are pushing vibrant oranges, electric blues, and hot pinks to the forefront. Don't be afraid to mix and match — color blocking is back in a big way.</p>
      <h3>2. Relaxed Silhouettes</h3>
      <p>Oversized blazers, wide-leg trousers, and flowy maxi dresses are dominating the runways. Comfort meets style in the most elegant way possible.</p>
      <h3>3. Statement Accessories</h3>
      <p>Chunky gold jewelry, oversized sunglasses, and woven bags are the must-have accessories this summer. They can transform even the simplest outfit into a head-turning look.</p>
      <h3>4. Sustainable Fashion</h3>
      <p>More brands are embracing eco-friendly materials and ethical production. Look for pieces made from organic cotton, recycled fabrics, and responsibly sourced materials.</p>
      <p>Ready to refresh your wardrobe? Browse our latest collection to find pieces that embody these trends.</p>
    `,
    coverImage:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=400&fit=crop",
    author: "Style Editor",
    category: "Fashion Trends",
    tags: ["fashion", "trends", "summer", "style"],
    status: "PUBLISHED",
  },
  {
    title: "How to Build a Capsule Wardrobe",
    slug: "how-to-build-a-capsule-wardrobe",
    excerpt:
      "Learn how to create a versatile wardrobe with just 30 essential pieces that mix and match for any occasion...",
    contentHtml: `
      <h2>How to Build a Capsule Wardrobe</h2>
      <p>A capsule wardrobe is a curated collection of essential clothing items that don't go out of style. With just 30 carefully chosen pieces, you can create dozens of outfits for any occasion.</p>
      <h3>Step 1: Audit Your Current Wardrobe</h3>
      <p>Start by removing everything from your closet. Keep only the items that fit well, make you feel confident, and match your lifestyle. Be ruthless — if you haven't worn it in 6 months, it's time to let go.</p>
      <h3>Step 2: Define Your Color Palette</h3>
      <p>Choose 3-4 neutral base colors (black, white, navy, beige) and 2-3 accent colors that complement each other. This ensures everything in your wardrobe works together.</p>
      <h3>Step 3: Invest in Quality Basics</h3>
      <p>A well-fitted white t-shirt, classic jeans, a tailored blazer, and a little black dress are non-negotiables. Spend more on these foundation pieces — they'll last years.</p>
      <h3>Step 4: Add Versatile Statement Pieces</h3>
      <p>A printed blouse, a colorful scarf, or a unique pair of shoes can transform your basics into completely different looks.</p>
      <h3>Step 5: Maintain the Balance</h3>
      <p>For every new piece you add, remove one. This keeps your wardrobe intentional and clutter-free.</p>
      <p>A capsule wardrobe isn't about restriction — it's about freedom. Less time deciding what to wear, more time enjoying your day.</p>
    `,
    coverImage:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop",
    author: "Fashion Team",
    category: "Style Guide",
    tags: ["wardrobe", "capsule", "style-guide", "tips"],
    status: "PUBLISHED",
  },
];
