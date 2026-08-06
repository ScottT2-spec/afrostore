import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const PROJECT_SLUGS = [
  "project-look-deep-into-nature",
  "project-just-living-is-not-enough",
  "project-adopt-the-pace-of-nature",
  "project-go-along-with-nature",
];

async function backfillProjectLinksToBlog() {
  console.log("Starting backfill of project links to /blog/ routes...");

  // Find all Retail/Decor sites
  const retailSites = await prisma.site.findMany({
    where: {
      status: "ACTIVE",
      templates: {
        some: {
          template: {
            slug: { in: ["retail", "decor"] },
          },
          isActive: true,
        },
      },
    },
  });

  console.log(`Found ${retailSites.length} Retail/Decor sites`);

  for (const site of retailSites) {
    console.log(`\nProcessing site: ${site.slug} (${site.id})`);

    // Find the projects listing page
    const projectsPage = await prisma.page.findUnique({
      where: {
        siteId_slug: {
          siteId: site.id,
          slug: "projects",
        },
      },
    });

    if (!projectsPage) {
      console.log(`  - Projects page not found (skipping)`);
      continue;
    }

    const content = projectsPage.content as any;
    if (!content || !content.blocks || !Array.isArray(content.blocks)) {
      console.log(`  - Projects page has no blocks (skipping)`);
      continue;
    }

    let updated = false;
    const updatedBlocks = content.blocks.map((block: any) => {
      if (block.type === "projects" && block.props && block.props.items) {
        const updatedItems = block.props.items.map((item: any) => {
          if (item.link && PROJECT_SLUGS.some(slug => item.link === `/${slug}`)) {
            updated = true;
            return { ...item, link: `/blog${item.link}` };
          }
          return item;
        });
        return { ...block, props: { ...block.props, items: updatedItems } };
      }
      return block;
    });

    if (updated) {
      await prisma.page.update({
        where: { id: projectsPage.id },
        data: { content: { blocks: updatedBlocks } as any },
      });
      console.log(`  - Updated project links to /blog/ routes`);
    } else {
      console.log(`  - No project links needed updating`);
    }
  }

  console.log("\nBackfill complete!");
}

backfillProjectLinksToBlog()
  .then(() => {
    console.log("Script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });
