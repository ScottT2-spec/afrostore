import { prisma } from "./src/lib/db";

async function checkAegisPage() {
  try {
    // Find any page with aegis-related content
    const pages = await prisma.page.findMany({
      where: {
        OR: [
          { title: { contains: "aegis", mode: "insensitive" } },
          { slug: { contains: "aegis", mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
      },
      take: 3,
    });

    console.log("Found pages:", pages.length);
    
    if (pages.length === 0) {
      console.log("No aegis pages found. Checking for any pages with content...");
      const anyPages = await prisma.page.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
        },
        take: 3,
      });
      console.log("Sample pages:", JSON.stringify(anyPages, null, 2));
    } else {
      console.log("Aegis pages:");
      pages.forEach(page => {
        console.log(`\n--- Page: ${page.title} (${page.slug}) ---`);
        console.log("Content structure:", JSON.stringify(page.content, null, 2));
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAegisPage();
