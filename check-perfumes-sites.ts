import { prisma } from "./src/lib/db";

async function main() {
  const sites = await prisma.site.findMany({
    where: {
      OR: [
        { slug: { contains: "parfum" } },
        { slug: { contains: "perfum" } },
        { name: { contains: "perfum", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
  });

  console.log("Perfumes sites:", JSON.stringify(sites, null, 2));

  if (sites.length > 0) {
    const siteId = sites[0].id;
    const pages = await prisma.page.findMany({
      where: { siteId, slug: "contact" },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
      },
    });
    console.log("\nContact pages:", JSON.stringify(pages, null, 2));
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
