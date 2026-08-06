import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Check if site ID exists
 */

async function checkSiteId() {
  const siteId = "cmrkkpl60000cocm9jmzsbxn5";
  console.log(`🔍 Checking site ID: ${siteId}\n`);

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { id: true, name: true, slug: true, status: true },
  });

  if (site) {
    console.log("✅ Site found:");
    console.log(`   ID: ${site.id}`);
    console.log(`   Name: ${site.name}`);
    console.log(`   Slug: ${site.slug}`);
    console.log(`   Status: ${site.status}`);
  } else {
    console.log("❌ Site not found in database");
  }

  // List all sites for reference
  console.log("\n📝 All sites in database:");
  const allSites = await prisma.site.findMany({
    select: { id: true, name: true, slug: true },
    take: 10,
  });
  allSites.forEach(s => {
    console.log(`   ${s.id.substring(0, 20)}... - ${s.name} (${s.slug})`);
  });
}

checkSiteId()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
