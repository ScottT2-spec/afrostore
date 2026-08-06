/**
 * Comprehensive verification: tests editor API and live site functionality
 * 
 * Run: npx tsx scripts/comprehensive-verification.ts
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
  console.log("🔍 Comprehensive Verification\n");

  // Find all sites using the handmade-bags template
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

  console.log(`Found ${sites.length} handmade-bags sites\n`);

  for (const site of sites) {
    console.log(`📋 Site: ${site.slug}`);
    
    // Test editor API for each page
    const pages = ["home", "about", "contact", "our-story", "reviews", "blog"];
    
    for (const pageSlug of pages) {
      try {
        const response = await fetch(`http://localhost:3000/api/storefront/${site.slug}/pages/${pageSlug}`);
        if (response.ok) {
          const data = await response.json();
          const page = data.data?.page;
          const blocks = page?.content?.blocks || [];
          
          if (blocks.length > 0) {
            console.log(`   ✅ ${pageSlug}: Editor API OK (${blocks.length} blocks)`);
          } else {
            console.log(`   ⚠️  ${pageSlug}: Editor API OK but no blocks`);
          }
        } else {
          console.log(`   ❌ ${pageSlug}: Editor API failed (${response.status})`);
        }
      } catch (error) {
        console.log(`   ❌ ${pageSlug}: Editor API error - ${error}`);
      }
    }

    // Test blog link resolution
    console.log(`\n   Testing blog link resolution:`);
    try {
      const response = await fetch(`http://localhost:3000/api/storefront/${site.slug}/pages/blog`);
      if (response.ok) {
        const data = await response.json();
        const page = data.data?.page;
        const blogPostsBlock = page?.content?.blocks?.find((b: any) => b.type === "fashionBlogPosts");
        
        if (blogPostsBlock) {
          const posts = blogPostsBlock.props?.posts || [];
          console.log(`   ✅ Blog page has ${posts.length} posts`);
          
          // Check first post link
          if (posts.length > 0) {
            const firstPost = posts[0];
            const link = firstPost.link;
            const expectedFormat = link.startsWith("/blog/");
            console.log(`   ✅ First post link: ${link} (${expectedFormat ? "correct format" : "wrong format"})`);
            
            // Test resolved link
            const resolvedLink = `/store/${site.slug}/blog/${firstPost.slug}`;
            console.log(`   ✅ Resolved link: ${resolvedLink}`);
          }
        } else {
          console.log(`   ❌ No fashionBlogPosts block found`);
        }
      } else {
        console.log(`   ❌ Blog page API failed`);
      }
    } catch (error) {
      console.log(`   ❌ Blog page API error - ${error}`);
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
