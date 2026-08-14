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
import { PerfumesHeader, PerfumesFontLoader } from "@/components/storefront/PerfumesTemplateBlocks";
import { VegetableHeader } from "@/components/storefront/VegetableStoreChrome";

// Slugs that are fully self-contained landing pages — their own blocks
// already include everything (no separate site-chrome header/footer, same
// as how the live storefront renders them).
const NO_CHROME_SLUGS = new Set(["ai", "landing-gadget", "aegis", "aegis-landing", "prokip-agent", "prokip-booking"]);

// Mirrors the template-group logic in src/app/store/[slug]/page.tsx so the
// preview shows the same header/footer a real site built from this template
// would have.
function getChrome(slug: string): { Header: React.ComponentType<any>; Footer: React.ComponentType<any>; FontLoader?: React.ComponentType } | null {
  if (NO_CHROME_SLUGS.has(slug)) return null;
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

  const blocks = TEMPLATE_PRESET_MAP[slug] ?? TEMPLATE_PRESET_MAP[`${slug}-landing`];

  if (!blocks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Template not found: {slug}</p>
      </div>
    );
  }

  const meta = getTemplateBySlug(slug);
  const demoStoreName = meta?.name || "Your Store";
  const demoStoreSlug = "preview";

  // Vegetables reuses GROCERY_TEMPLATE_PRESET, which already includes its
  // own groceryFooter content block — only add the header as chrome here.
  if (slug === "vegetables") {
    const navItems = [
      { label: "Home", href: `/store/${demoStoreSlug}` },
      { label: "Menu", href: `/store/${demoStoreSlug}/menu` },
      { label: "Recipe", href: `/store/${demoStoreSlug}/recipe` },
      { label: "About", href: `/store/${demoStoreSlug}/about` },
      { label: "Contact", href: `/store/${demoStoreSlug}/contact` },
    ];
    return (
      <div className="min-h-screen">
        <VegetableHeader storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} navItems={navItems} reservationHref={`/store/${demoStoreSlug}/reservation`} />
        <RenderTemplateBlocks blocks={blocks} />
      </div>
    );
  }

  // Perfumes' own preset already includes a `perfumesFooter` content block
  // (rendered via RenderTemplateBlocks), so only the header needs to be
  // added as separate chrome — adding a Footer here too would duplicate it,
  // matching exactly how the live storefront renders this template.
  if (slug === "perfumes") {
    return (
      <div className="min-h-screen">
        <PerfumesFontLoader />
        <PerfumesHeader storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} />
        <RenderTemplateBlocks blocks={blocks} />
      </div>
    );
  }

  const chrome = getChrome(slug);

  return (
    <div className="min-h-screen">
      {chrome?.FontLoader && <chrome.FontLoader />}
      {chrome && <chrome.Header storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} isLanding />}
      <RenderTemplateBlocks blocks={blocks} />
      {chrome && <chrome.Footer storeName={demoStoreName} storeSlug={demoStoreSlug} logo={null} />}
    </div>
  );
}
