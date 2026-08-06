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
 * Comprehensive fix script for perfumes template issues
 * 
 * 1. Removes duplicate empty pages (about-us, contact-us)
 * 2. Force-seeds full rich blocks for all perfumes pages
 * 3. Ensures all pages have proper content from the consolidated presets
 */

async function fixPerfumesTemplateIssues() {
  console.log("🔧 Starting comprehensive perfumes template fix...\n");

  // Find all sites using the perfumes template
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
    include: {
      pages: {
        orderBy: { position: "asc" },
      },
    },
  });

  console.log(`Found ${sites.length} sites using perfumes template\n`);

  for (const site of sites) {
    console.log(`\n📝 Processing site: ${site.name} (${site.slug})`);
    console.log(`─`.repeat(60));

    // Step 1: Identify and remove duplicate empty pages
    const duplicatePages = site.pages.filter(p => 
      (p.slug === "about-us" || p.slug === "contact-us") && 
      p.title.includes("About") || p.title.includes("Contact")
    );

    if (duplicatePages.length > 0) {
      console.log(`\n🗑️  Removing ${duplicatePages.length} duplicate empty pages:`);
      for (const dup of duplicatePages) {
        console.log(`   - Deleting: ${dup.title} (${dup.slug}) [ID: ${dup.id}]`);
        await prisma.page.delete({
          where: { id: dup.id },
        });
      }
    } else {
      console.log("\n✓ No duplicate pages found");
    }

    // Step 2: Force-seed all perfumes pages with full rich content
    const pageUpdates = [
      { slug: "about", title: "About Us", blocks: PERFUMES_ABOUT_PAGE_BLOCKS },
      { slug: "contact", title: "Contact Us", blocks: PERFUMES_CONTACT_PAGE_BLOCKS },
      { slug: "fragrances", title: "Fragrances", blocks: PERFUMES_FRAGRANCES_PAGE_BLOCKS },
      { slug: "journal", title: "Journal", blocks: PERFUMES_JOURNAL_PAGE_BLOCKS },
      { slug: "reviews", title: "Reviews", blocks: PERFUMES_REVIEWS_PAGE_BLOCKS },
    ];

    console.log(`\n🔄 Force-seeding pages with rich block content:`);
    
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

    // Step 3: Verify final state
    const finalPages = await prisma.page.findMany({
      where: { siteId: site.id },
      orderBy: { position: "asc" },
    });

    console.log(`\n📊 Final page state for ${site.name}:`);
    for (const page of finalPages) {
      const hasContent = page.content && typeof page.content === "object" && "blocks" in page.content && Array.isArray((page.content as any).blocks);
      const blockCount = hasContent ? (page.content as any).blocks.length : 0;
      const status = blockCount > 0 ? "✓" : "⚠️";
      console.log(`   ${status} ${page.title} (${page.slug}) - ${blockCount} blocks`);
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("✅ Perfumes template issues fixed successfully!");
  console.log("\nNext steps:");
  console.log("1. Remove hardcoded JSX fallback from page.tsx for contact-us");
  console.log("2. Clear any cache if needed");
  console.log("3. Test editor and live site rendering");
}

fixPerfumesTemplateIssues()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fixing perfumes template:", error);
    process.exit(1);
  });
