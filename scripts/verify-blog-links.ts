/**
 * Verify blog links work without 404
 * 
 * Run: npx tsx scripts/verify-blog-links.ts
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
  console.log("🔍 Verifying Blog Links\n");

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
    
    // Check blog posts exist in DB
    const blogPosts = await prisma.blog.findMany({
      where: { siteId: site.id, status: "PUBLISHED" },
      select: { id: true, title: true, slug: true },
    });
    
    console.log(`   Found ${blogPosts.length} blog posts in DB`);
    
    for (const post of blogPosts) {
      const expectedUrl = `/store/${site.slug}/blog/${post.slug}`;
      console.log(`   ✅ ${post.title}: ${expectedUrl}`);
      
      // Test the API endpoint
      try {
        const response = await fetch(`http://localhost:3000/api/storefront/${site.slug}/blogs/${post.slug}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            console.log(`      ✅ API returns data for ${post.slug}`);
          } else {
            console.log(`      ❌ API returns error for ${post.slug}: ${data.error}`);
          }
        } else {
          console.log(`      ❌ API returns ${response.status} for ${post.slug}`);
        }
      } catch (error) {
        console.log(`      ❌ API fetch error for ${post.slug}: ${error}`);
      }
    }
    
    console.log();
  }

  console.log("✅ Verification complete!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
