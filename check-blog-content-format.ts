import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function checkBlogContentFormat() {
  console.log("Checking blog content format for dfregtt site...");

  const site = await prisma.site.findUnique({
    where: { slug: "dfregtt" },
  });

  if (!site) {
    console.log("Site not found");
    return;
  }

  // Check the working blog post
  const workingBlog = await prisma.blog.findUnique({
    where: {
      siteId_slug: {
        siteId: site.id,
        slug: "style-living-room-like-pro",
      },
    },
  });

  console.log("\n=== Working blog post (style-living-room-like-pro) ===");
  console.log("Content type:", typeof workingBlog?.content);
  console.log("Content value:", JSON.stringify(workingBlog?.content, null, 2));
  console.log("ContentHtml type:", typeof workingBlog?.contentHtml);
  console.log("ContentHtml length:", workingBlog?.contentHtml?.length);

  // Check a migrated project blog post
  const projectBlog = await prisma.blog.findUnique({
    where: {
      siteId_slug: {
        siteId: site.id,
        slug: "project-go-along-with-nature",
      },
    },
  });

  console.log("\n=== Migrated project blog (project-go-along-with-nature) ===");
  console.log("Content type:", typeof projectBlog?.content);
  console.log("Content value:", JSON.stringify(projectBlog?.content, null, 2));
  console.log("ContentHtml type:", typeof projectBlog?.contentHtml);
  console.log("ContentHtml length:", projectBlog?.contentHtml?.length);
}

checkBlogContentFormat()
  .then(() => {
    console.log("Check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Check failed:", error);
    process.exit(1);
  });
