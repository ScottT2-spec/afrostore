import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Add sample products to perfumes sites to populate Fragrances grid
 */

const SAMPLE_PRODUCTS = [
  {
    name: "Etheria Rose Absolute",
    slug: "etheria-rose-absolute",
    description: "A delicate rose absolute with soft musk and dewy accords.",
    price: 125,
    compareAtPrice: 150,
    categorySlug: "etheria",
    images: ["https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-product-1-430x491.jpg"],
  },
  {
    name: "Etheria White Musk",
    slug: "etheria-white-musk",
    description: "Weightless white musk capturing the essence of air and light.",
    price: 95,
    compareAtPrice: 110,
    categorySlug: "etheria",
    images: ["https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-product-2-430x491.jpg"],
  },
  {
    name: "Celeste Aura Citrus",
    slug: "celeste-aura-citrus",
    description: "Vibrant citrus with shimmering aldehydes creating inner glow.",
    price: 135,
    compareAtPrice: 160,
    categorySlug: "celeste-aura",
    images: ["https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-product-3-430x491.jpg"],
  },
  {
    name: "Opus Essence Amber",
    slug: "opus-essence-amber",
    description: "Rich amber with deep florals and precious woods.",
    price: 175,
    compareAtPrice: 200,
    categorySlug: "opus-essence",
    images: ["https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-product-4-430x491.jpg"],
  },
  {
    name: "Opus Essence Oud",
    slug: "opus-essence-oud",
    description: "Complex oud composition with warm ambers.",
    price: 225,
    compareAtPrice: 250,
    categorySlug: "opus-essence",
    images: ["https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-product-5-430x491.jpg"],
  },
  {
    name: "Velours Noir Leather",
    slug: "velours-noir-leather",
    description: "Dark velvety fragrance with leather accords and black vanilla.",
    price: 195,
    compareAtPrice: 220,
    categorySlug: "velours-noir",
    images: ["https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-product-6-430x491.jpg"],
  },
  {
    name: "Nocturne Essence Night",
    slug: "nocturne-essence-night",
    description: "Cool musks with aromatic herbs capturing twilight elegance.",
    price: 145,
    compareAtPrice: 170,
    categorySlug: "nocturne-essence",
    images: ["https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-product-7-430x491.jpg"],
  },
  {
    name: "Elysian Bloom Green",
    slug: "elysian-bloom-green",
    description: "Fresh green fragrance with dewy petals and earthy vetiver.",
    price: 115,
    compareAtPrice: 135,
    categorySlug: "elysian-bloom",
    images: ["https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-product-8-430x491.jpg"],
  },
];

async function seedPerfumesProducts() {
  console.log("🔄 Seeding sample products for perfumes sites...\n");

  const sites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          template: { slug: "perfumes" },
          isActive: true,
        },
      },
    },
  });

  console.log(`Found ${sites.length} sites using perfumes template\n`);

  for (const site of sites) {
    console.log(`📝 Processing site: ${site.name} (${site.slug})`);

    // Get existing categories
    const categories = await prisma.category.findMany({
      where: { siteId: site.id },
      select: { slug: true, id: true },
    });
    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

    // Check existing products
    const existingProducts = await prisma.product.findMany({
      where: { siteId: site.id },
      select: { slug: true },
    });
    const existingSlugs = new Set(existingProducts.map(p => p.slug));

    for (const product of SAMPLE_PRODUCTS) {
      if (existingSlugs.has(product.slug)) {
        console.log(`   ⊘ Skipping existing: ${product.name}`);
        continue;
      }

      const categoryId = categoryMap.get(product.categorySlug);
      if (!categoryId) {
        console.log(`   ⊘ Skipping ${product.name} - category ${product.categorySlug} not found`);
        continue;
      }

      await prisma.product.create({
        data: {
          siteId: site.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          categoryId: categoryId,
          images: {
            create: product.images.map(url => ({ url })),
          },
          status: "ACTIVE",
          stock: 100,
        },
      });
      console.log(`   ✓ Created: ${product.name}`);
    }
  }

  console.log("\n✅ Sample products seeded successfully!");
}

seedPerfumesProducts()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
