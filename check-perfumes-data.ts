import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Check if perfumes sites have actual blog posts and products
 */

async function checkPerfumesData() {
  console.log("🔍 Checking perfumes sites for blog posts and products...\n");

  const parfumSite = await prisma.site.findFirst({
    where: { slug: "parfum" },
  });

  if (!parfumSite) {
    console.log("❌ parfum site not found");
    return;
  }

  console.log(`📝 Site: ${parfumSite.name} (${parfumSite.slug})\n`);

  const blogs = await prisma.blog.findMany({
    where: { siteId: parfumSite.id, status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, coverImage: true, publishedAt: true },
  });

  const products = await prisma.product.findMany({
    where: { siteId: parfumSite.id, status: "ACTIVE" },
    include: { category: { select: { slug: true, name: true } } },
  });

  console.log(`📰 Blog Posts: ${blogs.length}`);
  blogs.forEach((blog, i) => {
    console.log(`   ${i + 1}. ${blog.title} (${blog.slug}) - ${blog.coverImage ? 'has image' : 'no image'}`);
  });

  console.log(`\n🛍️ Products: ${products.length}`);
  const categoryGroups: Record<string, any[]> = {};
  products.forEach((product) => {
    const catSlug = product.category?.slug || 'uncategorized';
    if (!categoryGroups[catSlug]) categoryGroups[catSlug] = [];
    categoryGroups[catSlug].push(product);
  });

  Object.entries(categoryGroups).forEach(([catSlug, prods]) => {
    console.log(`   ${catSlug}: ${prods.length} products`);
  });
}

checkPerfumesData()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
