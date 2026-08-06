import "dotenv/config";
import { prisma } from "./src/lib/db";

async function findAllSitesWithKids() {
  console.log('Finding all sites with Kids template (any status)...\n');
  
  try {
    // Find all sites with any status
    const allSites = await prisma.site.findMany({
      include: {
        templates: {
          include: {
            template: true
          }
        }
      }
    });

    console.log(`Total sites: ${allSites.length}\n`);

    const kidsSites = allSites.filter(site => 
      site.templates.some(st => st.template.slug === 'kids')
    );

    console.log(`Sites with Kids template: ${kidsSites.length}\n`);

    for (const site of kidsSites) {
      console.log(`- ${site.name} (${site.slug}) - Status: ${site.status} - ID: ${site.id}`);
      const kidsTemplate = site.templates.find(t => t.template.slug === 'kids');
      console.log(`  Kids template active: ${kidsTemplate?.isActive}`);
      console.log(`  Active template: ${site.templates.find(t => t.isActive)?.template.name}`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

findAllSitesWithKids();
