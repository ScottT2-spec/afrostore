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
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
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
          const pageBlocks = (json.data.page.content?.blocks || []) as BuilderBlock[];
          setBlocks(pageBlocks);
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
        
        // Update the specific block in local state
        const { sectionId, section } = event.data;
        setBlocks((prevBlocks) => {
          return prevBlocks.map((block) => {
            if (block.id === sectionId) {
              // Merge section.content and section.styleOverrides into block.props
              return {
                ...block,
                props: {
                  ...section.content,
                  ...section.styleOverrides,
                },
              };
            }
            return block;
          });
        });
      }
      if (event.data.type === "builder-theme-update") {
        // Handle theme updates from editor
        console.log("Theme update received:", event.data);
        
        // Apply theme CSS variables to the document
        const { theme } = event.data;
        const root = document.documentElement;
        const colors = theme.designSystem.colors;
        
        console.log("About to set CSS variables. colors object:", colors);
        
        if (colors) {
          console.log("Setting --color-primary to:", colors.primary);
          root.style.setProperty('--color-primary', colors.primary);
          console.log("Set --color-primary, current value:", root.style.getPropertyValue('--color-primary'));
          
          console.log("Setting --color-secondary to:", colors.secondary);
          root.style.setProperty('--color-secondary', colors.secondary);
          console.log("Set --color-secondary, current value:", root.style.getPropertyValue('--color-secondary'));
          
          console.log("Setting --color-accent to:", colors.accent);
          root.style.setProperty('--color-accent', colors.accent);
          console.log("Set --color-accent, current value:", root.style.getPropertyValue('--color-accent'));
          
          console.log("Setting --color-background to:", colors.background);
          root.style.setProperty('--color-background', colors.background);
          console.log("Set --color-background, current value:", root.style.getPropertyValue('--color-background'));
          
          console.log("Setting --color-text to:", colors.text);
          root.style.setProperty('--color-text', colors.text);
          console.log("Set --color-text, current value:", root.style.getPropertyValue('--color-text'));
          
          console.log("Setting --color-muted-text to:", colors.mutedText || '#6b7280');
          root.style.setProperty('--color-muted-text', colors.mutedText || '#6b7280');
          console.log("Set --color-muted-text, current value:", root.style.getPropertyValue('--color-muted-text'));
          
          console.log("Setting --color-border to:", colors.border || '#e5e7eb');
          root.style.setProperty('--color-border', colors.border || '#e5e7eb');
          console.log("Set --color-border, current value:", root.style.getPropertyValue('--color-border'));
          
          console.log("All CSS variables set. Final root.style properties:", root.style.cssText);
        } else {
          console.log("No colors object found in theme.designSystem");
        }
      }
      if (event.data.type === "builder-viewport-change") {
        // Handle viewport changes
        console.log("Viewport change received:", event.data.viewport);
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Signal to parent that iframe is ready to receive messages
    window.parent.postMessage({ type: "builder-iframe-ready" }, "*");
    
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
    // Extract style overrides from block props
    const props = block.props as Record<string, unknown>;
    const wrapperStyle: React.CSSProperties = {
      outline: '2px solid transparent',
      transition: 'outline 0.15s ease',
    };

    // Build CSS for this specific block to override component styles
    let blockCss = '';
    // The DOM structure is: <div key={block.id}> <div data-block-id={block.id}> {content} </div> </div>
    // So we need to target the direct child of the data-block-id element
    const blockSelector = `[data-block-id="${block.id}"] > *`;
    
    console.log(`[wrapBlockForEditor] Block ${block.id} (${block.type}) props:`, props);
    
    // Helper function to validate CSS value
    const isValidCssValue = (value: unknown): boolean => {
      if (value === undefined || value === null || value === '') return false;
      const str = String(value).trim();
      if (str === '') return false;
      // Check for obviously invalid patterns like trailing commas
      if (str.endsWith(',')) return false;
      // Check for unitless numeric values that need units (except 0)
      if (/^\d+$/.test(str) && str !== '0') return false;
      return true;
    };
    
    // Helper function to ensure unit for numeric values
    const ensureUnit = (value: unknown, defaultUnit: string = 'px'): string => {
      const str = String(value).trim();
      if (!isValidCssValue(value)) return '';
      // If it's just a number (not 0), add the default unit
      if (/^\d+$/.test(str) && str !== '0') {
        return str + defaultUnit;
      }
      return str;
    };
    
    if (isValidCssValue(props.paddingY)) {
      const val = ensureUnit(props.paddingY, 'rem');
      if (val) blockCss += `padding-top: ${val}; padding-bottom: ${val}; `;
    }
    if (isValidCssValue(props.paddingTop)) {
      const val = ensureUnit(props.paddingTop, 'rem');
      if (val) blockCss += `padding-top: ${val}; `;
    }
    if (isValidCssValue(props.paddingBottom)) {
      const val = ensureUnit(props.paddingBottom, 'rem');
      if (val) blockCss += `padding-bottom: ${val}; `;
    }
    if (isValidCssValue(props.paddingLeft)) {
      const val = ensureUnit(props.paddingLeft, 'rem');
      if (val) blockCss += `padding-left: ${val}; `;
    }
    if (isValidCssValue(props.paddingRight)) {
      const val = ensureUnit(props.paddingRight, 'rem');
      if (val) blockCss += `padding-right: ${val}; `;
    }
    if (isValidCssValue(props.marginTop)) {
      const val = ensureUnit(props.marginTop, 'rem');
      if (val) blockCss += `margin-top: ${val}; `;
    }
    if (isValidCssValue(props.marginBottom)) {
      const val = ensureUnit(props.marginBottom, 'rem');
      if (val) blockCss += `margin-bottom: ${val}; `;
    }
    if (isValidCssValue(props.marginLeft)) {
      const val = ensureUnit(props.marginLeft, 'rem');
      if (val) blockCss += `margin-left: ${val}; `;
    }
    if (isValidCssValue(props.marginRight)) {
      const val = ensureUnit(props.marginRight, 'rem');
      if (val) blockCss += `margin-right: ${val}; `;
    }
    if (isValidCssValue(props.backgroundColor)) blockCss += `background-color: ${props.backgroundColor} !important; `;
    if (isValidCssValue(props.backgroundImage)) blockCss += `background-image: url(${props.backgroundImage}) !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important; `;
    if (isValidCssValue(props.borderStyle)) blockCss += `border-style: ${props.borderStyle}; `;
    if (isValidCssValue(props.borderWidth)) {
      const val = ensureUnit(props.borderWidth, 'px');
      if (val) blockCss += `border-width: ${val}; `;
    }
    if (isValidCssValue(props.borderColor)) blockCss += `border-color: ${props.borderColor}; `;
    if (isValidCssValue(props.borderRadius)) {
      const val = ensureUnit(props.borderRadius, 'px');
      if (val) blockCss += `border-radius: ${val}; `;
    }
    if (isValidCssValue(props.boxShadow)) blockCss += `box-shadow: ${props.boxShadow}; `;
    
    if (blockCss) {
      console.log(`[wrapBlockForEditor] Injecting CSS for block ${block.id}:`, blockSelector, blockCss);
    }

    return (
      <>
        {/* Inject block-specific styles */}
        {blockCss && (
          <style dangerouslySetInnerHTML={{ __html: `${blockSelector} { ${blockCss} }` }} />
        )}
        <div
          key={block.id}
          data-block-id={block.id}
          data-block-type={block.type}
          data-block-index={index}
          className="relative group/block builder-block-wrapper"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Send block selection message to parent editor
            window.parent.postMessage({
              type: 'builder-block-select',
              blockId: block.id,
              blockType: block.type,
              blockProps: block.props,
            }, '*');
          }}
          style={wrapperStyle}
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
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Disable all link navigation in editor mode */}
      <style dangerouslySetInnerHTML={{ __html: `
        .builder-block-wrapper a,
        .builder-block-wrapper button[type="submit"] {
          pointer-events: none !important;
          cursor: default !important;
        }
        .builder-block-wrapper {
          cursor: pointer !important;
        }
      `}} />
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
