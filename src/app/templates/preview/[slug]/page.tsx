"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { TEMPLATE_PRESET_MAP } from "@/lib/templates/template-preset-map";
import { RenderTemplateBlocks } from "@/components/storefront/TemplateBlockRenderer";
import { getTemplateBySlug } from "@/lib/templates/catalog";

import { FashionHeader, FashionFooter } from "@/components/storefront/FashionStoreChrome";
import { CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";
import { KidsHeader, KidsFooterFull } from "@/components/storefront/KidsTemplateBlocks";
import { TShirtsPrintsHeader, TShirtsPrintsFooter } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { RetailHeader, RetailFooter } from "@/components/storefront/RetailTemplateBlocks";
import { HealthHeader, HealthFooterFull } from "@/components/storefront/HealthTemplateBlocks";
import { InteriorHeader, InteriorFooter, InteriorFontLoader } from "@/components/storefront/InteriorDesignTemplateBlocks";
import { PerfumesHeader, PerfumesFooter, PerfumesFontLoader } from "@/components/storefront/PerfumesTemplateBlocks";
import { VegetableHeader, VegetableFooter } from "@/components/storefront/VegetableStoreChrome";

// Slugs that are fully self-contained landing pages — their own blocks
// already include everything (no separate site-chrome header/footer, same
// as how the live storefront renders them).
const NO_CHROME_SLUGS = new Set(["ai", "landing-gadget", "aegis", "aegis-landing", "prokip-agent", "prokip-booking"]);

// Some presets include their own "Footer"-type content block (e.g.
// groceryFooter, perfumesFooter). That variant only ever gets props from the
// block's own settings — storeName/storeSlug are never injected there,
// unlike the chrome-level Footer the live storefront renders explicitly —
// so instead of relying on it (and risking it rendering blank), we strip it
// out of the content and always render the real chrome Footer with proper
// demo props.
const DUPLICATE_FOOTER_BLOCK_TYPES = new Set([
  "groceryFooter", "perfumesFooter", "electronicsFooter", "bakeryFooter",
  "fashionFooter", "interiorFooter", "makeupFooter", "healthFooterFull",
]);

function stripDuplicateFooterBlocks(blocks: any[]): any[] {
  return blocks.filter((b) => !DUPLICATE_FOOTER_BLOCK_TYPES.has(b?.type));
}

// Mirrors the template-group logic in src/app/store/[slug]/page.tsx so the
// preview shows the same header/footer a real site built from this template
// would have.
function getChrome(slug: string): { Header: React.ComponentType<any>; Footer: React.ComponentType<any>; FontLoader?: React.ComponentType } | null {
  if (NO_CHROME_SLUGS.has(slug)) return null;
  if (slug === "vegetables") return { Header: VegetableHeader, Footer: VegetableFooter };
  if (slug === "perfumes") return { Header: PerfumesHeader, Footer: PerfumesFooter, FontLoader: PerfumesFontLoader };
  if (slug === "decor" || slug === "interior" || slug === "interior-design" || slug === "home-decor") {
    return { Header: InteriorHeader, Footer: InteriorFooter, FontLoader: InteriorFontLoader };
  }
  if (slug === "cosmetics") return { Header: CosmeticsHeader, Footer: CosmeticsFooter };
  if (slug === "retail") return { Header: RetailHeader, Footer: RetailFooter };
  if (slug === "pills") return { Header: HealthHeader, Footer: HealthFooterFull };
  if (slug === "t-shirts-prints") return { Header: TShirtsPrintsHeader, Footer: TShirtsPrintsFooter };
  if (slug === "kids") return { Header: KidsHeader, Footer: KidsFooterFull };
  // Toys, and the broad fashion/electronics/hardware/tools/makeup/grocery/bakery
  // group, all use the Fashion chrome on the live storefront too.
  return { Header: FashionHeader, Footer: FashionFooter };
}

// Links inside the preview point at /store/{demoStoreSlug}/... routes that
// don't exist yet (there's no real site behind "preview") — clicking Shop,
// Cart, About, etc previously navigated straight into a 404. This wraps the
// whole preview in one click-interceptor so every template's header/footer
// links are handled the same way, without touching each one individually:
// clicking a preview-store link shows a toast instead of navigating, and
// external/real links (already resolved elsewhere) still work normally.
function PreviewLinkGuard({ storeSlug, children }: { storeSlug: string; children: React.ReactNode }) {
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const handleClick = (e: React.MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") || "";
    if (href.startsWith(`/store/${storeSlug}`) || href.startsWith(`/store/${storeSlug}/`) || href === `/store/${storeSlug}`) {
      e.preventDefault();
      e.stopPropagation();
      setToast(true);
    }
  };

  return (
    <div onClickCapture={handleClick} className="relative">
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] rounded-full bg-surface-900 text-white text-sm font-medium px-5 py-2.5 shadow-lg animate-fade-in">
          This link will work once you create your site
        </div>
      )}
    </div>
  );
}

export default function TemplatePreviewPage() {
  const { slug } = useParams<{ slug: string }>();

  const rawBlocks = TEMPLATE_PRESET_MAP[slug] ?? TEMPLATE_PRESET_MAP[`${slug}-landing`];

  if (!rawBlocks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Template not found: {slug}</p>
      </div>
    );
  }

  const meta = getTemplateBySlug(slug);
  const demoStoreName = meta?.name || "Your Store";
  const demoStoreSlug = "preview";
  const blocks = stripDuplicateFooterBlocks(rawBlocks as any[]);

  if (slug === "vegetables") {
    const navItems = [
      { label: "Home", href: `/store/${demoStoreSlug}` },
      { label: "Shop", href: `/store/${demoStoreSlug}/shop` },
      { label: "Recipes", href: `/store/${demoStoreSlug}/recipe` },
      { label: "About", href: `/store/${demoStoreSlug}/about` },
      { label: "Contact", href: `/store/${demoStoreSlug}/contact` },
    ];
    return (
      <PreviewLinkGuard storeSlug={demoStoreSlug}>
        <div className="min-h-screen">
          <VegetableHeader storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} navItems={navItems} reservationHref={`/store/${demoStoreSlug}/reservation`} />
          <RenderTemplateBlocks blocks={blocks as any} />
          <VegetableFooter storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} navItems={navItems} />
        </div>
      </PreviewLinkGuard>
    );
  }

  if (slug === "perfumes") {
    return (
      <PreviewLinkGuard storeSlug={demoStoreSlug}>
        <div className="min-h-screen">
          <PerfumesFontLoader />
          <PerfumesHeader storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} />
          <RenderTemplateBlocks blocks={blocks as any} />
          <PerfumesFooter storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} />
        </div>
      </PreviewLinkGuard>
    );
  }

  const chrome = getChrome(slug);

  return (
    <PreviewLinkGuard storeSlug={demoStoreSlug}>
      <div className="min-h-screen">
        {chrome?.FontLoader && <chrome.FontLoader />}
        {chrome && <chrome.Header storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} isLanding />}
        <RenderTemplateBlocks blocks={blocks as any} />
        {chrome && <chrome.Footer storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} />}
      </div>
    </PreviewLinkGuard>
  );
}
