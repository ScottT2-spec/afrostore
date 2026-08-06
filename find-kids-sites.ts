const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  // Find templates with 'kids' in slug or name
  const templates = await prisma.template.findMany({
    where: {
      OR: [
        { slug: { contains: 'kids', mode: 'insensitive' } },
        { name: { contains: 'kids', mode: 'insensitive' } }
      ]
    }
  });
  
  console.log('Templates with kids:', templates.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })));
  
  // Find sites using these templates
  for (const template of templates) {
    const siteTemplates = await prisma.siteTemplate.findMany({
      where: { templateId: template.id },
      include: {
        site: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
    
    console.log(`\nSites using template "${template.name}" (${template.slug}):`);
    siteTemplates.forEach((st: any) => {
      console.log(`  - ${st.site.name} (${st.site.slug}) - ID: ${st.site.id}`);
    });
  }
  
  // Also check pages with kids template
  const pages = await prisma.page.findMany({
    where: {
      OR: [
        { template: { contains: 'kids', mode: 'insensitive' } },
        { template: { equals: 'kids' } }
      ]
    },
    select: { id: true, title: true, slug: true, template: true, siteId: true }
  });
  
  console.log(`\nPages with kids template (${pages.length}):`);
  pages.forEach((p: any) => {
    console.log(`  - ${p.title} (${p.slug}) - template: ${p.template} - siteId: ${p.siteId}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
