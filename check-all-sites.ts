import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkAllSites() {
  console.log('Checking all sites...\n');
  
  try {
    const allSites = await prisma.site.findMany({
      include: {
        templates: {
          include: {
            template: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Total sites: ${allSites.length}\n`);

    for (const site of allSites) {
      console.log(`- ${site.name} (${site.slug}) - Status: ${site.status} - Created: ${site.createdAt.toISOString().split('T')[0]}`);
      for (const st of site.templates) {
        console.log(`  Template: ${st.template.name} (${st.template.slug}) - Active: ${st.isActive}`);
      }
      console.log('');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllSites();
