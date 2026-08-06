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

async function migrateProjectPagesToBlog() {
  console.log("Starting migration of project pages to Blog table...");

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
    include: {
      templates: {
        where: { isActive: true },
        include: { template: true },
      },
    },
  });

  console.log(`Found ${retailSites.length} Retail/Decor sites`);

  for (const site of retailSites) {
    console.log(`\nProcessing site: ${site.slug} (${site.id})`);

    for (const projectSlug of PROJECT_SLUGS) {
      // Find the project page in the Page table
      const projectPage = await prisma.page.findUnique({
        where: {
          siteId_slug: {
            siteId: site.id,
            slug: projectSlug,
          },
        },
      });

      if (!projectPage) {
        console.log(`  - Project page not found: ${projectSlug} (skipping)`);
        continue;
      }

      // Check if a blog post with this slug already exists
      const existingBlog = await prisma.blog.findUnique({
        where: {
          siteId_slug: {
            siteId: site.id,
            slug: projectSlug,
          },
        },
      });

      if (existingBlog) {
        console.log(`  - Blog post already exists: ${projectSlug} (skipping)`);
        continue;
      }

      // Create the blog post
      const blogPost = await prisma.blog.create({
        data: {
          siteId: site.id,
          title: projectPage.title,
          slug: projectSlug,
          excerpt: projectPage.metaDescription || null,
          content: projectPage.content,
          contentHtml: null, // Will be generated if needed
          coverImage: null, // Can be set from project content if needed
          author: "Design Team",
          category: "Projects",
          tags: ["project", "retail"],
          status: "PUBLISHED",
          metaTitle: projectPage.metaTitle,
          metaDescription: projectPage.metaDescription,
          publishedAt: projectPage.createdAt,
        },
      });

      console.log(`  - Created blog post: ${projectSlug} (ID: ${blogPost.id})`);

      // Delete the old page record
      await prisma.page.delete({
        where: { id: projectPage.id },
      });

      console.log(`  - Deleted old page record: ${projectSlug}`);
    }
  }

  console.log("\nMigration complete!");
}

migrateProjectPagesToBlog()
  .then(() => {
    console.log("Script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
