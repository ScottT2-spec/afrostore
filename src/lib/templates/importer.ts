import { prisma } from "@/lib/db";
import { TEMPLATES } from "@/lib/templates/catalog";
import { FASHION_TEMPLATE_PRESET } from "@/lib/templates/presets/fashion-preset";
import { FASHION_SAMPLE_PRODUCTS } from "@/lib/templates/presets/fashion-sample-products";
import { FASHION_SAMPLE_BLOGS } from "@/lib/templates/presets/fashion-sample-blogs";

/**
 * Import a template into a site by:
 * 1. Upserting a Template record in the DB
 * 2. Creating a SiteTemplate linking the site to that template
 * 3. Creating a HOME page with editable blocks (or htmlEmbed fallback)
 * 4. Creating sample products so the store isn't empty
 */
export async function importTemplateToSite(
  siteId: string,
  input: {
    templateId?: string | null;
    templateSlug?: string | null;
    variant?: string | null;
  }
) {
  const slug = input.templateSlug || input.templateId;
  if (!slug) {
    return { template: null, siteTemplate: null, pages: [], themeConfig: {}, reused: false };
  }

  // Find the template in our catalog
  const catalogEntry = TEMPLATES.find((t) => t.slug === slug);
  if (!catalogEntry) {
    console.warn(`Template "${slug}" not found in catalog`);
    return { template: null, siteTemplate: null, pages: [], themeConfig: {}, reused: false };
  }

  // Upsert the Template record in DB
  const template = await prisma.template.upsert({
    where: { slug: catalogEntry.slug },
    update: {
      name: catalogEntry.name,
      category: catalogEntry.category,
      description: catalogEntry.description,
      previewImage: catalogEntry.previewImage,
      previewUrl: `/templates/${catalogEntry.file}`,
    },
    create: {
      name: catalogEntry.name,
      slug: catalogEntry.slug,
      category: catalogEntry.category,
      description: catalogEntry.description,
      previewImage: catalogEntry.previewImage,
      previewUrl: `/templates/${catalogEntry.file}`,
      recommendationKeywords: catalogEntry.industries,
      themeConfig: {},
      active: true,
    },
  });

  // Check if SiteTemplate already exists (avoid duplicates)
  const existing = await prisma.siteTemplate.findUnique({
    where: { siteId_templateId: { siteId, templateId: template.id } },
  });

  let siteTemplate;
  if (existing) {
    // If template already exists but isn't active, activate it
    if (!existing.isActive) {
      // Deactivate any other active templates for this site
      await prisma.siteTemplate.updateMany({
        where: { siteId, isActive: true },
        data: { isActive: false },
      });
      siteTemplate = await prisma.siteTemplate.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
    } else {
      siteTemplate = existing;
    }
  } else {
    // Deactivate any other active templates for this site
    await prisma.siteTemplate.updateMany({
      where: { siteId, isActive: true },
      data: { isActive: false },
    });

    siteTemplate = await prisma.siteTemplate.create({
      data: {
        siteId,
        templateId: template.id,
        variant: input.variant || null,
        themeConfig: {},
        isActive: true,
        customHtml: null,
      },
    });
  }

  // Build blocks for the HOME page
  // For templates with editable block presets, use those instead of htmlEmbed
  const TEMPLATE_PRESETS: Record<string, typeof FASHION_TEMPLATE_PRESET> = {
    fashion: FASHION_TEMPLATE_PRESET,
  };

  const preset = TEMPLATE_PRESETS[catalogEntry.slug];
  const homeBlocks = preset
    ? preset
    : [
        {
          id: `htmlEmbed-${template.slug}`,
          type: "htmlEmbed",
          props: {
            src: `/templates/${catalogEntry.file}`,
            minHeight: "100vh",
            title: `${catalogEntry.name} Template`,
          },
        },
      ];

  const homeContent = JSON.parse(JSON.stringify({ blocks: homeBlocks, settings: {} }));

  // Create or update the HOME page
  const existingHome = await prisma.page.findFirst({
    where: { siteId, type: "HOME" },
  });

  let homePage;
  if (existingHome) {
    // Always update the page content when using a template preset to ensure blocks are loaded
    const existingContent = existingHome.content as Record<string, unknown> | null;
    const existingBlocks = Array.isArray(existingContent)
      ? existingContent
      : Array.isArray((existingContent as Record<string, unknown>)?.blocks)
        ? (existingContent as Record<string, unknown>).blocks
        : [];

    // Update if page has no content OR if we're using a preset template (to ensure blocks are loaded)
    if (!Array.isArray(existingBlocks) || (existingBlocks as unknown[]).length === 0 || preset) {
      console.log(`[Template Import] Updating existing HOME page with ${homeBlocks.length} blocks for template "${catalogEntry.slug}"`);
      homePage = await prisma.page.update({
        where: { id: existingHome.id },
        data: {
          content: homeContent,
          isPublished: true,
        },
      });
    } else {
      console.log(`[Template Import] HOME page already has ${existingBlocks.length} blocks, skipping update`);
      homePage = existingHome;
    }
  } else {
    console.log(`[Template Import] Creating new HOME page with ${homeBlocks.length} blocks for template "${catalogEntry.slug}"`);
    homePage = await prisma.page.create({
      data: {
        siteId,
        title: "Home",
        slug: "home",
        type: "HOME",
        content: homeContent,
        isPublished: true,
        position: 0,
      },
    });
  }

  // ── Create sample products for templates that have them ──
  let sampleProducts: unknown[] = [];
  const SAMPLE_PRODUCTS: Record<string, typeof FASHION_SAMPLE_PRODUCTS> = {
    fashion: FASHION_SAMPLE_PRODUCTS,
  };

  const samples = SAMPLE_PRODUCTS[catalogEntry.slug];
  if (samples && samples.length > 0) {
    // Check if site already has products (don't add samples twice)
    const existingProductCount = await prisma.product.count({ where: { siteId } });
    if (existingProductCount === 0) {
      // Get the site's currency
      const site = await prisma.site.findUnique({ where: { id: siteId }, select: { currency: true } });
      const currency = site?.currency || "USD";

      for (const sample of samples) {
        const product = await prisma.product.create({
          data: {
            siteId,
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

        sampleProducts.push(product);
      }
    }
  }

  // ── Create sample blog posts for templates that have them ──
  let sampleBlogs: unknown[] = [];
  const SAMPLE_BLOGS: Record<string, typeof FASHION_SAMPLE_BLOGS> = {
    fashion: FASHION_SAMPLE_BLOGS,
  };

  const blogSamples = SAMPLE_BLOGS[catalogEntry.slug];
  if (blogSamples && blogSamples.length > 0) {
    // Check if site already has blog posts (don't add samples twice)
    const existingBlogCount = await prisma.blog.count({ where: { siteId } });
    if (existingBlogCount === 0) {
      for (const sample of blogSamples) {
        const blog = await prisma.blog.create({
          data: {
            siteId,
            title: sample.title,
            slug: sample.slug,
            excerpt: sample.excerpt,
            content: { html: sample.contentHtml },
            contentHtml: sample.contentHtml,
            coverImage: sample.coverImage,
            author: sample.author,
            category: sample.category,
            tags: sample.tags,
            status: sample.status,
            publishedAt: new Date(),
          },
        });
        sampleBlogs.push(blog);
      }
    }
  }

  return {
    template,
    siteTemplate,
    pages: [homePage],
    sampleProducts,
    sampleBlogs,
    themeConfig: {},
    reused: !!existing,
  };
}
