import { notFound } from "next/navigation";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { RetailHeader, RetailFooter } from "@/components/storefront/RetailTemplateBlocks";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { buildPageBackgroundStyle } from "@/lib/site-customization";
import { parsePageContent } from "@/lib/page-content";
import { RETAIL_PROJECT_DETAIL_BLOCKS } from "@/lib/templates/presets/retail-pages";

interface Props {
  params: Promise<{
    slug: string;
    projectSlug: string;
  }>;
}

// Default project detail blocks for fallback
const DEFAULT_PROJECT_DETAIL_BLOCKS: BuilderBlock[] = [
  {
    id: "project-detail-hero",
    type: "hero",
    props: {
      heading: "Project Details",
      subheading: "Explore our work in detail",
      bgImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=900&fit=crop",
      bgStyle: "custom",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
      overlayColor: "#000000",
      overlayOpacity: 0.45,
      layout: "center",
    },
  },
  {
    id: "project-detail-spacer-1",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "project-detail-content",
    type: "text",
    props: {
      text: "Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Proin gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis.\n\nLuctus nec ullamcorper mattis, pulvinar dapibus leo. Proin gravida nibh vel velit auctor aliquet.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "project-detail-spacer-2",
    type: "spacer",
    props: { height: 80 },
  },
];

async function getStoreData(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/storefront/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;

    return response.json();
  } catch (error) {
    console.error('Error fetching store data:', error);
    return null;
  }
}

function serializeProductsForClient(products: any[]) {
  return products.map(product => ({
    ...product,
    price: typeof product.price === 'number' ? product.price : Number(product.price),
    compareAtPrice: product.compareAtPrice ? (typeof product.compareAtPrice === 'number' ? product.compareAtPrice : Number(product.compareAtPrice)) : null,
  }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug, projectSlug } = await params;
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

  // Try to find the project detail page in the database
  // The projectSlug already includes the project- prefix (e.g., project-look-deep-into-nature)
  const projectPage = store.pages?.find((p: any) => p.slug === projectSlug);

  let pageContent = { blocks: DEFAULT_PROJECT_DETAIL_BLOCKS, settings: {} };

  // Use preset blocks if available for this project slug, otherwise use default fallback
  if (RETAIL_PROJECT_DETAIL_BLOCKS[projectSlug]) {
    pageContent = { blocks: RETAIL_PROJECT_DETAIL_BLOCKS[projectSlug], settings: {} };
  }

  // If page exists in DB and has content, use that instead of preset
  if (projectPage?.content) {
    const parsed = parsePageContent(projectPage.content as any);
    if (parsed.blocks && parsed.blocks.length > 0) {
      pageContent = parsed;
    }
  }

  const themeData: ThemeData = {} as any;
  const pageSettings = {} as any;

  const projectBlocks = pageContent.blocks as BuilderBlock[];

  return (
    <ThemeProvider theme={themeData}>
      <RetailHeader storeName={store.name} storeSlug={store.slug || slug} logo={store.logo} isLanding={false} />
      <div style={buildPageBackgroundStyle(pageSettings)}>
        <RenderBlocks blocks={projectBlocks} storeSlug={slug} products={serializedProducts} />
      </div>
      <RetailFooter storeName={store.name} storeSlug={store.slug || slug} logo={store.logo} description={store.description ?? undefined} />
    </ThemeProvider>
  );
}
