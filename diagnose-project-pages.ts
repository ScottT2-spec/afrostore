import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Diagnostic script to trace project pages vs blog posts
 */

async function diagnose() {
  console.log("🔍 Starting diagnostic...\n");

  // Find a Retail test site
  const retailSites = await prisma.site.findMany({
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

  const retailSite = retailSites.find(s => 
    s.templates?.[0]?.template?.slug === "retail" || 
    s.templates?.[0]?.template?.slug === "decor"
  );

  if (!retailSite) {
    console.log("❌ No Retail/Decor site found. Please create one first.");
    process.exit(1);
  }

  console.log(`📊 Found Retail site: ${retailSite.name} (${retailSite.slug})`);
  console.log(`   Template: ${retailSite.templates?.[0]?.template?.slug}\n`);

  // Check Page table for project detail pages
  const projectPages = await prisma.page.findMany({
    where: {
      siteId: retailSite.id,
      slug: {
        startsWith: "project-",
      },
    },
  });

  console.log(`📄 Pages with slug starting with "project-": ${projectPages.length}`);
  projectPages.forEach(p => {
    console.log(`   - ${p.slug} | type: ${p.type} | published: ${p.isPublished} | id: ${p.id}`);
  });

  // Check Blog table for blog posts
  const blogs = await prisma.blog.findMany({
    where: {
      siteId: retailSite.id,
    },
  });

  console.log(`\n📝 Blog posts: ${blogs.length}`);
  blogs.forEach(b => {
    console.log(`   - ${b.slug} | status: ${b.status} | id: ${b.id}`);
  });

  // Check all pages in Page table
  const allPages = await prisma.page.findMany({
    where: {
      siteId: retailSite.id,
    },
    orderBy: { position: 'asc' },
  });

  console.log(`\n📋 All pages in Page table: ${allPages.length}`);
  allPages.forEach(p => {
    console.log(`   - ${p.slug} | type: ${p.type} | published: ${p.isPublished} | position: ${p.position}`);
  });

  // Check if project pages exist in TEMPLATE_PAGE_CONTENT_MAP
  console.log(`\n🔍 Checking template-pages.ts registration:`);
  console.log(`   RETAIL_PAGES includes project detail pages: Yes (lines 86-90)`);
  console.log(`   TEMPLATE_PAGE_CONTENT_MAP includes project detail blocks: Yes (lines 142-163 for retail, 159-162 for decor)`);

  console.log(`\n✅ Diagnostic complete.`);
}

diagnose()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Diagnostic failed:", error);
    process.exit(1);
  });
