/**
 * Verification script: checks that Handmade Bags pages have full editable blocks
 * 
 * Run: npx tsx scripts/verify-handmade-bags-fix.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  HANDMADE_BAGS_ABOUT_BLOCKS,
  HANDMADE_BAGS_CONTACT_BLOCKS,
  HANDMADE_BAGS_OUR_STORY_BLOCKS,
  HANDMADE_BAGS_REVIEWS_BLOCKS,
  HANDMADE_BAGS_BLOG_BLOCKS,
} from "../src/lib/templates/presets/handmade-bags-pages";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Verifying Handmade Bags Page Blocks\n");

  const expectedPages = {
    about: HANDMADE_BAGS_ABOUT_BLOCKS,
    contact: HANDMADE_BAGS_CONTACT_BLOCKS,
    "our-story": HANDMADE_BAGS_OUR_STORY_BLOCKS,
    reviews: HANDMADE_BAGS_REVIEWS_BLOCKS,
    blog: HANDMADE_BAGS_BLOG_BLOCKS,
  };

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
    
    for (const [pageSlug, expectedBlocks] of Object.entries(expectedPages)) {
      const page = await prisma.page.findUnique({
        where: { siteId_slug: { siteId: site.id, slug: pageSlug } },
        select: { id: true, content: true },
      });

      if (!page) {
        console.log(`   ❌ ${pageSlug}: Page not found`);
        continue;
      }

      const content = page.content as any;
      const blocks = Array.isArray(content) ? content : [];
      
      if (blocks.length === 0) {
        console.log(`   ❌ ${pageSlug}: No blocks (expected ${expectedBlocks.length})`);
        continue;
      }

      if (blocks.length !== expectedBlocks.length) {
        console.log(`   ⚠️  ${pageSlug}: Has ${blocks.length} blocks (expected ${expectedBlocks.length})`);
      } else {
        console.log(`   ✅ ${pageSlug}: Has ${blocks.length} blocks (correct)`);
      }

      // Check blog links specifically
      if (pageSlug === "blog") {
        const blogPostsBlock = blocks.find((b: any) => b.type === "fashionBlogPosts");
        if (!blogPostsBlock) {
          console.log(`   ❌ ${pageSlug}: No fashionBlogPosts block found`);
        } else {
          const posts = (blogPostsBlock.props?.posts as any[]) || [];
          console.log(`   ✅ ${pageSlug}: fashionBlogPosts has ${posts.length} posts`);
          
          let linkIssues = 0;
          for (const post of posts) {
            if (!post.link) {
              console.log(`   ❌ ${pageSlug}: Post missing link: ${post.title}`);
              linkIssues++;
            } else if (!post.link.startsWith("/blog/")) {
              console.log(`   ❌ ${pageSlug}: Post has invalid link: ${post.link}`);
              linkIssues++;
            }
          }
          
          if (linkIssues === 0) {
            console.log(`   ✅ ${pageSlug}: All blog post links are correctly formatted`);
          }
        }
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
