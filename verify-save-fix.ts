import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Verify the save fix by checking page content and cache headers
 */

async function verifySaveFix() {
  console.log("🔍 Verifying save fix...\n");

  // Get a test site and page
  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, slug: true },
  });

  if (!site) {
    console.log("❌ No active site found");
    return;
  }

  console.log(`📝 Testing with site: ${site.name} (${site.slug})\n`);

  const page = await prisma.page.findFirst({
    where: { siteId: site.id, isPublished: true },
    select: { id: true, title: true, slug: true, content: true, isPublished: true },
  });

  if (!page) {
    console.log("❌ No published page found");
    return;
  }

  console.log(`📄 Testing page: ${page.title} (${page.slug})`);
  console.log(`   Published: ${page.isPublished}`);
  console.log(`   Content blocks: ${(page.content as any)?.blocks?.length || 0}`);
  
  // Check the API route URL pattern
  const apiUrl = `http://localhost:3000/api/storefront/${site.slug}/pages/${page.slug}`;
  const liveUrl = `http://localhost:3000/store/${site.slug}/${page.slug}`;
  
  console.log(`\n🔗 API URL: ${apiUrl}`);
  console.log(`🔗 Live URL: ${liveUrl}`);
  
  console.log("\n✅ Verification setup complete");
  console.log("Next steps:");
  console.log("1. Edit a page in the builder");
  console.log("2. Save the changes");
  console.log("3. Run: curl -I " + apiUrl);
  console.log("4. Check Cache-Control headers");
  console.log("5. Run: curl " + apiUrl);
  console.log("6. Verify new content is present");
  console.log("7. Load live URL in browser");
  console.log("8. Verify changes appear immediately");
}

verifySaveFix()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
