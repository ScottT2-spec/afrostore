import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Check actual content of perfumes blocks to see if they have real data or placeholders
 */

async function checkPerfumesBlockContent() {
  console.log("🔍 Checking perfumes block content...\n");

  const parfumSite = await prisma.site.findFirst({
    where: { slug: "parfum" },
    include: {
      pages: {
        where: {
          slug: { in: ["about", "contact", "journal", "fragrances"] }
        },
        orderBy: { position: "asc" },
      },
    },
  });
  
  if (!parfumSite) {
    console.log("Site not found");
    return;
  }
  
  console.log("=== PARFUM SITE BLOCK CONTENT DETAILS ===\n");
  
  for (const page of parfumSite.pages) {
    console.log(`\n📄 Page: ${page.title} (${page.slug})`);
    console.log(`ID: ${page.id}`);
    
    const hasContent = page.content && typeof page.content === "object" && "blocks" in page.content;
    const blockCount = hasContent ? (page.content as any).blocks.length : 0;
    console.log(`Block count: ${blockCount}`);
    
    if (blockCount > 0) {
      const blocks = (page.content as any).blocks;
      console.log("\nBlocks:");
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        console.log(`  ${i + 1}. Type: ${block.type}`);
        console.log(`     ID: ${block.id}`);
        
        // Check if props have meaningful content
        const props = block.props || {};
        const propKeys = Object.keys(props);
        console.log(`     Props keys: ${propKeys.length > 0 ? propKeys.join(", ") : "none"}`);
        
        // Show a sample of the props content
        if (propKeys.length > 0) {
          const sampleKey = propKeys[0];
          const sampleValue = props[sampleKey];
          if (typeof sampleValue === "string") {
            console.log(`     Sample prop (${sampleKey}): "${sampleValue.substring(0, 50)}${sampleValue.length > 50 ? "..." : ""}"`);
          } else if (Array.isArray(sampleValue)) {
            console.log(`     Sample prop (${sampleKey}): Array with ${sampleValue.length} items`);
          } else {
            console.log(`     Sample prop (${sampleKey}): ${typeof sampleValue}`);
          }
        }
      }
    }
  }
  
  await prisma.$disconnect();
}

checkPerfumesBlockContent()
  .then(() => {
    console.log("\n✅ Block content check complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
