import "dotenv/config";
import { prisma } from "@/lib/db";
import { ensureTemplatePages } from "@/lib/templates/template-pages";

/**
 * Backfill script for existing Retail/Decor sites
 * Ensures all 4 project detail pages are created in the database
 * Run this script to update existing Retail sites with the project detail pages
 */

async function backfillRetailProjectPages() {
  console.log("🔧 Starting backfill of Retail project detail pages...\n");

  // Find all active Retail and Decor sites
  const sites = await prisma.site.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      templates: {
        where: {
          isActive: true,
        },
        include: {
          template: true,
        },
        take: 1,
      },
    },
  });

  console.log(`📊 Found ${sites.length} total active sites`);

  let retailSitesCount = 0;
  let updatedSitesCount = 0;

  for (const site of sites) {
    const activeTemplateSlug = site.templates?.[0]?.template?.slug;

    // Check if this is a Retail or Decor template
    if (activeTemplateSlug === "retail" || activeTemplateSlug === "decor") {
      retailSitesCount++;
      console.log(`\n📝 Processing site: ${site.name} (${site.slug}) - Template: ${activeTemplateSlug}`);

      try {
        // Force update to ensure project detail pages are created with full content
        await ensureTemplatePages(site.id, activeTemplateSlug, true);
        updatedSitesCount++;
        console.log(`✅ Successfully updated project detail pages for ${site.name}`);
      } catch (error) {
        console.error(`❌ Failed to update ${site.name}:`, error);
      }
    }
  }

  console.log(`\n📋 Summary:`);
  console.log(`- Total Retail/Decor sites found: ${retailSitesCount}`);
  console.log(`- Sites successfully updated: ${updatedSitesCount}`);
  console.log(`- Sites that failed: ${retailSitesCount - updatedSitesCount}`);

  if (updatedSitesCount > 0) {
    console.log(`\n✨ Backfill complete! ${updatedSitesCount} Retail/Decor sites now have project detail pages.`);
  } else {
    console.log(`\n⚠️ No Retail/Decor sites were updated.`);
  }
}

// Run the backfill
backfillRetailProjectPages()
  .then(() => {
    console.log("\n🎉 Backfill script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Backfill script failed:", error);
    process.exit(1);
  });
