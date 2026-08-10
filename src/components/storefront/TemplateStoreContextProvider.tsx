import { FashionStoreContext } from "@/components/storefront/FashionTemplateBlocks";
import { ElectronicsStoreContext } from "@/components/storefront/ElectronicsTemplateBlocks";
import { BakeryStoreContext } from "@/components/storefront/BakeryTemplateBlocks";
import { CosmeticsStoreContext } from "@/components/storefront/CosmeticsTemplateBlocks";
import { GroceryStoreContext } from "@/components/storefront/GroceryTemplateBlocks";
import { HealthStoreContext } from "@/components/storefront/HealthTemplateBlocks";
import { InteriorStoreContext } from "@/components/storefront/InteriorDesignTemplateBlocks";
import { KidsStoreContext } from "@/components/storefront/KidsTemplateBlocks";
import { ToysStoreContext } from "@/components/storefront/ToysTemplateBlocks";
import { MakeupStoreContext } from "@/components/storefront/MakeupTemplateBlocks";
import { PerfumesStoreContext } from "@/components/storefront/PerfumesTemplateBlocks";
import { LandingGadgetContext } from "@/components/storefront/LandingGadgetBlocks";
import { AegisLandingContext } from "@/components/storefront/AegisLandingBlocks";
import { ProkipAgentLandingContext } from "@/components/storefront/ProkipAgentLandingBlocks";
import { ProkipBookingLandingContext } from "@/components/storefront/ProkipBookingLandingBlocks";

/**
 * Wraps children in whichever per-template React Context the active
 * template needs (Kids, Perfumes, Electronics, etc). Every reusable
 * product-grid / header / footer block reads its store data — including
 * addToCart, toggleWishlist, and isWishlisted — via these contexts
 * instead of props.
 *
 * IMPORTANT: this must wrap <RenderTemplateBlocks /> on every storefront
 * page that can render template blocks (home, shop, product, about,
 * contact, blog, etc), not just the homepage. Without it, any block that
 * reads storeCtx?.toggleWishlist / storeCtx?.addToCart / storeCtx?.onQuickView
 * silently no-ops — the button appears clickable but does nothing, with
 * no error.
 */
export function TemplateStoreContextProvider({
  templateSlug,
  products,
  blogs,
  categories,
  currency,
  storeSlug,
  socialLinks,
  addToCart,
  toggleWishlist,
  isWishlisted,
  onQuickView,
  children,
}: {
  templateSlug: string | null;
  products: any[];
  blogs: any[];
  categories?: Array<{ id: string; name: string; slug: string; description?: string | null; image?: string | null }>;
  currency: string;
  storeSlug: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  addToCart?: (productId: string, quantity?: number) => void;
  toggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
  onQuickView?: (productId: string) => void;
  children: React.ReactNode;
}) {
  const value = { products, blogs, categories, currency, storeSlug, socialLinks, addToCart, toggleWishlist, isWishlisted, onQuickView };

  // Determine which context to use based on template slug
  const slug = templateSlug || "";
  if (slug === "electronics" || slug === "electronics-accessories" || slug === "hardware" || slug === "tools") {
    return <ElectronicsStoreContext.Provider value={value}>{children}</ElectronicsStoreContext.Provider>;
  }
  if (slug === "sweets-bakery") {
    return <BakeryStoreContext.Provider value={value}>{children}</BakeryStoreContext.Provider>;
  }
  if (slug === "cosmetics") {
    return <CosmeticsStoreContext.Provider value={value}>{children}</CosmeticsStoreContext.Provider>;
  }
  if (slug === "grocery" || slug === "vegetables") {
    return <GroceryStoreContext.Provider value={value}>{children}</GroceryStoreContext.Provider>;
  }
  if (slug === "pills") {
    return <HealthStoreContext.Provider value={value}>{children}</HealthStoreContext.Provider>;
  }
  if (slug === "decor" || slug === "retail") {
    return <InteriorStoreContext.Provider value={value}>{children}</InteriorStoreContext.Provider>;
  }
  if (slug === "kids") {
    return <KidsStoreContext.Provider value={value}>{children}</KidsStoreContext.Provider>;
  }
  if (slug === "toys") {
    return <ToysStoreContext.Provider value={value}>{children}</ToysStoreContext.Provider>;
  }
  if (slug === "makeup") {
    return <MakeupStoreContext.Provider value={value}>{children}</MakeupStoreContext.Provider>;
  }
  if (slug === "perfumes") {
    return <PerfumesStoreContext.Provider value={value}>{children}</PerfumesStoreContext.Provider>;
  }
  if (slug === "landing-gadget") {
    return <LandingGadgetContext.Provider value={{ storeSlug: storeSlug, products, currency, addToCart: addToCart as any }}>{children}</LandingGadgetContext.Provider>;
  }
  if (slug === "aegis" || slug === "aegis-landing") {
    return <AegisLandingContext.Provider value={{ storeSlug: storeSlug }}>{children}</AegisLandingContext.Provider>;
  }
  if (slug === "prokip-agent") {
    return <ProkipAgentLandingContext.Provider value={{ storeSlug: storeSlug }}>{children}</ProkipAgentLandingContext.Provider>;
  }
  if (slug === "prokip-booking") {
    return <ProkipBookingLandingContext.Provider value={{ storeSlug: storeSlug }}>{children}</ProkipBookingLandingContext.Provider>;
  }
  // Default: fashion family
  return <FashionStoreContext.Provider value={value}>{children}</FashionStoreContext.Provider>;
}
