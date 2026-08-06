import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Analyze current state of perfumes pages in detail
 */

async function analyzePerfumesContent() {
  console.log("🔍 Analyzing perfumes pages content...\n");

  const parfumSite = await prisma.site.findFirst({
    where: { slug: "parfum" },
    include: {
      pages: {
        where: {
          slug: { in: ["about", "about-us", "contact", "contact-us", "journal", "fragrances"] }
        },
        orderBy: { position: "asc" },
      },
    },
  });
  
  if (!parfumSite) {
    console.log("Site not found");
    return;
  }
  
  console.log("=== PARFUM SITE PAGE CONTENT ANALYSIS ===\n");
  
  for (const page of parfumSite.pages) {
    console.log(`Page: ${page.title} (${page.slug})`);
    console.log(`ID: ${page.id}`);
    console.log(`Type: ${page.type}`);
    
    const hasContent = page.content && typeof page.content === "object" && "blocks" in page.content;
    const blockCount = hasContent ? (page.content as any).blocks.length : 0;
    console.log(`Block count: ${blockCount}`);
    
    if (blockCount > 0) {
      console.log("First block type:", (page.content as any).blocks[0]?.type);
      console.log("All block types:", (page.content as any).blocks.map((b: any) => b.type));
    } else {
      console.log("Content is empty or malformed");
    }
    
    console.log("---");
  }
  
  await prisma.$disconnect();
}

analyzePerfumesContent()
  .then(() => {
    console.log("\n✅ Analysis complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
