import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Add sample blog posts to perfumes sites to populate Journal grid
 */

const SAMPLE_BLOGS = [
  {
    title: "The Art of Layering Fragrances",
    slug: "art-of-layering-fragrances",
    excerpt: "Learn how to create your unique signature scent by layering different fragrances for depth and complexity.",
    content: "Layering fragrances is an art form that allows you to create a truly unique scent...",
    coverImage: "/prokip-logo.png",
    author: "Perfume Expert",
    category: "Tips",
  },
  {
    title: "Understanding Scent Families",
    slug: "understanding-scent-families",
    excerpt: "Explore the main fragrance families and discover which ones resonate with your personal style.",
    content: "Fragrance families include floral, oriental, woody, fresh, and chypre...",
    coverImage: "/prokip-logo.png",
    author: "Perfume Expert",
    category: "Education",
  },
  {
    title: "Summer vs Winter Scents",
    slug: "summer-vs-winter-scents",
    excerpt: "Discover the best fragrances for each season and how to transition your scent wardrobe throughout the year.",
    content: "Light, fresh scents work best in summer while deeper, warmer fragrances suit winter...",
    coverImage: "/prokip-logo.png",
    author: "Perfume Expert",
    category: "Seasonal",
  },
  {
    title: "The History of Perfume",
    slug: "history-of-perfume",
    excerpt: "Journey through the fascinating history of perfume from ancient civilizations to modern perfumery.",
    content: "Perfume has been used for thousands of years, from ancient Egypt to modern France...",
    coverImage: "/prokip-logo.png",
    author: "Perfume Expert",
    category: "History",
  },
];

async function seedPerfumesBlogs() {
  console.log("🔄 Seeding sample blog posts for perfumes sites...\n");

  const sites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          template: { slug: "perfumes" },
          isActive: true,
        },
      },
    },
  });

  console.log(`Found ${sites.length} sites using perfumes template\n`);

  for (const site of sites) {
    console.log(`📝 Processing site: ${site.name} (${site.slug})`);

    // Check existing blogs
    const existingBlogs = await prisma.blog.findMany({
      where: { siteId: site.id },
      select: { slug: true },
    });
    const existingSlugs = new Set(existingBlogs.map(b => b.slug));

    for (const blog of SAMPLE_BLOGS) {
      if (existingSlugs.has(blog.slug)) {
        console.log(`   ⊘ Skipping existing: ${blog.title}`);
        continue;
      }

      await prisma.blog.create({
        data: {
          siteId: site.id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          content: blog.content,
          coverImage: blog.coverImage,
          author: blog.author,
          category: blog.category,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      console.log(`   ✓ Created: ${blog.title}`);
    }
  }

  console.log("\n✅ Sample blog posts seeded successfully!");
}

seedPerfumesBlogs()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
