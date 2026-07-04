import { prisma } from "@/lib/db";
import { TEMPLATES } from "@/lib/templates/catalog";

/**
 * Import a template into a site by:
 * 1. Upserting a Template record in the DB
 * 2. Creating a SiteTemplate linking the site to that template
 * 3. Creating a HOME page with an htmlEmbed block pointing to the static template HTML
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
    siteTemplate = existing;
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

  // Build the htmlEmbed block for the HOME page
  const templateUrl = `/templates/${catalogEntry.file}`;
  const homeBlocks = [
    {
      id: `htmlEmbed-${template.slug}`,
      type: "htmlEmbed",
      props: {
        src: templateUrl,
        minHeight: "100vh",
        title: `${catalogEntry.name} Template`,
      },
    },
  ];

  const homeContent = { blocks: homeBlocks, settings: {} };

  // Create or update the HOME page
  const existingHome = await prisma.page.findFirst({
    where: { siteId, type: "HOME" },
  });

  let homePage;
  if (existingHome) {
    // Only update if the page has no content yet
    const existingContent = existingHome.content as Record<string, unknown> | null;
    const existingBlocks = Array.isArray(existingContent)
      ? existingContent
      : Array.isArray((existingContent as Record<string, unknown>)?.blocks)
        ? (existingContent as Record<string, unknown>).blocks
        : [];

    if (!Array.isArray(existingBlocks) || (existingBlocks as unknown[]).length === 0) {
      homePage = await prisma.page.update({
        where: { id: existingHome.id },
        data: {
          content: homeContent,
          isPublished: true,
        },
      });
    } else {
      homePage = existingHome;
    }
  } else {
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

  return {
    template,
    siteTemplate,
    pages: [homePage],
    themeConfig: {},
    reused: !!existing,
  };
}
