import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Test what happens when we request a project detail page
 */

async function testProjectRoute() {
  console.log("🧪 Testing project route resolution...\n");

  // Find the Retail site
  const allSites = await prisma.site.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      templates: {
        where: { isActive: true },
        include: { template: true },
        take: 1,
      },
    },
  });

  const retailSite = allSites.find(s => 
    s.templates?.[0]?.template?.slug === "retail" || 
    s.templates?.[0]?.template?.slug === "decor"
  );

  if (!retailSite) {
    console.log("❌ No Retail/Decor site found");
    console.log("Available sites:");
    allSites.forEach(s => {
      console.log(`   - ${s.name} (${s.slug}) | template: ${s.templates?.[0]?.template?.slug}`);
    });
    process.exit(1);
  }

  const site = retailSite;

  console.log(`📊 Site: ${site.name} (${site.slug})`);
  console.log(`   Template: ${site.templates?.[0]?.template?.slug}\n`);

  // Test: Try to find the page like the API does
  const pageSlug = "project-go-along-with-nature";
  
  const page = await prisma.page.findFirst({
    where: {
      siteId: site.id,
      slug: pageSlug,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      content: true,
      isPublished: true,
    },
  });

  console.log(`🔍 Looking for page with slug: ${pageSlug}`);
  if (page) {
    console.log(`✅ Found in Page table:`);
    console.log(`   id: ${page.id}`);
    console.log(`   title: ${page.title}`);
    console.log(`   type: ${page.type}`);
    console.log(`   isPublished: ${page.isPublished}`);
    console.log(`   content exists: ${!!page.content}`);
    console.log(`   content type: ${typeof page.content}`);
    if (page.content && typeof page.content === 'object') {
      console.log(`   has blocks: ${!!(page.content as any).blocks}`);
      console.log(`   blocks length: ${(page.content as any).blocks?.length || 0}`);
    }
  } else {
    console.log(`❌ NOT found in Page table`);
  }

  // Check if there's a matching blog entry
  const blog = await prisma.blog.findFirst({
    where: {
      siteId: site.id,
      slug: pageSlug,
    },
  });

  console.log(`\n🔍 Looking for blog with slug: ${pageSlug}`);
  if (blog) {
    console.log(`✅ Found in Blog table:`);
    console.log(`   id: ${blog.id}`);
    console.log(`   title: ${blog.title}`);
    console.log(`   status: ${blog.status}`);
  } else {
    console.log(`❌ NOT found in Blog table`);
  }

  // Check the 2 blog posts that exist
  const allBlogs = await prisma.blog.findMany({
    where: { siteId: site.id },
  });

  console.log(`\n📝 All blogs in site:`);
  allBlogs.forEach(b => {
    console.log(`   - ${b.slug} | status: ${b.status}`);
  });

  // Check if there are pages for these blog slugs
  console.log(`\n🔍 Checking if blog slugs exist as pages:`);
  for (const blog of allBlogs) {
    const matchingPage = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: blog.slug,
      },
    });
    console.log(`   Blog slug: ${blog.slug} -> Page exists: ${!!matchingPage}`);
  }

  console.log(`\n✅ Test complete.`);
}

testProjectRoute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });
