import { prisma } from "@/lib/db";
import type { PageType, Prisma } from "@/generated/prisma";
import { getTemplateByIdOrSlug, mergeBranding } from "./recommendation";
import type { TemplateDefinition, TemplateSelectionInput, ThemeConfig } from "./types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function normalizePageType(type: string): PageType {
  const allowed: PageType[] = ["HOME", "ABOUT", "CONTACT", "FAQ", "POLICY", "CUSTOM", "LANDING", "SERVICES", "TEAM", "KNOWLEDGE_BASE", "THANK_YOU"];
  return allowed.includes(type as PageType) ? (type as PageType) : "CUSTOM";
}

export function buildImportedTemplatePages(input: TemplateSelectionInput, template: TemplateDefinition) {
  const packagePages = template.package?.pages || [];
  const themedPages = packagePages.length > 0 ? packagePages : template.themeConfig.sections.length > 0 ? [{
    title: "Home",
    slug: "home",
    type: "HOME" as PageType,
    metaTitle: `${template.name} — Home`,
    metaDescription: template.description,
    blocks: clone(template.themeConfig.sections),
  }] : [];

  return themedPages.map((page) => ({
    title: page.title,
    slug: page.slug,
    type: normalizePageType(page.type),
    content: clone(page.blocks),
    metaTitle: page.metaTitle || `${page.title} — ${template.name}`,
    metaDescription: page.metaDescription || template.description,
    settings: clone(page.settings || {}),
  }));
}

async function getExistingImport(siteId: string, templateId: string) {
  return prisma.siteTemplate.findFirst({
    where: { siteId, templateId, isActive: true },
    select: {
      id: true,
      variant: true,
      themeConfig: true,
      pages: true,
      customHtml: true,
      template: { select: { id: true, name: true, slug: true } },
    },
  });
}

async function replaceSitePages(siteId: string, template: TemplateDefinition, pages: ReturnType<typeof buildImportedTemplatePages>) {
  await prisma.page.deleteMany({ where: { siteId } });

  await prisma.page.createMany({
    data: pages.map((page, position) => ({
      siteId,
      title: page.title,
      slug: page.slug,
      type: page.type,
      content: asJson({ blocks: page.content, settings: page.settings || {} }),
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      template: template.slug,
      isPublished: true,
      position,
    })),
  });
}

