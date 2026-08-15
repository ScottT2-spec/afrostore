"use client";

import { useParams } from "next/navigation";
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
  "fashionFooter", "interiorFooter", "makeupFooter",
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
      <div className="min-h-screen">
        <VegetableHeader storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} navItems={navItems} reservationHref={`/store/${demoStoreSlug}/reservation`} />
        <RenderTemplateBlocks blocks={blocks as any} />
        <VegetableFooter storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} navItems={navItems} />
      </div>
    );
  }

  if (slug === "perfumes") {
    return (
      <div className="min-h-screen">
        <PerfumesFontLoader />
        <PerfumesHeader storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} />
        <RenderTemplateBlocks blocks={blocks as any} />
        <PerfumesFooter storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} />
      </div>
    );
  }

  const chrome = getChrome(slug);

  return (
    <div className="min-h-screen">
      {chrome?.FontLoader && <chrome.FontLoader />}
      {chrome && <chrome.Header storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} isLanding />}
      <RenderTemplateBlocks blocks={blocks as any} />
      {chrome && <chrome.Footer storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} />}
    </div>
  );
}
