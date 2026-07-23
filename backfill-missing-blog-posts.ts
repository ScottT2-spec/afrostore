import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter});

const MISSING_SITES = ["dfregtt", "ret", "ugert"];

const BLOGS_TO_BACKFILL = [
  {
    title: "Creating a Cozy Home with Natural Materials",
    slug: "cozy-home-natural-materials",
    excerpt: "Discover how earthy textures and organic pieces transform your living space...",
    content: { text: "Natural materials like wood, rattan, linen, and ceramic bring warmth and texture to any room. Start with a jute rug, add woven baskets for storage, and incorporate plants for a fresh, alive feeling.\n\nChoose furniture with organic shapes and earth-toned upholstery. Layer textures with throw blankets and cushions in natural fibres.\n\nThe result is a calming, grounded space that connects you to nature even indoors." },
    contentHtml: "<h1>Creating a Cozy Home with Natural Materials</h1><p>Discover how earthy textures and organic pieces transform your living space...</p><div class=\"content\">Natural materials like wood, rattan, linen, and ceramic bring warmth and texture to any room. Start with a jute rug, add woven baskets for storage, and incorporate plants for a fresh, alive feeling.<br><br>Choose furniture with organic shapes and earth-toned upholstery. Layer textures with throw blankets and cushions in natural fibres.<br><br>The result is a calming, grounded space that connects you to nature even indoors.</div>",
    coverImage: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop",
    author: "Style Editor",
    category: "Home Tips",
    tags: ["home", "natural", "interior"],
  },
  {
    title: "10 Easy Ways to Brighten Your Garden",
    slug: "brighten-your-garden",
    excerpt: "Simple tips to transform your outdoor space into a vibrant retreat...",
    content: { text: "A beautiful garden doesn't require a huge budget. Start with colorful planters, add solar-powered fairy lights, and plant seasonal flowers for year-round colour.\n\nConsider adding a small water feature or bird bath as a focal point. Use mulch and decorative stones for clean, low-maintenance borders.\n\nFinish with comfortable seating and outdoor cushions to create a space you'll love spending time in." },
    contentHtml: "<h1>10 Easy Ways to Brighten Your Garden</h1><p>Simple tips to transform your outdoor space into a vibrant retreat...</p><div class=\"content\">A beautiful garden doesn't require a huge budget. Start with colorful planters, add solar-powered fairy lights, and plant seasonal flowers for year-round colour.<br><br>Consider adding a small water feature or bird bath as a focal point. Use mulch and decorative stones for clean, low-maintenance borders.<br><br>Finish with comfortable seating and outdoor cushions to create a space you'll love spending time in.</div>",
    coverImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop",
    author: "Garden Team",
    category: "Garden Tips",
    tags: ["garden", "outdoor", "decor"],
  },
];

async function backfillMissingBlogPosts() {
  console.log("=== Backfilling missing blog posts to 3 sites ===\n");

  for (const siteSlug of MISSING_SITES) {
    console.log(`Processing site: ${siteSlug}`);

    const site = await prisma.site.findUnique({
      where: { slug: siteSlug },
    });

    if (!site) {
      console.log(`  Site not found, skipping\n`);
      continue;
    }

    for (const blogData of BLOGS_TO_BACKFILL) {
      const existing = await prisma.blog.findUnique({
        where: {
          siteId_slug: {
            siteId: site.id,
            slug: blogData.slug,
          },
        },
      });

      if (existing) {
        console.log(`  - ${blogData.slug}: Already exists, skipping`);
      } else {
        await prisma.blog.create({
          data: {
            siteId: site.id,
            title: blogData.title,
            slug: blogData.slug,
            excerpt: blogData.excerpt,
            content: blogData.content,
            contentHtml: blogData.contentHtml,
            coverImage: blogData.coverImage,
            author: blogData.author,
            category: blogData.category,
            tags: blogData.tags,
            status: "PUBLISHED",
            publishedAt: new Date(),
          },
        });
        console.log(`  - ${blogData.slug}: Created successfully`);
      }
    }

    console.log(`\n`);
  }

  console.log("Backfill complete");
}

backfillMissingBlogPosts()
  .then(() => {
    console.log("Backfill finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });
