/**
 * Check actual blog page content structure
 * 
 * Run: npx tsx scripts/check-blog-page-content.ts
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
  console.log("🔍 Checking Blog Page Content Structure\n");

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
    
    const blogPage = await prisma.page.findFirst({
      where: { siteId: site.id, slug: "blog" },
      select: { id: true, content: true },
    });

    if (!blogPage) {
      console.log("   ❌ Blog page not found");
      continue;
    }

    const content = blogPage.content;
    console.log(`   Content type: ${typeof content}`);
    console.log(`   Content: ${JSON.stringify(content).substring(0, 500)}...`);
    
    if (Array.isArray(content)) {
      console.log(`   ✅ Is array with ${content.length} blocks`);
      const blogPostsBlock = content.find((b: any) => b.type === "fashionBlogPosts");
      if (blogPostsBlock) {
        console.log(`   ✅ Found fashionBlogPosts block`);
        const posts = blogPostsBlock.props?.posts || [];
        console.log(`   Posts count: ${posts.length}`);
        if (posts.length > 0) {
          console.log(`   First post slug: ${posts[0].slug}`);
          console.log(`   First post link: ${posts[0].link}`);
        }
      } else {
        console.log(`   ❌ No fashionBlogPosts block found`);
      }
    } else if (content && typeof content === 'object') {
      console.log(`   ⚠️  Is object, checking for blocks property`);
      if (content.blocks) {
        console.log(`   Has blocks: yes (${content.blocks.length} blocks)`);
        const blogPostsBlock = content.blocks.find((b: any) => b.type === "fashionBlogPosts");
        if (blogPostsBlock) {
          console.log(`   ✅ Found fashionBlogPosts block`);
          const posts = blogPostsBlock.props?.posts || [];
          console.log(`   Posts count: ${posts.length}`);
          if (posts.length > 0) {
            console.log(`   First post slug: ${posts[0].slug}`);
            console.log(`   First post link: ${posts[0].link}`);
          }
        } else {
          console.log(`   ❌ No fashionBlogPosts block found`);
        }
      } else {
        console.log(`   Has blocks: no`);
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
