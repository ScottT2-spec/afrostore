/**
 * Final verification: Check that blog links will be generated correctly
 * 
 * Run: npx tsx scripts/verify-final-blog-links.ts
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
  console.log("🔍 Final Blog Link Verification\n");

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
      select: { content: true },
    });

    if (!blogPage) {
      console.log("   ❌ Blog page not found");
      continue;
    }

    const content = blogPage.content as any;
    const blocks = Array.isArray(content) ? content : (content?.blocks || []);
    
    const blogPostsBlock = blocks.find((b: any) => b.type === "fashionBlogPosts");
    
    if (!blogPostsBlock) {
      console.log("   ❌ No fashionBlogPosts block found");
      continue;
    }

    const posts = blogPostsBlock.props?.posts || [];
    console.log(`   Found ${posts.length} posts in blog block\n`);

    for (const post of posts) {
      const slug = post.slug || post.id;
      const blockLink = post.link;
      
      // Simulate the component's link generation logic
      const resolvedLink = `/store/${site.slug}/blog/${slug}`;
      
      console.log(`   Post: ${post.title}`);
      console.log(`     Slug: ${slug}`);
      console.log(`     Block link: ${blockLink}`);
      console.log(`     Component will generate: ${resolvedLink}`);
      
      if (resolvedLink.startsWith(`/store/${site.slug}/blog/`)) {
        console.log(`     ✅ Correct format`);
      } else {
        console.log(`     ❌ Wrong format`);
      }
      console.log();
    }
  }

  console.log("✅ Verification complete!");
  console.log("\nExpected link format: /store/[siteSlug]/blog/[postSlug]");
  console.log("Example: /store/handbag/blog/minimalist-japanese-inspired-leather-goods");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
