import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkKidsProductImages() {
  console.log('=== CHECKING KIDS PRODUCT IMAGES ===\n');

  try {
    const kidsSites = await prisma.site.findMany({
      where: {
        slug: { in: ['kids', 'kids2', 'kids3', 'kids4', 'Kids'] }
      }
    });

    for (const site of kidsSites) {
      console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
      
      const products = await prisma.product.findMany({
        where: { siteId: site.id },
        include: { images: true },
        orderBy: { position: 'asc' }
      });

      console.log(`  Total products: ${products.length}`);
      
      for (const product of products) {
        console.log(`\n  Product: ${product.name}`);
        console.log(`    Slug: ${product.slug}`);
        console.log(`    Images: ${product.images.length}`);
        for (const img of product.images) {
          console.log(`      - ${img.url} (position: ${img.position})`);
        }
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkKidsProductImages();
