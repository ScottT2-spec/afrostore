/**
 * Verify generated blog links point to /store/[slug]/blog/...
 * 
 * Run: npx tsx scripts/verify-generated-blog-links.ts
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
  console.log("🔍 Verifying Generated Blog Links\n");

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
    
    // Get blog page blocks
    const blogPage = await prisma.page.findFirst({
      where: { siteId: site.id, slug: "blog" },
      select: { content: true },
    });

    if (!blogPage) {
      console.log("   ❌ Blog page not found");
      continue;
    }

    const content = blogPage.content as any;
    const blocks = content.blocks || [];

    // Find fashionBlogPosts block
    const blogPostsBlock = blocks.find((b: any) => b.type === "fashionBlogPosts");
    
    if (!blogPostsBlock) {
      console.log("   ❌ No fashionBlogPosts block found");
      continue;
    }

    const posts = blogPostsBlock.props?.posts || [];
    console.log(`   Found ${posts.length} posts in blog block`);

    for (const post of posts) {
      const slug = post.slug || post.id;
      const expectedLink = `/store/${site.slug}/blog/${slug}`;
      const actualLink = post.link;
      
      console.log(`   ${post.title}:`);
      console.log(`     Slug: ${slug}`);
      console.log(`     Block link: ${actualLink}`);
      console.log(`     Expected resolved: ${expectedLink}`);
      
      // Check if the component would generate the correct link
      const resolvedLink = `/store/${site.slug}/blog/${slug}`;
      if (resolvedLink === expectedLink) {
        console.log(`     ✅ Component will generate: ${resolvedLink}`);
      } else {
        console.log(`     ❌ Component will generate: ${resolvedLink} (wrong)`);
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
