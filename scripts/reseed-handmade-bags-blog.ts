/**
 * Targeted re-seed script: updates only the blog page for Handmade Bags sites
 * 
 * Run: npx tsx scripts/reseed-handmade-bags-blog.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  HANDMADE_BAGS_BLOG_BLOCKS,
} from "../src/lib/templates/presets/handmade-bags-pages";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find all sites using the handmade-bags template
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

  console.log(`Found ${sites.length} sites with handmade-bags template`);

  for (const site of sites) {
    console.log(`\nProcessing: ${site.slug}`);

    const page = await prisma.page.findUnique({
      where: { siteId_slug: { siteId: site.id, slug: "blog" } },
      select: { id: true, content: true },
    });

    if (!page) {
      // Create the page with blocks
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: "Blog",
          slug: "blog",
          type: "CUSTOM",
          content: HANDMADE_BAGS_BLOG_BLOCKS as any,
          isPublished: true,
          position: 13,
        },
      });
      console.log(`  ✓ Created blog page with ${HANDMADE_BAGS_BLOG_BLOCKS.length} blocks`);
      continue;
    }

    // Force update the blog page with corrected blocks
    await prisma.page.update({
      where: { id: page.id },
      data: { content: HANDMADE_BAGS_BLOG_BLOCKS as any },
    });
    console.log(`  ✓ Updated blog page with ${HANDMADE_BAGS_BLOG_BLOCKS.length} blocks`);
  }

  console.log("\n✅ Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
