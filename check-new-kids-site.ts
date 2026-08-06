import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkNewKidsSite() {
  console.log('Checking newly created Kids site...\n');
  
  try {
    // Find the most recently created Kids site
    const site = await prisma.site.findFirst({
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
      orderBy: {
        createdAt: 'desc'
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

    if (!site) {
      console.log('No Kids site found');
      return;
    }

    console.log(`=== Site: ${site.name} (${site.slug}) - ID: ${site.id} ===`);
    console.log(`Created: ${site.createdAt}\n`);

    console.log('Active Template:');
    const activeTemplate = site.templates[0];
    console.log(`  Template: ${activeTemplate.template.name} (${activeTemplate.template.slug})`);
    console.log(`  Variant: ${activeTemplate.variant}`);
    console.log(`  Has pages in template: ${activeTemplate.pages ? 'Yes' : 'No'}`);
    if (activeTemplate.pages) {
      console.log(`  Template pages count: ${Object.keys(activeTemplate.pages).length}`);
      console.log(`  Template page slugs: ${Object.keys(activeTemplate.pages).join(', ')}`);
    }
    console.log('');

    console.log('Pages in database:');
    for (const page of site.pages) {
      console.log(`  - ${page.title} (${page.slug}) - Type: ${page.type} - Published: ${page.isPublished}`);
      const content = page.content as any;
      if (content) {
        if (content.blocks && Array.isArray(content.blocks)) {
          console.log(`    Blocks: ${content.blocks.length} blocks`);
          content.blocks.forEach((b: any, idx: number) => {
            console.log(`      ${idx + 1}. ${b.type} (${b.id})`);
          });
        } else if (content.sections && Array.isArray(content.sections)) {
          console.log(`    Sections: ${content.sections.length} sections`);
          content.sections.forEach((s: any, idx: number) => {
            console.log(`      ${idx + 1}. ${s.type} (${s.id})`);
          });
        } else {
          console.log(`    Content structure: ${JSON.stringify(content).substring(0, 200)}`);
        }
      } else {
        console.log(`    No content`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewKidsSite();
