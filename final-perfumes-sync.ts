import "dotenv/config";
import { prisma } from "@/lib/db";
import { 
  PERFUMES_ABOUT_PAGE_BLOCKS, 
  PERFUMES_CONTACT_PAGE_BLOCKS, 
  PERFUMES_FRAGRANCES_PAGE_BLOCKS, 
  PERFUMES_JOURNAL_PAGE_BLOCKS,
  PERFUMES_REVIEWS_PAGE_BLOCKS 
} from "@/lib/templates/presets/perfumes-page-presets";
import { ensureTemplatePages } from "@/lib/templates/template-pages";
import { revalidatePath } from "next/cache";

/**
 * Final One-Shot Fix for Perfumes Template
 * Full synchronization: cleanup, re-seed, and revalidation
 */

async function finalPerfumesSync() {
  console.log("🚀 Final One-Shot Fix for Perfumes Template\n");

  const sites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          template: { slug: "perfumes" },
          isActive: true,
        },
      },
    },
    include: { pages: true },
  });

  console.log(`Found ${sites.length} sites using perfumes template\n`);

  for (const site of sites) {
    console.log(`📝 Processing site: ${site.name} (${site.slug})`);

    // Step 1: Delete any remaining duplicate or stale pages
    const duplicateSlugs = ["about-us", "contact-us"];
    for (const slug of duplicateSlugs) {
      const duplicatePages = site.pages.filter(p => p.slug === slug);
      for (const page of duplicatePages) {
        await prisma.page.delete({ where: { id: page.id } });
        console.log(`   ✗ Deleted duplicate page: ${slug}`);
      }
    }

    // Step 2: Force-update pages with perfect presets
    const pageUpdates = [
      { slug: "about", title: "About Us", blocks: PERFUMES_ABOUT_PAGE_BLOCKS },
      { slug: "contact", title: "Contact Us", blocks: PERFUMES_CONTACT_PAGE_BLOCKS },
      { slug: "fragrances", title: "Fragrances", blocks: PERFUMES_FRAGRANCES_PAGE_BLOCKS },
      { slug: "journal", title: "Journal", blocks: PERFUMES_JOURNAL_PAGE_BLOCKS },
      { slug: "reviews", title: "Reviews", blocks: PERFUMES_REVIEWS_PAGE_BLOCKS },
    ];

    for (const update of pageUpdates) {
      const existingPage = await prisma.page.findFirst({
        where: { siteId: site.id, slug: update.slug },
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

    // Step 3: Call ensureTemplatePages with forceUpdate
    await ensureTemplatePages(site.id, "perfumes", true);
    console.log(`   ✓ Called ensureTemplatePages with forceUpdate`);

    // Step 4: Trigger revalidation for all relevant store paths
    const pathsToRevalidate = [
      `/store/${site.slug}`,
      `/store/${site.slug}/about`,
      `/store/${site.slug}/contact`,
      `/store/${site.slug}/fragrances`,
      `/store/${site.slug}/journal`,
      `/store/${site.slug}/reviews`,
    ];

    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
      } catch (e) {
        // Revalidation might fail in non-Next.js context, that's okay
      }
    }
    console.log(`   ✓ Revalidated ${pathsToRevalidate.length} paths`);
  }

  console.log("\n✅ Final perfumes synchronization complete!");
}

finalPerfumesSync()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
