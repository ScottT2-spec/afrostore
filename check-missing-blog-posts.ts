import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter});

const MISSING_TITLES = [
  "Creating a Cozy Home with Natural Materials",
  "10 Easy Ways to Brighten Your Garden",
];

async function checkMissingBlogPosts() {
  console.log("=== Checking for missing blog posts across Retail/Decor sites ===\n");

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

  console.log(`Found ${retailSites.length} Retail/Decor sites\n`);

  for (const title of MISSING_TITLES) {
    console.log(`--- Checking for: "${title}" ---`);

    for (const site of retailSites) {
      const blog = await prisma.blog.findFirst({
        where: {
          siteId: site.id,
          title: title,
        },
      });

      if (blog) {
        console.log(`  ${site.slug}: FOUND`);
        console.log(`    ID: ${blog.id}`);
        console.log(`    Slug: ${blog.slug}`);
        console.log(`    Status: ${blog.status}`);
        console.log(`    Category: ${blog.category || 'none'}`);
        console.log(`    Tags: ${blog.tags?.join(', ') || 'none'}`);
        console.log(`    Content type: ${typeof blog.content}`);
        console.log(`    ContentHtml type: ${typeof blog.contentHtml}`);
        console.log(`    Content populated: ${blog.content !== null && blog.content !== undefined}`);
        console.log(`    ContentHtml populated: ${blog.contentHtml !== null && blog.contentHtml !== undefined}`);
      } else {
        console.log(`  ${site.slug}: NOT FOUND`);
      }
    }
    console.log(`\n`);
  }
}

checkMissingBlogPosts()
  .then(() => {
    console.log("Check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Check failed:", error);
    process.exit(1);
  });
