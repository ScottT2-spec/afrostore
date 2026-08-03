import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { RetailHeader, RetailFooter } from "@/components/storefront/RetailTemplateBlocks";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { applyPageCustomization, buildPageBackgroundStyle, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization } from "@/lib/site-customization";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { RETAIL_PROJECTS_BLOCKS } from "@/lib/templates/presets/retail-pages";
import { serializeProductsForClient } from "@/lib/serialize-products";
import { buildTemplatePageContent } from "@/lib/templates/template-tree";
import { resolveLivePageContent } from "@/lib/templates/bespoke-page-content";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getStoreData(slug: string) {
  const store = await prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { slug },
        { subdomain: slug },
        { customDomain: slug },
      ],
    },
    include: {
      customizations: true,
      templates: {
        include: {
          template: true,
        },
        where: {
          isActive: true,
        },
        take: 1,
      },
      pages: {
        where: { slug: "projects" },
        take: 1,
      },
      blogs: {
        where: { 
          status: 'PUBLISHED',
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!store) return null;

  // Auto-create Projects page if it doesn't exist
  if (!store.pages || store.pages.length === 0) {
    try {
      await prisma.page.create({
        data: {
          siteId: store.id,
          title: "Projects",
          slug: "projects",
          type: "CUSTOM",
          content: buildTemplatePageContent([], {}) as any,
          isPublished: true,
          position: 11,
        },
      });
      // Re-fetch to include the newly created page
      store.pages = await prisma.page.findMany({
        where: { siteId: store.id, slug: "projects" },
        take: 1,
      });
    } catch (error) {
      console.error("Failed to auto-create Projects page:", error);
    }
  }

  // Get products for the store
  const products = await prisma.product.findMany({
    where: { siteId: store.id, status: "ACTIVE" },
    include: {
      images: true,
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { store, products };
}

export default async function ProjectsPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStoreData(slug);

  if (!data) notFound();

  const { store, products } = data;

  const activeTemplateSlug = store.templates?.[0]?.template?.slug || null;
  const isRetailTemplate = activeTemplateSlug === "retail" || activeTemplateSlug === "decor";

  if (!isRetailTemplate) {
    notFound();
  }

  // Serialize products to convert Decimal values to plain numbers for client components
  const serializedProducts = serializeProductsForClient(products);

  const customization = normalizeSiteCustomization(store.customizations as any);
  const visiblePages = filterVisiblePages(store.pages || [], customization);
  const customizedPages = visiblePages.map((page: any) => applyPageCustomization(page, customization));
  const projectsPage = customizedPages.find((p: any) => p.slug === "projects");
  
  // Use custom blocks if available, otherwise use preset
  let pageContent;
  const resolvedProjects = projectsPage?.content
    ? resolveLivePageContent(activeTemplateSlug, projectsPage.slug, projectsPage.content, {
        pageSlug: projectsPage.slug,
        pageTitle: projectsPage.title,
        pageType: projectsPage.type,
        templateSlug: activeTemplateSlug,
      })
    : null;
  const projectsNodeCss = resolvedProjects?.css || "";
  if (resolvedProjects && resolvedProjects.blocks.length > 0) {
    pageContent = { blocks: resolvedProjects.blocks, settings: resolvedProjects.settings };
  } else {
    pageContent = { blocks: RETAIL_PROJECTS_BLOCKS, settings: {} };
  }

  const pageSettings = projectsPage ? getResolvedPageSettings(projectsPage, resolvedProjects?.settings || pageContent.settings, customization) : {};
  const themeData: ThemeData = {
    id: "retail-projects-page",
    name: "Retail Projects Page",
    slug: "retail-projects-page",
    config: {
      colors: {
        primary: customization?.themeSettings?.colors?.primary || "#c27843",
        secondary: customization?.themeSettings?.colors?.secondary || "#242424",
        accent: customization?.themeSettings?.colors?.accent || "#767676",
        background: customization?.themeSettings?.colors?.background || "#ffffff",
        text: customization?.themeSettings?.colors?.text || "#242424",
      },
    },
  };

  const retailBlocks = (resolvedProjects?.blocks?.length ? resolvedProjects.blocks : RETAIL_PROJECTS_BLOCKS) as BuilderBlock[];

  // Transform blog data into project items format for ProjectsBlock
  const projectItems = (store.blogs || []).map(blog => ({
    id: blog.id,
    title: blog.title,
    description:
      blog.excerpt ||
      (typeof blog.content === "object" && blog.content && "text" in blog.content
        ? `${String((blog.content as any).text).substring(0, 200)}...`
        : ""),
    image: blog.coverImage || "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop",
    link: `/blog/${blog.slug}`,
  }));

  // Inject dynamic project items into the ProjectsBlock
  const dynamicBlocks = retailBlocks.map(block => {
    if (block.type === 'projects' && block.props) {
      return {
        ...block,
        props: {
          ...block.props,
          items: projectItems,
        },
      };
    }
    return block;
  });

    return (
      <ThemeProvider theme={themeData}>
        <RetailHeader storeName={store.name} storeSlug={store.slug || slug} logo={store.logo} isLanding={false} />
        <div style={buildPageBackgroundStyle(pageSettings)}>
          {projectsNodeCss && <style data-live-node-styles dangerouslySetInnerHTML={{ __html: projectsNodeCss }} />}
          <RenderBlocks blocks={dynamicBlocks} storeSlug={slug} products={serializedProducts} />
        </div>
        <RetailFooter storeName={store.name} storeSlug={store.slug || slug} logo={store.logo} description={store.description ?? undefined} />
      </ThemeProvider>
  );
}
