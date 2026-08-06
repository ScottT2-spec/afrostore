/**
 * Create blog posts in DB from Prokip LTD reference for handmade-bags sites
 * 
 * Run: npx tsx scripts/create-blog-posts-from-reference.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

// Blog posts from Prokip LTD reference
const PROKIP_BLOG_POSTS = [
  {
    title: "Minimalist Japanese-inspired Leather Goods",
    slug: "minimalist-japanese-inspired-leather-goods",
    excerpt: "Discover how Japanese minimalism influences our leather craftsmanship. Clean lines, functional design, and exceptional quality meet traditional artistry.",
    content: "Discover how Japanese minimalism influences our leather craftsmanship. Clean lines, functional design, and exceptional quality meet traditional artistry. Our artisans blend centuries-old techniques with modern minimalist aesthetics to create pieces that are both timeless and contemporary.",
    coverImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop",
    author: "S. Rogers",
    category: "Home Decor",
    tags: ["minimalism", "japanese design", "leather craftsmanship"],
  },
  {
    title: "New Leather Care Essentials from Our Workshop",
    slug: "new-leather-care-essentials-from-our-workshop",
    excerpt: "Introducing our latest collection of leather care products. From conditioners to protectors, everything you need to maintain your handcrafted pieces.",
    content: "Introducing our latest collection of leather care products. From conditioners to protectors, everything you need to maintain your handcrafted pieces. Our workshop has developed specialized formulas that nourish and protect leather while preserving its natural beauty and extending its lifespan.",
    coverImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop",
    author: "S. Rogers",
    category: "Design trends",
    tags: ["leather care", "maintenance", "workshop"],
  },
  {
    title: "The Big Design: Wall Likes Pictures",
    slug: "the-big-design-wall-likes-pictures",
    excerpt: "How to display your leather bags as art in your home. Creative styling tips for showcasing your collection while keeping pieces protected and accessible.",
    content: "How to display your leather bags as art in your home. Creative styling tips for showcasing your collection while keeping pieces protected and accessible. Transform your living space into a gallery of craftsmanship with our expert guidance on display techniques and preservation methods.",
    coverImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&h=600&fit=crop",
    author: "S. Rogers",
    category: "Home Decor",
    tags: ["interior design", "display", "styling"],
  },
  {
    title: "Sweet Seat: Functional Leather for Everyday",
    slug: "sweet-seat-functional-leather-for-everyday",
    excerpt: "Practical leather goods designed for daily use. Discover our collection of functional pieces that combine durability with elegant design for modern lifestyles.",
    content: "Practical leather goods designed for daily use. Discover our collection of functional pieces that combine durability with elegant design for modern lifestyles. Our everyday collection is built to withstand daily use while maintaining the sophisticated aesthetic that defines our brand.",
    coverImage: "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop",
    author: "S. Rogers",
    category: "Decoration",
    tags: ["functional design", "everyday use", "durability"],
  },
  {
    title: "Creative Leather Features and Exterior Design",
    slug: "creative-leather-features-and-exterior-design",
    excerpt: "Exploring innovative leather treatments and exterior finishes. From natural patinas to protective coatings, learn about the techniques that make our pieces unique.",
    content: "Exploring innovative leather treatments and exterior finishes. From natural patinas to protective coatings, learn about the techniques that make our pieces unique. Our artisans experiment with traditional and modern finishing methods to create distinctive surfaces that tell a story of craftsmanship and innovation.",
    coverImage: "https://images.unsplash.com/photo-1473188588951-1d4f0e31f5e0?w=800&h=600&fit=crop",
    author: "S. Rogers",
    category: "Decoration",
    tags: ["leather treatment", "exterior design", "innovation"],
  },
];

async function main() {
  console.log("🔍 Creating Blog Posts from Prokip LTD Reference\n");

  const sites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          isActive: true,
          template: { slug: "handmade-bags" },
        },
      },
    },
    select: { id: true, slug: true },
  });

  console.log(`Found ${sites.length} handmade-bags sites\n`);

  for (const site of sites) {
    console.log(`📋 Site: ${site.slug}`);
    
    // Check existing posts
    const existingPosts = await prisma.blog.findMany({
      where: { siteId: site.id },
      select: { slug: true },
    });
    const existingSlugs = new Set(existingPosts.map(p => p.slug));
    
    let createdCount = 0;
    
    for (const postData of PROKIP_BLOG_POSTS) {
      if (existingSlugs.has(postData.slug)) {
        console.log(`   ⊘ ${postData.slug}: Already exists`);
        continue;
      }
      
      await prisma.blog.create({
        data: {
          siteId: site.id,
          ...postData,
          status: "PUBLISHED",
          publishedAt: new Date("2017-06-22"), // Use reference dates
        },
      });
      
      console.log(`   ✅ ${postData.slug}: Created`);
      createdCount++;
    }
    
    console.log(`   Created ${createdCount} new posts\n`);
  }

  console.log("✅ Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
