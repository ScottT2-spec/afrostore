import "dotenv/config";
import { prisma } from "./src/lib/db";
import { TEMPLATE_SAMPLE_DATA } from "./src/lib/templates/presets/template-sample-data";

async function seedKidsProductsAndBlogs() {
  console.log('=== SEEDING KIDS PRODUCTS AND BLOGS FROM TEMPLATE DATA ===\n');

  try {
    const kidsSites = await prisma.site.findMany({
      where: {
        slug: { in: ['kids', 'kids2', 'kids3', 'kids4', 'Kids'] }
      },
      include: {
        templates: {
          where: { isActive: true },
          include: { template: true }
        }
      }
    });

    const templateData = TEMPLATE_SAMPLE_DATA['kids'];
    if (!templateData) {
      console.error('Kids template data not found');
      return;
    }

    let updatedProducts = 0;
    let updatedBlogs = 0;
    let updatedCategories = 0;

    for (const site of kidsSites) {
      console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
      
      // Get site currency
      const currency = site.currency || "USD";

      // ── Update Categories ──────────────────────────────────────
      console.log('  Updating categories...');
      const existingCategories = await prisma.category.findMany({ 
        where: { siteId: site.id },
        select: { id: true, slug: true }
      });
      const catSlugToId: Record<string, string> = {};
      for (const c of existingCategories) catSlugToId[c.slug] = c.id;

      for (const cat of templateData.categories) {
        const existingCat = existingCategories.find(c => c.slug === cat.slug);
        if (existingCat) {
          await prisma.category.update({
            where: { id: existingCat.id },
            data: {
              name: cat.name,
              description: cat.description || "",
              image: cat.image || null,
              position: cat.position ?? 0,
            }
          });
          updatedCategories++;
        } else {
          const created = await prisma.category.create({
            data: {
              siteId: site.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description || "",
              image: cat.image || null,
              position: cat.position ?? 0,
            },
          });
          catSlugToId[cat.slug] = created.id;
          updatedCategories++;
        }
      }

      // Refresh category map after updates
      const allCategories = await prisma.category.findMany({ 
        where: { siteId: site.id }, 
        select: { id: true, slug: true } 
      });
      for (const c of allCategories) catSlugToId[c.slug] = c.id;

      // ── Update Products ───────────────────────────────────────────
      console.log('  Updating products...');
      const existingProducts = await prisma.product.findMany({ 
        where: { siteId: site.id },
        include: { images: true }
      });

      // Get slugs of products we want to keep
      const templateProductSlugs = templateData.products.map(p => p.slug);

      // Delete products that are not in the new template data
      for (const existingProduct of existingProducts) {
        if (!templateProductSlugs.includes(existingProduct.slug)) {
          await prisma.productImage.deleteMany({ where: { productId: existingProduct.id } });
          await prisma.product.delete({ where: { id: existingProduct.id } });
          console.log(`    Deleted old product: ${existingProduct.name}`);
        }
      }

      // Create or update products from template data
      for (const sample of templateData.products) {
        const existingProduct = existingProducts.find(p => p.slug === sample.slug);
        const categoryId = sample.category ? catSlugToId[sample.category] || null : null;

        if (existingProduct) {
          // Update existing product
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: sample.name,
              description: sample.description || "",
              price: sample.price,
              compareAtPrice: sample.compareAtPrice || null,
              currency,
              stock: sample.stock ?? 10,
              isFeatured: sample.isFeatured ?? false,
              tags: sample.tags || [],
              position: sample.position ?? 0,
              ...(categoryId ? { categoryId } : {}),
            }
          });

          // Update images
          await prisma.productImage.deleteMany({ where: { productId: existingProduct.id } });
          if (sample.images && sample.images.length > 0) {
            for (let i = 0; i < sample.images.length; i++) {
              await prisma.productImage.create({
                data: {
                  productId: existingProduct.id,
                  url: sample.images[i],
                  alt: sample.name,
                  position: i,
                },
              });
            }
          }
          updatedProducts++;
        } else {
          // Create new product
          const product = await prisma.product.create({
            data: {
              siteId: site.id,
              name: sample.name,
              slug: sample.slug,
              description: sample.description || "",
              price: sample.price,
              compareAtPrice: sample.compareAtPrice || null,
              currency,
              stock: sample.stock ?? 10,
              status: "ACTIVE",
              isFeatured: sample.isFeatured ?? false,
              tags: sample.tags || [],
              position: sample.position ?? 0,
              ...(categoryId ? { categoryId } : {}),
            },
          });

          // Create product images
          if (sample.images && sample.images.length > 0) {
            for (let i = 0; i < sample.images.length; i++) {
              await prisma.productImage.create({
                data: {
                  productId: product.id,
                  url: sample.images[i],
                  alt: sample.name,
                  position: i,
                },
              });
            }
          }
          updatedProducts++;
        }
      }

      // ── Update Blogs ─────────────────────────────────────────────
      console.log('  Updating blogs...');
      const existingBlogs = await prisma.blog.findMany({ 
        where: { siteId: site.id }
      });

      // Get slugs of blogs we want to keep
      const templateBlogSlugs = templateData.blogs.map(b => b.slug);

      // Delete blogs that are not in the new template data
      for (const existingBlog of existingBlogs) {
        if (!templateBlogSlugs.includes(existingBlog.slug)) {
          await prisma.blog.delete({ where: { id: existingBlog.id } });
          console.log(`    Deleted old blog: ${existingBlog.title}`);
        }
      }

      for (const sample of templateData.blogs) {
        const existingBlog = existingBlogs.find(b => b.slug === sample.slug);

        if (existingBlog) {
          await prisma.blog.update({
            where: { id: existingBlog.id },
            data: {
              title: sample.title,
              excerpt: sample.excerpt,
              content: { text: sample.content },
              contentHtml: sample.content.split("\n\n").map((p: string) => `<p>${p}</p>`).join(""),
              coverImage: sample.coverImage,
              author: sample.author,
              category: sample.category,
              tags: sample.tags,
              status: "PUBLISHED",
              publishedAt: new Date(),
            }
          });
          updatedBlogs++;
        } else {
          await prisma.blog.create({
            data: {
              siteId: site.id,
              title: sample.title,
              slug: sample.slug,
              excerpt: sample.excerpt,
              content: { text: sample.content },
              contentHtml: sample.content.split("\n\n").map((p: string) => `<p>${p}</p>`).join(""),
              coverImage: sample.coverImage,
              author: sample.author,
              category: sample.category,
              tags: sample.tags,
              status: "PUBLISHED",
              publishedAt: new Date(),
            },
          });
          updatedBlogs++;
        }
      }

      console.log(`  ✓ Updated ${templateData.categories.length} categories`);
      console.log(`  ✓ Updated ${templateData.products.length} products`);
      console.log(`  ✓ Updated ${templateData.blogs.length} blogs`);
    }

    console.log(`\n=== SEEDING COMPLETE ===`);
    console.log(`Total categories updated: ${updatedCategories}`);
    console.log(`Total products updated: ${updatedProducts}`);
    console.log(`Total blogs updated: ${updatedBlogs}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedKidsProductsAndBlogs();
