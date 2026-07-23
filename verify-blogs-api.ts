import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function verifyBlogsAPI() {
  console.log("Verifying blogs in Blog table for dfregtt site...");

  // Find the dfregtt site
  const site = await prisma.site.findUnique({
    where: { slug: "dfregtt" },
  });

  if (!site) {
    console.log("Site not found");
    return;
  }

  console.log(`Site ID: ${site.id}`);

  // Query all blogs for this site
  const blogs = await prisma.blog.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\nFound ${blogs.length} blog posts:`);
  for (const blog of blogs) {
    console.log(`  - ${blog.title} (slug: ${blog.slug}, status: ${blog.status})`);
  }

  // Expected: 6 entries (2 original blogs + 4 project pages)
  const expectedSlugs = [
    "style-living-room-like-pro",
    "minimalist-design-less-is-more",
    "project-look-deep-into-nature",
    "project-just-living-is-not-enough",
    "project-adopt-the-pace-of-nature",
    "project-go-along-with-nature",
  ];

  const foundSlugs = blogs.map(b => b.slug);
  const missingSlugs = expectedSlugs.filter(slug => !foundSlugs.includes(slug));

  if (missingSlugs.length > 0) {
    console.log(`\nMissing slugs: ${missingSlugs.join(", ")}`);
  } else {
    console.log("\n✓ All expected blog posts found");
  }
}

verifyBlogsAPI()
  .then(() => {
    console.log("Verification complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
