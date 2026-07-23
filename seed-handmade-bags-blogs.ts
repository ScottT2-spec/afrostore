import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Add sample blog posts to handmade-bags sites to populate Journal grid
 * Based on woodmart.xtemos.com/handmade/blog/ reference content
 */

const SAMPLE_BLOGS = [
  {
    title: "The Art of Leather Craftsmanship",
    slug: "art-of-leather-craftsmanship",
    excerpt: "Discover the meticulous process behind creating premium leather bags, from selecting the finest hides to hand-stitching each piece.",
    content: "Leather craftsmanship is an ancient art that requires patience, skill, and dedication. Our artisans spend years mastering techniques passed down through generations...",
    coverImage: "https://woodmart.xtemos.com/handmade/wp-content/uploads/sites/35/2025/11/handmade-blog-1-588x598.jpg",
    author: "Master Artisan",
    category: "Craftsmanship",
  },
  {
    title: "Choosing the Perfect Leather Bag",
    slug: "choosing-perfect-leather-bag",
    excerpt: "A comprehensive guide to selecting the right leather bag for your lifestyle, considering durability, style, and functionality.",
    content: "When investing in a leather bag, it's important to consider how you'll use it daily. Different leathers serve different purposes...",
    coverImage: "https://woodmart.xtemos.com/handmade/wp-content/uploads/sites/35/2025/11/handmade-blog-2-588x598.jpg",
    author: "Style Expert",
    category: "Guide",
  },
  {
    title: "Caring for Your Leather Goods",
    slug: "caring-for-leather-goods",
    excerpt: "Essential tips and techniques to maintain the beauty and longevity of your leather bags and accessories.",
    content: "Proper care can extend the life of your leather goods by decades. Regular conditioning, proper storage, and gentle cleaning are key...",
    coverImage: "https://woodmart.xtemos.com/handmade/wp-content/uploads/sites/35/2025/11/handmade-blog-3-588x598.jpg",
    author: "Care Specialist",
    category: "Care",
  },
  {
    title: "Sustainable Fashion: Why Leather Matters",
    slug: "sustainable-fashion-leather",
    excerpt: "Exploring the environmental benefits of choosing quality leather goods over fast fashion alternatives.",
    content: "Investment pieces made from genuine leather last longer and reduce the environmental impact of frequent replacements...",
    coverImage: "https://woodmart.xtemos.com/handmade/wp-content/uploads/sites/35/2025/11/handmade-blog-4-588x598.jpg",
    author: "Sustainability Expert",
    category: "Sustainability",
  },
];

async function seedHandmadeBagsBlogs() {
  console.log("🔄 Seeding sample blog posts for handmade-bags sites...\n");

  const sites = await prisma.site.findMany({
    where: {
      OR: [
        { slug: 'handbag' },
        { slug: 'dewqa' },
        { slug: 'handmade-bags' },
        {
          templates: {
            some: {
              template: { slug: "handmade-bags" },
              isActive: true,
            },
          },
        },
      ],
    },
  });

  console.log(`Found ${sites.length} sites using handmade-bags template or matching slugs\n`);

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

seedHandmadeBagsBlogs()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
