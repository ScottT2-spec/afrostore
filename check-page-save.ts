import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkPageSave() {
  console.log('Checking page save for Kids site...\n');
  
  try {
    // Find the most recently modified Kids site page
    const page = await prisma.page.findFirst({
      where: {
        site: {
          templates: {
            some: {
              template: {
                slug: 'kids'
              },
              isActive: true
            }
          }
        },
        slug: 'about'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        site: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    });

    if (!page) {
      console.log('No About page found for Kids site');
      return;
    }

    console.log(`=== Page: ${page.title} (${page.slug}) ===`);
    console.log(`Site: ${page.site.name} (${page.site.slug})`);
    console.log(`Last updated: ${page.updatedAt}\n`);

    const content = page.content as any;
    console.log('Content structure:');
    if (content && content.blocks) {
      console.log(`  Blocks count: ${content.blocks.length}`);
      content.blocks.forEach((b: any, idx: number) => {
        console.log(`    ${idx + 1}. ${b.type} (${b.id})`);
      });
    } else {
      console.log('  No blocks found');
      console.log(`  Raw content: ${JSON.stringify(content).substring(0, 300)}`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkPageSave();
