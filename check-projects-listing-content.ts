import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Query the actual stored block content of the projects LISTING page
 * to check if link values are stale or updated
 */

async function checkProjectsListingContent() {
  console.log("🔍 Checking projects listing page content...\n");

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
    process.exit(1);
  }

  console.log(`📊 Site: ${retailSite.name} (${retailSite.slug})\n`);

  // Get the projects listing page
  const projectsPage = await prisma.page.findFirst({
    where: {
      siteId: retailSite.id,
      slug: "projects",
    },
  });

  if (!projectsPage) {
    console.log("❌ Projects listing page not found");
    process.exit(1);
  }

  console.log(`📄 Projects listing page found:`);
  console.log(`   id: ${projectsPage.id}`);
  console.log(`   title: ${projectsPage.title}`);
  console.log(`   type: ${projectsPage.type}`);
  console.log(`   isPublished: ${projectsPage.isPublished}`);
  console.log(`   content exists: ${!!projectsPage.content}\n`);

  if (!projectsPage.content) {
    console.log("❌ No content stored");
    process.exit(1);
  }

  const content = projectsPage.content as any;
  console.log(`📦 Content structure:`);
  console.log(`   type: ${typeof content}`);
  console.log(`   has blocks: ${!!content.blocks}`);
  console.log(`   blocks length: ${content.blocks?.length || 0}\n`);

  if (!content.blocks || !Array.isArray(content.blocks)) {
    console.log("❌ No blocks array found");
    process.exit(1);
  }

  // Find the projects block (type: "projects")
  const projectsBlock = content.blocks.find((b: any) => b.type === "projects");
  
  if (!projectsBlock) {
    console.log("❌ No 'projects' type block found");
    console.log("Available block types:", content.blocks.map((b: any) => b.type));
    process.exit(1);
  }

  console.log(`🎯 Found projects block:`);
  console.log(`   id: ${projectsBlock.id}`);
  console.log(`   type: ${projectsBlock.type}`);
  console.log(`   has props: ${!!projectsBlock.props}`);
  console.log(`   has items: ${!!projectsBlock.props?.items}\n`);

  if (!projectsBlock.props?.items || !Array.isArray(projectsBlock.props.items)) {
    console.log("❌ No items array in projects block");
    process.exit(1);
  }

  console.log(`📋 Project items (${projectsBlock.props.items.length}):\n`);
  projectsBlock.props.items.forEach((item: any, index: number) => {
    console.log(`   Item ${index + 1}:`);
    console.log(`     title: ${item.title}`);
    console.log(`     link: ${item.link}`);
    console.log(`     linkText: ${item.linkText}`);
    console.log("");
  });

  console.log(`✅ Check complete.`);
}

checkProjectsListingContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Check failed:", error);
    process.exit(1);
  });
