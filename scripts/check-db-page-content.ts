/**
 * Check actual database page content
 * 
 * Run: npx tsx scripts/check-db-page-content.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Checking Database Page Content\n");

  const sites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          isActive: true,
          template: { slug: "handmade-bags" },
        },
      },
    },
    select: { id: true, slug: true },
  });

  for (const site of sites) {
    console.log(`📋 Site: ${site.slug}`);
    
    const pages = await prisma.page.findMany({
      where: { siteId: site.id },
      select: { id: true, slug: true, content: true },
    });

    for (const page of pages) {
      const content = page.content as any;
      console.log(`   ${page.slug}:`);
      console.log(`     Content type: ${typeof content}`);
      console.log(`     Content: ${JSON.stringify(content).substring(0, 200)}...`);
      
      if (Array.isArray(content)) {
        console.log(`     ✅ Is array with ${content.length} blocks`);
      } else if (content && typeof content === 'object') {
        console.log(`     ⚠️  Is object, checking for blocks property`);
        console.log(`     Has blocks: ${content.blocks ? 'yes' : 'no'}`);
        if (content.blocks) {
          console.log(`     Blocks count: ${content.blocks.length}`);
        }
      } else {
        console.log(`     ❌ Invalid content structure`);
      }
    }
    console.log();
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
