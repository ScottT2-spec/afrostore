import "dotenv/config";
import { prisma } from "@/lib/db";
import { ensureTemplatePages } from "./template-pages";
import { PERFUMES_HOME_PAGE_BLOCKS } from "./presets/perfumes-page-presets";
import { buildTemplatePageContent } from "@/lib/templates/template-tree";
import { parsePageContent } from "@/lib/page-content";

/**
 * Seed perfumes template pages with real block content
 * This script ensures all perfumes sites have their pages created
 * and seeded with the exact content from the live template
 */

async function seedPerfumesPages() {
  console.log("🌸 Seeding perfumes template pages...");

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
      templates: {
        include: {
          template: true,
        },
      },
    },
  });

  console.log(`Found ${sites.length} sites using perfumes template`);

  for (const site of sites) {
    console.log(`\n📝 Processing site: ${site.name} (${site.slug})`);

    // Seed pages without overwriting any existing non-empty page content.
    await ensureTemplatePages(site.id, "perfumes");

    // Seed home page with blocks
    const homePage = await prisma.page.findFirst({
      where: { siteId: site.id, type: "HOME" },
    });

    if (homePage) {
      await prisma.page.update({
        where: { id: homePage.id },
        data: {
          content: buildTemplatePageContent(PERFUMES_HOME_PAGE_BLOCKS as any, {}) as any,
        },
      });
      console.log(`  ✓ Home page seeded with ${PERFUMES_HOME_PAGE_BLOCKS.length} blocks`);
    }

    // Verify pages were created with content
    const pages = await prisma.page.findMany({
      where: { siteId: site.id },
      orderBy: { position: "asc" },
    });

    console.log(`  Pages for ${site.name}:`);
    for (const page of pages) {
      const parsed = parsePageContent(page.content);
      const blockCount = parsed.elements?.length || parsed.blocks.length || 0;
      console.log(`    ✓ ${page.title} (${page.slug}) - ${blockCount} blocks`);
    }
  }

  console.log("\n✅ Perfumes template pages seeded successfully!");
}

seedPerfumesPages()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error seeding perfumes pages:", error);
    process.exit(1);
  });
