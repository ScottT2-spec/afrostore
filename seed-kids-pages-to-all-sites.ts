import "dotenv/config";
import { prisma } from "./src/lib/db";
import { ensureTemplatePages } from "./src/lib/templates/template-pages";

async function seedKidsPagesToAllSites() {
  console.log('Seeding Kids pages to all Kids template sites...\n');
  
  try {
    // Find all sites using the Kids template
    const sites = await prisma.site.findMany({
      where: {
        templates: {
          some: {
            template: {
              slug: 'kids'
            },
            isActive: true
          }
        }
      },
      include: {
        templates: {
          where: { isActive: true },
          include: {
            template: true
          }
        },
        pages: {
          orderBy: { position: 'asc' }
        }
      }
    });

    console.log(`Found ${sites.length} Kids template sites\n`);

    for (const site of sites) {
      console.log(`=== Processing site: ${site.name} (${site.slug}) ===`);
      
      // Seed pages with force update to ensure content is applied
      await ensureTemplatePages(site.id, "kids", true);
      
      console.log(`✓ Pages seeded for ${site.name}\n`);
    }

    console.log('✓ All Kids template sites have been seeded with page content');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedKidsPagesToAllSites();
