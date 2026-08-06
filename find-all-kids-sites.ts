import "dotenv/config";
import { prisma } from "./src/lib/db";

async function findAllKidsSites() {
  console.log('Finding all Kids template sites...\n');
  
  try {
    // Find all sites with any template
    const allSites = await prisma.site.findMany({
      where: {
        status: "ACTIVE"
      },
      include: {
        templates: {
          include: {
            template: true
          }
        }
      }
    });

    console.log(`Total active sites: ${allSites.length}\n`);

    const kidsSites = allSites.filter(site => 
      site.templates.some(st => st.template.slug === 'kids' && st.isActive)
    );

    console.log(`Kids template sites: ${kidsSites.length}\n`);

    for (const site of kidsSites) {
      console.log(`- ${site.name} (${site.slug}) - ID: ${site.id}`);
      const activeTemplate = site.templates.find(t => t.isActive);
      console.log(`  Active template: ${activeTemplate?.template.name} (${activeTemplate?.template.slug})`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

findAllKidsSites();
