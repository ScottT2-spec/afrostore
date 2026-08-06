import "dotenv/config";
import { prisma } from "./src/lib/db";

async function inspectKidsPageContent() {
  console.log('Inspecting Kids template page content structure...\n');
  
  try {
    const sites = await prisma.site.findMany({
      where: {
        OR: [
          { slug: 'kids3' },
          { slug: 'kids4' },
        ]
      },
      include: {
        pages: {
          orderBy: { position: 'asc' }
        }
      }
    });

    for (const site of sites) {
      console.log(`=== Site: ${site.name} (${site.slug}) ===`);
      
      for (const page of site.pages) {
        console.log(`\n  Page: ${page.title} (${page.slug})`);
        const content = page.content as any;
        
        console.log(`  Content structure:`, JSON.stringify(content, null, 2).substring(0, 500));
        
        if (content && content.blocks) {
          console.log(`  Blocks count: ${content.blocks.length}`);
          content.blocks.forEach((block: any, idx: number) => {
            console.log(`    Block ${idx}: type=${block.type}, id=${block.id}`);
          });
        }
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectKidsPageContent();
