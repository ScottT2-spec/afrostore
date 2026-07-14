import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Deep analysis of Journal and Fragrances pages vs live template
 */

async function deepAnalyzePerfumes() {
  console.log("🔍 Deep Analysis of Perfumes Journal and Fragrances...\n");

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

  console.log("📄 JOURNAL PAGE - Current Database Content:");
  if (journalPage) {
    console.log(JSON.stringify(journalPage.content, null, 2));
  }

  console.log("\n📄 FRAGRANCES PAGE - Current Database Content:");
  if (fragrancesPage) {
    console.log(JSON.stringify(fragrancesPage.content, null, 2));
  }
}

deepAnalyzePerfumes()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
