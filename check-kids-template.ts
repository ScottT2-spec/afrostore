import { config } from "dotenv";
config();
import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const templates = await prisma.template.findMany();
  console.log('All templates:', templates.map(t => ({ id: t.id, name: t.name, slug: t.slug })));
  
  const kidsTemplate = templates.find(t => t.name.toLowerCase().includes('kids') || t.slug.toLowerCase().includes('kids'));
  console.log('Kids template:', kidsTemplate);
  
  const sites = await prisma.site.findMany({ 
    where: { status: 'ACTIVE' },
    include: { templates: { include: { template: true } } } 
  });
  console.log('Active sites count:', sites.length);
  
  const kidsSites = sites.filter(s => s.templates.some(st => st.template.slug.toLowerCase().includes('kids')));
  console.log('Kids sites:', kidsSites.map(s => ({ id: s.id, name: s.name, slug: s.slug, templateSlug: s.templates[0]?.template?.slug })));
  
  if (kidsSites.length > 0) {
    const firstKidsSite = kidsSites[0];
    const blogs = await prisma.blog.findMany({ 
      where: { siteId: firstKidsSite.id, status: 'PUBLISHED' }
    });
    console.log(`Blogs for ${firstKidsSite.slug}:`, blogs.length, blogs.map(b => ({ id: b.id, title: b.title, slug: b.slug })));
  }
  
  // Check which templates have active sites
  const supportedTemplates = ['t-shirts-prints', 'tshirts-prints', 'handmade-bags', 'health', 'pills', 'retail', 'decor', 'kids', 'kids-world'];
  const activeTemplateSlugs = [...new Set(sites.map(s => s.templates[0]?.template?.slug).filter(Boolean))];
  console.log('Active template slugs:', activeTemplateSlugs);
  
  const unsupportedTemplates = activeTemplateSlugs.filter(slug => !supportedTemplates.includes(slug));
  console.log('Templates with active sites but NOT supported in blog page:', unsupportedTemplates);
  
  // Count sites per unsupported template
  const unsupportedCounts = unsupportedTemplates.map(slug => ({
    slug,
    count: sites.filter(s => s.templates[0]?.template?.slug === slug).length
  }));
  console.log('Sites per unsupported template:', unsupportedCounts);
  
  // Check blog counts for all Kids sites
  console.log('\n--- Kids sites blog counts ---');
  for (const kidsSite of kidsSites) {
    const blogs = await prisma.blog.findMany({ 
      where: { siteId: kidsSite.id, status: 'PUBLISHED' }
    });
    console.log(`${kidsSite.slug}: ${blogs.length} blog posts`);
  }
  
  // Check blog page blocks for neur site
  console.log('\n--- neur site blog page blocks ---');
  const neurSite = await prisma.site.findUnique({
    where: { slug: 'neur' },
    include: { 
      pages: true
    }
  });
  
  if (neurSite && neurSite.pages && neurSite.pages.length > 0) {
    const blogPage = neurSite.pages.find((p: any) => p.slug === 'blog');
    if (blogPage) {
      console.log('Blog page found:', blogPage.slug);
      console.log('Content type:', typeof blogPage.content);
      console.log('Content length:', blogPage.content?.length);
      if (blogPage.content) {
        const content = typeof blogPage.content === 'string' ? JSON.parse(blogPage.content) : blogPage.content;
        console.log('Blocks in blog page:', content.blocks?.map((b: any) => ({ type: b.type, id: b.id })));
        console.log('First block details:', JSON.stringify(content.blocks?.[0], null, 2));
        console.log('Has blocks?', content.blocks?.length > 0);
        console.log('Raw content:', blogPage.content);
      } else {
        console.log('Blog page has no content - will use template presets');
      }
    } else {
      console.log('No blog page found for neur site');
    }
  } else {
    console.log('No pages found for neur site');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
