"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { PerfumesHeader, PerfumesFooter, PerfumesFontLoader } from "@/components/storefront/PerfumesTemplateBlocks";
import { KidsHeader, KidsFooterFull, KidsFontLoader } from "@/components/storefront/KidsTemplateBlocks";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { CosmeticsHeader, CosmeticsFooter, CosmeticsFontLoader } from "@/components/storefront/CosmeticsTemplateBlocks";
import { TShirtsPrintsHeader, TShirtsPrintsFooter } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { VegetableHeader, VegetableFooter } from "@/components/storefront/VegetableStoreChrome";
import { FashionHeader, FashionFooter } from "@/components/storefront/FashionStoreChrome";
import { GardenHeader, GardenFooter } from "@/components/storefront/GardenStoreChrome";
import { HealthHeader, HealthFooterFull, HealthFontLoader } from "@/components/storefront/HealthTemplateBlocks";
import { InteriorHeader, InteriorFooter } from "@/components/storefront/InteriorDesignTemplateBlocks";

// Chrome block types that should not be in the editable block list
const CHROME_BLOCK_TYPES = new Set([
  'perfumesHeader', 'perfumesFooter',
  'handmadeBagsHeader', 'handmadeBagsFooter',
  'cosmeticsHeader', 'cosmeticsFooter',
  'kidsHeader', 'kidsFooter',
  'tShirtsPrintsHeader', 'tShirtsPrintsFooter',
]);

export default function BuilderPreviewPage() {
  const params = useParams();
  const { siteId, pageSlug } = params;
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      try {
        // First, get the site to resolve the actual slug/subdomain
        const siteRes = await fetch(`/api/sites/${siteId}`);
        const siteJson = await siteRes.json();
        
        if (!siteJson.success || !siteJson.data) {
          setError("Site not found");
          setLoading(false);
          return;
        }

        const siteSlug = siteJson.data.slug || siteJson.data.subdomain;
        
        // Load the actual storefront data using the public API with the resolved slug
        const res = await fetch(`/api/storefront/${siteSlug}/pages/${pageSlug}`);
        const json = await res.json();
        
        if (json.success && json.data) {
          setStoreData(json.data);
        } else {
          setError(json.error || "Page not found");
        }
      } catch (error) {
        console.error("Failed to load preview data:", error);
        setError("Failed to load preview");
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [siteId, pageSlug]);

  // Listen for messages from the parent editor
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "builder-section-update") {
        // Handle section updates from editor
        console.log("Section update received:", event.data);
      }
      if (event.data.type === "builder-viewport-change") {
        // Handle viewport changes
        console.log("Viewport change received:", event.data.viewport);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-surface-500">Loading preview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-500 text-center p-8">
          <p className="font-semibold">Preview Error</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-500">Failed to load preview data</div>
      </div>
    );
  }

  const { store, page, templateSlug, products, categories } = storeData;
  const storeSlug = store.slug || store.subdomain;
  const blocks = (page.content?.blocks || []) as BuilderBlock[];
  
  // Filter out chrome blocks from editable content
  const contentBlocks = blocks.filter(b => !CHROME_BLOCK_TYPES.has(b.type));

  // Render template-specific header/footer
  const renderChrome = () => {
    switch (templateSlug) {
      case 'perfumes':
        return (
          <>
            <PerfumesFontLoader />
            <PerfumesHeader
              storeName={store.name}
              storeSlug={storeSlug}
              logo={store.logo}
              categories={categories}
            />
          </>
        );
      case 'kids':
        return (
          <>
            <KidsFontLoader />
            <KidsHeader
              storeName={store.name}
              storeSlug={storeSlug}
              logo={store.logo}
            />
          </>
        );
      case 'handmade-bags':
        return (
          <HandmadeBagsHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
          />
        );
      case 'cosmetics':
        return (
          <>
            <CosmeticsFontLoader />
            <CosmeticsHeader
              storeName={store.name}
              storeSlug={storeSlug}
              logo={store.logo}
            />
          </>
        );
      case 't-shirts-prints':
        return (
          <TShirtsPrintsHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
          />
        );
      case 'vegetables':
        return (
          <VegetableHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
            navItems={[]}
            reservationHref=""
          />
        );
      case 'health':
        return (
          <>
            <HealthFontLoader />
            <HealthHeader
              storeName={store.name}
              storeSlug={storeSlug}
              logo={store.logo}
            />
          </>
        );
      case 'interior':
        return (
          <InteriorHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
          />
        );
      default:
        return (
          <FashionHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
          />
        );
    }
  };

  const renderFooter = () => {
    switch (templateSlug) {
      case 'perfumes':
        return <PerfumesFooter storeName={store.name} storeSlug={storeSlug} />;
      case 'kids':
        return <KidsFooterFull storeName={store.name} storeSlug={storeSlug} />;
      case 'handmade-bags':
        return <HandmadeBagsFooter storeName={store.name} storeSlug={storeSlug} />;
      case 'cosmetics':
        return <CosmeticsFooter storeName={store.name} storeSlug={storeSlug} />;
      case 't-shirts-prints':
        return <TShirtsPrintsFooter storeName={store.name} storeSlug={storeSlug} />;
      case 'vegetables':
        return <VegetableFooter storeName={store.name} storeSlug={storeSlug} navItems={[]} />;
      case 'health':
        return <HealthFooterFull storeName={store.name} storeSlug={storeSlug} />;
      case 'interior':
        return <InteriorFooter storeSlug={storeSlug} />;
      default:
        return <FashionFooter storeName={store.name} storeSlug={storeSlug} />;
    }
  };

  // Wrap blocks with selectable containers for editor mode
  const wrapBlockForEditor = (block: BuilderBlock, content: React.ReactNode, index: number) => {
    return (
      <div
        key={block.id}
        data-block-id={block.id}
        data-block-type={block.type}
        data-block-index={index}
        className="relative group/block"
        onClick={(e) => {
          e.stopPropagation();
          // Send block selection message to parent editor
          window.parent.postMessage({
            type: 'builder-block-select',
            blockId: block.id,
            blockType: block.type,
            blockProps: block.props,
          }, '*');
        }}
        style={{
          outline: '2px solid transparent',
          transition: 'outline 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.outline = '2px solid #3b82f6';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.outline = '2px solid transparent';
        }}
      >
        {content}
        {/* Block label overlay on hover */}
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/block:opacity-100 transition-opacity pointer-events-none z-10">
          {block.type}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {renderChrome()}
      <RenderBlocks 
        blocks={contentBlocks} 
        storeSlug={storeSlug}
        products={products}
        isEditorMode={true}
        wrapBlock={wrapBlockForEditor}
      />
      {renderFooter()}
    </div>
  );
}
