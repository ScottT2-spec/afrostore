import "dotenv/config";
import { prisma } from "@/lib/db";
import { 
  PERFUMES_ABOUT_PAGE_BLOCKS, 
  PERFUMES_CONTACT_PAGE_BLOCKS, 
  PERFUMES_FRAGRANCES_PAGE_BLOCKS, 
  PERFUMES_JOURNAL_PAGE_BLOCKS,
  PERFUMES_REVIEWS_PAGE_BLOCKS 
} from "@/lib/templates/presets/perfumes-page-presets";

/**
 * Force re-seed perfumes pages with rich block content
 * This ensures all perfumes sites have the correct, full content
 */

async function reseedPerfumesPages() {
  console.log("🔄 Force re-seeding perfumes pages with rich content...\n");

  const sites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          template: {
            slug: "perfumes",
          },
          isActive: true,
        },
      },
    },
  });

  console.log(`Found ${sites.length} sites using perfumes template\n`);

  for (const site of sites) {
    console.log(`📝 Processing site: ${site.name} (${site.slug})`);

    const pageUpdates = [
      { slug: "about", title: "About Us", blocks: PERFUMES_ABOUT_PAGE_BLOCKS },
      { slug: "contact", title: "Contact Us", blocks: PERFUMES_CONTACT_PAGE_BLOCKS },
      { slug: "fragrances", title: "Fragrances", blocks: PERFUMES_FRAGRANCES_PAGE_BLOCKS },
      { slug: "journal", title: "Journal", blocks: PERFUMES_JOURNAL_PAGE_BLOCKS },
      { slug: "reviews", title: "Reviews", blocks: PERFUMES_REVIEWS_PAGE_BLOCKS },
    ];

    for (const update of pageUpdates) {
      const existingPage = await prisma.page.findFirst({
        where: { 
          siteId: site.id, 
          slug: update.slug 
        },
      });

      if (existingPage) {
        await prisma.page.update({
          where: { id: existingPage.id },
          data: {
            title: update.title,
            content: { blocks: update.blocks },
          },
        });
        console.log(`   ✓ Updated: ${update.title} (${update.slug}) - ${update.blocks.length} blocks`);
      } else {
        await prisma.page.create({
          data: {
            siteId: site.id,
            title: update.title,
            slug: update.slug,
            type: "CUSTOM",
            content: { blocks: update.blocks },
            isPublished: true,
            position: 10 + pageUpdates.indexOf(update),
          },
        });
        console.log(`   ✓ Created: ${update.title} (${update.slug}) - ${update.blocks.length} blocks`);
      }
    }
  }

  console.log("\n✅ Perfumes pages re-seeded successfully!");
}

reseedPerfumesPages()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error re-seeding perfumes pages:", error);
    process.exit(1);
  });
