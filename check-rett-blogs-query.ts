import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter});

async function checkRettBlogs() {
  console.log("=== Checking rett site blogs ===\n");

  const site = await prisma.site.findUnique({
    where: { slug: "rett" },
    include: {
      blogs: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!site) {
    console.log("Site not found");
    return;
  }

  console.log(`Site: ${site.slug} (${site.id})`);
  console.log(`Total PUBLISHED blogs: ${site.blogs.length}\n`);

  for (const blog of site.blogs) {
    console.log(`- ${blog.title} (${blog.slug})`);
    console.log(`  Status: ${blog.status}`);
    console.log(`  Published: ${blog.publishedAt}`);
    console.log(`  Created: ${blog.createdAt}`);
    console.log(`  Category: ${blog.category || 'none'}`);
  }
}

checkRettBlogs()
  .then(() => {
    console.log("\nCheck complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Check failed:", error);
    process.exit(1);
  });
