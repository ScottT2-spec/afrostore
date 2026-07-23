import { prisma } from './src/lib/db';

async function checkBlogPosts() {
  const sites = await prisma.site.findMany({
    where: { 
      OR: [
        { slug: 'handbag' },
        { slug: 'dewqa' },
        { slug: 'handmade-bags' }
      ]
    },
    select: { id: true, slug: true, name: true }
  });
  
  console.log('Found sites:', sites);
  
  for (const site of sites) {
    console.log(`\n=== Site: ${site.name} (${site.slug}) ===`);
    
    const blogs = await prisma.blog.findMany({
      where: { siteId: site.id },
      select: { id: true, slug: true, title: true, status: true }
    });
    
    console.log(`Blog posts count: ${blogs.length}`);
    blogs.forEach(blog => {
      console.log(`  - ${blog.slug}: ${blog.title} (${blog.status})`);
    });
  }
}

checkBlogPosts()
  .then(() => process.exit(0))
  .catch(err => { 
    console.error(err); 
    process.exit(1); 
  });
