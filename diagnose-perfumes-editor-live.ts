import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Diagnose Journal and Fragrances pages in editor vs live
 */

async function diagnosePerfumesPages() {
  console.log("🔍 Diagnosing perfumes Journal and Fragrances pages...\n");

  const parfumSite = await prisma.site.findFirst({
    where: { slug: "parfum" },
  });

  if (!parfumSite) {
    console.log("❌ parfum site not found");
    return;
  }

  console.log(`📝 Site: ${parfumSite.name} (${parfumSite.slug})\n`);

  const journalPage = await prisma.page.findFirst({
    where: { siteId: parfumSite.id, slug: "journal" },
  });

  const fragrancesPage = await prisma.page.findFirst({
    where: { siteId: parfumSite.id, slug: "fragrances" },
  });

  console.log("📄 JOURNAL PAGE:");
  if (journalPage) {
    console.log(`   ID: ${journalPage.id}`);
    console.log(`   Title: ${journalPage.title}`);
    console.log(`   Slug: ${journalPage.slug}`);
    console.log(`   Type: ${journalPage.type}`);
    console.log(`   Published: ${journalPage.isPublished}`);
    console.log(`   Content structure: ${JSON.stringify(journalPage.content, null, 2).substring(0, 500)}...`);
  } else {
    console.log("   ❌ Not found");
  }

  console.log("\n📄 FRAGRANCES PAGE:");
  if (fragrancesPage) {
    console.log(`   ID: ${fragrancesPage.id}`);
    console.log(`   Title: ${fragrancesPage.title}`);
    console.log(`   Slug: ${fragrancesPage.slug}`);
    console.log(`   Type: ${fragrancesPage.type}`);
    console.log(`   Published: ${fragrancesPage.isPublished}`);
    console.log(`   Content structure: ${JSON.stringify(fragrancesPage.content, null, 2).substring(0, 500)}...`);
  } else {
    console.log("   ❌ Not found");
  }
}

diagnosePerfumesPages()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
