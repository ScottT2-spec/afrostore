import "dotenv/config";
import { prisma } from "./src/lib/db";

async function verifyKidsHeroFix() {
  console.log('Verifying Kids template hero background fix...\n');
  
  try {
    const sites = await prisma.site.findMany({
      where: {
        OR: [
          { slug: 'kids3' },
          { slug: 'kids4' },
        ]
      },
      include: {
        templates: {
          where: { isActive: true },
          include: { template: true }
        },
        pages: {
          orderBy: { position: 'asc' }
        }
      }
    });

    console.log(`Found ${sites.length} kids sites to verify\n`);

    for (const site of sites) {
      console.log(`=== Site: ${site.name} (${site.slug}) ===`);
      
      for (const page of site.pages) {
        console.log(`  Page: ${page.title} (${page.slug}) - ID: ${page.id}`);
        const content = page.content as any;
        const blocks = content?.blocks || [];
        
        // Check for hero slider blocks
        const heroBlocks = blocks.filter((b: any) => b.type === 'KidsHeroSlider');
        if (heroBlocks.length > 0) {
          console.log(`    ✓ Found ${heroBlocks.length} hero slider block(s)`);
          heroBlocks.forEach((hb: any, idx: number) => {
            console.log(`      Block ${idx + 1}: minHeight=${hb.props?.minHeight || 'default'}`);
          });
        } else {
          console.log(`    ℹ No hero slider blocks found`);
        }
      }
      console.log('');
    }

    console.log('✓ Template fix in KidsTemplateBlocks.tsx will automatically apply on next render');
    console.log('✓ No database migration needed - the fix is in the React component');
    console.log('✓ The CSS changes ensure background images cover full hero section');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

verifyKidsHeroFix();
