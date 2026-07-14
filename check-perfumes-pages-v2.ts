import { prisma } from "./src/lib/db";

async function main() {
  // Find a perfumes site
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

  console.log("Perfumes sites found:", JSON.stringify(sites, null, 2));

  if (sites.length === 0) {
    console.log("No perfumes sites found. Checking all sites...");
    const allSites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
      take: 10,
    });
    console.log("First 10 sites:", JSON.stringify(allSites, null, 2));
    return;
  }

  const siteId = sites[0].id;
  console.log(`\nChecking pages for site: ${sites[0].name} (${sites[0].slug})`);

  // Query all pages for this site with slug "contact" or "about"
  const pages = await prisma.page.findMany({
    where: {
      siteId,
      slug: { in: ["contact", "about"] },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
    },
  });

  console.log("\nPages with slug 'contact' or 'about':");
  console.log(JSON.stringify(pages, null, 2));

  // Check for duplicates
  const slugCounts = pages.reduce((acc, page) => {
    acc[page.slug] = (acc[page.slug] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const duplicates = Object.entries(slugCounts).filter(([slug, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log("\n⚠️ DUPLICATE PAGES FOUND:");
    duplicates.forEach(([slug, count]) => {
      console.log(`  Slug "${slug}": ${count} rows`);
    });
  } else {
    console.log("\n✓ No duplicate pages found");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