async function replaceThemeRecords(siteId: string, template: TemplateDefinition, themeConfig: ThemeConfig) {
  await prisma.siteTemplate.updateMany({
    where: { siteId },
    data: { isActive: false },
  });

  const siteTemplate = await prisma.siteTemplate.upsert({
    where: { siteId_templateId: { siteId, templateId: template.id || template.slug } },
    create: {
      siteId,
      templateId: template.id || template.slug,
      variant: template.variants?.[0]?.name || null,
      themeConfig: asJson(themeConfig),
      pages: asJson(template.package?.pages || []),
      isActive: true,
    },
    update: {
      variant: template.variants?.[0]?.name || null,
      themeConfig: asJson(themeConfig),
      pages: asJson(template.package?.pages || []),
      isActive: true,
    },
  });

  await prisma.siteCustomization.upsert({
    where: { siteId },
    create: {
      siteId,
      themeSettings: {
        colors: themeConfig.colors,
        typography: {
          headingFont: themeConfig.fonts.heading,
          bodyFont: themeConfig.fonts.body,
        },
        layout: {
          maxWidth: "72rem",
        },
      },
      pageSettings: {},
      sectionSettings: {},
      blockSettings: {},
      navigationSettings: { items: template.package?.navigation || [] },
      footerSettings: template.package?.footer || {},
      headerSettings: { menus: template.package?.menus || [] },
      mediaAssets: asJson(template.package?.media || []),
      seoSettings: template.package?.seo || {},
      revisionHistory: [],
      customCss: "",
      customJs: "",
      currentVersion: 1,
      publishedVersion: 1,
      lastPublishedAt: new Date(),
    },
    update: {
      themeSettings: {
        colors: themeConfig.colors,
        typography: {
          headingFont: themeConfig.fonts.heading,
          bodyFont: themeConfig.fonts.body,
        },
        layout: {
          maxWidth: "72rem",
        },
      },
      navigationSettings: { items: template.package?.navigation || [] },
      footerSettings: template.package?.footer || {},
      headerSettings: { menus: template.package?.menus || [] },
      mediaAssets: asJson(template.package?.media || []),
      seoSettings: template.package?.seo || {},
      lastPublishedAt: new Date(),
    },
  });

  await prisma.mediaItem.deleteMany({ where: { siteId } });
  if (template.package?.media?.length) {
    await prisma.mediaItem.createMany({
      data: template.package.media.map((item) => ({
        siteId,
        name: item.name,
        url: item.url,
        type: item.type,
        mimeType: item.mimeType || null,
        alt: item.alt || null,
        folder: item.folder || "/",
      })),
    });
  }

  await prisma.category.deleteMany({ where: { siteId } });
  const categoryIds = new Map<string, string>();
  if (template.package?.collections?.length) {
    for (const collection of template.package.collections) {
      const category = await prisma.category.create({
        data: {
          siteId,
          name: collection.name,
          slug: collection.slug,
          description: collection.description || null,
          image: collection.image || null,
          position: 0,
        },
      });
      categoryIds.set(collection.slug, category.id);
    }
  }

  await prisma.product.deleteMany({ where: { siteId } });
  if (template.package?.products?.length) {
    for (const product of template.package.products) {
      const created = await prisma.product.create({
        data: {
          siteId,
          categoryId: product.categorySlug ? categoryIds.get(product.categorySlug) || null : null,
          name: product.name,
          slug: product.slug,
          description: product.description || null,
          price: product.price,
          compareAtPrice: product.compareAtPrice || null,
          currency: "NGN",
          sku: product.sku || null,
          stock: product.stock || 0,
          isFeatured: !!product.isFeatured,
          tags: product.tags || [],
          metaTitle: `${product.name} — ${template.name}`,
          metaDescription: product.description || template.description || null,
          status: "ACTIVE",
          position: 0,
        },
      });

      if (product.image) {
        await prisma.productImage.create({
          data: {
            productId: created.id,
            url: product.image,
            alt: product.name,
            position: 0,
          },
        });
      }
    }
  }

  await prisma.form.deleteMany({ where: { siteId } });
  if (template.package?.forms?.length) {
    await prisma.form.createMany({
      data: template.package.forms.map((form) => ({
        siteId,
        name: form.name,
        slug: form.slug,
        description: null,
        fields: form.fields as unknown as Prisma.InputJsonValue,
        settings: { source: "theme-package" } as unknown as Prisma.InputJsonValue,
        submitButtonText: "Submit",
        successMessage: "Thanks for reaching out. We'll get back to you soon.",
        isActive: true,
      })),
    });
  }

  return siteTemplate;
}

export async function importTemplateToSite(siteId: string, input: TemplateSelectionInput) {
  const template = input.templateId || input.templateSlug
    ? await getTemplateByIdOrSlug(input.templateId || input.templateSlug || "")
    : null;

  if (!template) {
    throw new Error("Template not found");
  }

  const existingImport = template.id ? await getExistingImport(siteId, template.id) : null;
  if (existingImport && !input.reinstall) {
    const pages = Array.isArray(existingImport.pages) ? (existingImport.pages as unknown as ReturnType<typeof buildImportedTemplatePages>) : [];
    return {
      template,
      siteTemplate: existingImport,
      pages,
      themeConfig: existingImport.themeConfig as unknown as ThemeConfig,
      reused: true,
    };
  }

  const themeConfig = mergeBranding(template.themeConfig, input);
  const pages = buildImportedTemplatePages(input, template);

  const siteTemplate = await replaceThemeRecords(siteId, template, themeConfig);
  await replaceSitePages(siteId, template, pages);

  return {
    template,
    siteTemplate,
    pages,
    themeConfig,
    reused: false,
  };
}
