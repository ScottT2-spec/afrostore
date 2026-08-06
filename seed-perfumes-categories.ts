import "dotenv/config";
import { prisma } from "@/lib/db";

/**
 * Create perfumes categories for sites that are missing them
 */

const PERFUMES_CATEGORIES = [
  { name: "Étheria", slug: "etheria" },
  { name: "Celeste Aura", slug: "celeste-aura" },
  { name: "Opus Essence", slug: "opus-essence" },
  { name: "Velours Noir", slug: "velours-noir" },
  { name: "Nocturne Essence", slug: "nocturne-essence" },
  { name: "Elysian Bloom", slug: "elysian-bloom" },
];

async function seedPerfumesCategories() {
  console.log("🔄 Seeding perfumes categories...\n");

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

    const existingCategories = await prisma.category.findMany({
      where: { siteId: site.id },
      select: { slug: true },
    });
    const existingSlugs = new Set(existingCategories.map(c => c.slug));

    for (const category of PERFUMES_CATEGORIES) {
      if (existingSlugs.has(category.slug)) {
        console.log(`   ⊘ Skipping existing: ${category.name}`);
        continue;
      }

      await prisma.category.create({
        data: {
          siteId: site.id,
          name: category.name,
          slug: category.slug,
        },
      });
      console.log(`   ✓ Created: ${category.name}`);
    }
  }

  console.log("\n✅ Perfumes categories seeded successfully!");
}

seedPerfumesCategories()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
