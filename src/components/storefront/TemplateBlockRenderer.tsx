"use client";

import {
  FashionFontLoader,
  FashionHeroSlider,
  FashionPromoBanners,
  FashionSectionTitle,
  FashionProductGrid,
  FashionCategoryCards,
  FashionTestimonials,
  FashionBlogPosts,
  FashionNewsletter,
  FashionFooter,
  FashionFeatures,
  FashionInstagram,
  FashionMarquee,
  FashionCoverBanners,
} from "@/components/storefront/FashionTemplateBlocks";
import type {
  FashionHeroSliderProps,
  FashionPromoBannersProps,
  FashionSectionTitleProps,
  FashionProductGridProps,
  FashionCategoryCardsProps,
  FashionTestimonialsProps,
  FashionBlogPostsProps,
  FashionNewsletterProps,
  FashionFooterProps,
  FashionFeaturesProps,
  FashionInstagramProps,
  FashionMarqueeProps,
  FashionCoverBannersProps,
} from "@/components/storefront/FashionTemplateBlocks";
import {
  ElectronicsFontLoader,
  ElectronicsHeroSlider,
  ElectronicsPromoBanners,
  ElectronicsProductTabs,
  ElectronicsBannerGrid,
  ElectronicsHotDeals,
  ElectronicsSideBanner,
  ElectronicsGamingCTA,
  ElectronicsBlogPosts,
  ElectronicsPartners,
  ElectronicsFooter,
  ElectronicsSectionTitle,
} from "@/components/storefront/ElectronicsTemplateBlocks";
import {
  BakeryFontLoader,
  BakeryHeroSlider,
  BakerySectionTitle,
  BakeryCategoryInfoBoxes,
  BakeryHandmade,
  BakeryProductGrid,
  BakeryProcess,
  BakeryBlogPosts,
  BakeryCta,
  BakeryFooter,
} from "@/components/storefront/BakeryTemplateBlocks";
import {
  CosmeticsFontLoader,
  CosmeticsHeroSlider,
  CosmeticsPromoBanners,
  CosmeticsSectionTitle,
  CosmeticsProductGrid,
  CosmeticsCategoryCards,
  CosmeticsDiscovery,
  CosmeticsCountdownBanner,
  CosmeticsInfoBoxes,
  CosmeticsBlogPosts,
  CosmeticsInstagram,
  CosmeticsNewsletter,
  // CosmeticsFooter - handled at page level, not as block
} from "@/components/storefront/CosmeticsTemplateBlocks";
import {
  GroceryFontLoader,
  GroceryHeroSlider,
  GroceryFeaturesBar,
  GrocerySectionTitle,
  GroceryProductGrid,
  GroceryPromoBanners,
  GroceryCategoryGrid,
  GroceryNewsletter,
  GroceryBestSellers,
  GroceryFooter,
} from "@/components/storefront/GroceryTemplateBlocks";
import {
  HealthFontLoader,
  HealthHero,
  HealthMarquee,
  HealthPromoBanners,
  HealthSectionTitle,
  HealthCategoryCards,
  HealthProductGrid,
  HealthVideoSection,
  HealthFeatureSection,
  HealthTestimonials,
  HealthBlogPosts,
  HealthNewsletter,
  HealthBrandMarquee,
  HealthFooter,
} from "@/components/storefront/HealthTemplateBlocks";
import {
  InteriorFontLoader,
  InteriorHeroSlider,
  InteriorSectionTitle,
  InteriorCategoryGrid,
  InteriorProductGrid,
  InteriorInfoBoxes,
  InteriorGardenProducts,
  InteriorPromoBanners,
  InteriorFurnitureCategories,
  InteriorFurnitureProducts,
  InteriorBlogPosts,
  InteriorBrandsBar,
  InteriorCta,
  InteriorFooter,
} from "@/components/storefront/InteriorDesignTemplateBlocks";
import {
  KidsFontLoader,
  KidsAnnouncementBar,
  KidsHeroSlider,
  KidsSectionTitle,
  KidsCategoryCards,
  KidsProductGrid,
  KidsBundlePromo,
  KidsBlogPosts,
  KidsInstagram,
  KidsNewsletter,
  KidsFooter,
  KidsFooterFull,
} from "@/components/storefront/KidsTemplateBlocks";
import {
  MakeupFontLoader,
  MakeupHeroSlider,
  MakeupCategorySidebar,
  MakeupSectionTitle,
  MakeupProductGrid,
  MakeupProductTypeCards,
  MakeupBeforeAfter,
  MakeupPromoBannerCards,
  MakeupVideoBlog,
  MakeupBlogPosts,
  MakeupBrandsCarousel,
  MakeupFooter,
} from "@/components/storefront/MakeupTemplateBlocks";
import {
  PerfumesFontLoader,
  PerfumesHeroSlider,
  PerfumesSectionTitle,
  PerfumesProductGrid,
  PerfumesOlfactoryTags,
  PerfumesMarquee,
  PerfumesFeaturedBanners,
  PerfumesTabbedProducts,
  PerfumesCollectionBanners,
  PerfumesBlogArticles,
  PerfumesInstagram,
  PerfumesFooter,
} from "@/components/storefront/PerfumesTemplateBlocks";

/* ─── TYPES ─────────────────────────────────────────────────── */

export interface TemplateBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

/* ─── BLOCK TYPE MAP ────────────────────────────────────────── */

type BlockComponent = React.ComponentType<Record<string, unknown>>;

const FASHION_BLOCKS: Record<string, BlockComponent> = {
  fashionHeroSlider: FashionHeroSlider as unknown as BlockComponent,
  fashionPromoBanners: FashionPromoBanners as unknown as BlockComponent,
  fashionSectionTitle: FashionSectionTitle as unknown as BlockComponent,
  fashionProductGrid: FashionProductGrid as unknown as BlockComponent,
  fashionCategoryCards: FashionCategoryCards as unknown as BlockComponent,
  fashionTestimonials: FashionTestimonials as unknown as BlockComponent,
  fashionBlogPosts: FashionBlogPosts as unknown as BlockComponent,
  fashionNewsletter: FashionNewsletter as unknown as BlockComponent,
  fashionFooter: FashionFooter as unknown as BlockComponent,
  fashionFeatures: FashionFeatures as unknown as BlockComponent,
  fashionInstagram: FashionInstagram as unknown as BlockComponent,
  fashionMarquee: FashionMarquee as unknown as BlockComponent,
  fashionCoverBanners: FashionCoverBanners as unknown as BlockComponent,
};

const ELECTRONICS_BLOCKS: Record<string, BlockComponent> = {
  electronicsHeroSlider: ElectronicsHeroSlider as unknown as BlockComponent,
  electronicsPromoBanners: ElectronicsPromoBanners as unknown as BlockComponent,
  electronicsProductTabs: ElectronicsProductTabs as unknown as BlockComponent,
  electronicsBannerGrid: ElectronicsBannerGrid as unknown as BlockComponent,
  electronicsHotDeals: ElectronicsHotDeals as unknown as BlockComponent,
  electronicsSideBanner: ElectronicsSideBanner as unknown as BlockComponent,
  electronicsGamingCTA: ElectronicsGamingCTA as unknown as BlockComponent,
  electronicsBlogPosts: ElectronicsBlogPosts as unknown as BlockComponent,
  electronicsPartners: ElectronicsPartners as unknown as BlockComponent,
  electronicsFooter: ElectronicsFooter as unknown as BlockComponent,
  electronicsSectionTitle: ElectronicsSectionTitle as unknown as BlockComponent,
};

const BAKERY_BLOCKS: Record<string, BlockComponent> = {
  bakeryHeroSlider: BakeryHeroSlider as unknown as BlockComponent,
  bakerySectionTitle: BakerySectionTitle as unknown as BlockComponent,
  bakeryCategoryInfoBoxes: BakeryCategoryInfoBoxes as unknown as BlockComponent,
  bakeryHandmade: BakeryHandmade as unknown as BlockComponent,
  bakeryProductGrid: BakeryProductGrid as unknown as BlockComponent,
  bakeryProcess: BakeryProcess as unknown as BlockComponent,
  bakeryBlogPosts: BakeryBlogPosts as unknown as BlockComponent,
  bakeryCta: BakeryCta as unknown as BlockComponent,
  bakeryFooter: BakeryFooter as unknown as BlockComponent,
};

const COSMETICS_BLOCKS: Record<string, BlockComponent> = {
  cosmeticsHeroSlider: CosmeticsHeroSlider as unknown as BlockComponent,
  cosmeticsPromoBanners: CosmeticsPromoBanners as unknown as BlockComponent,
  cosmeticsSectionTitle: CosmeticsSectionTitle as unknown as BlockComponent,
  cosmeticsProductGrid: CosmeticsProductGrid as unknown as BlockComponent,
  cosmeticsCategoryCards: CosmeticsCategoryCards as unknown as BlockComponent,
  cosmeticsDiscovery: CosmeticsDiscovery as unknown as BlockComponent,
  cosmeticsCountdownBanner: CosmeticsCountdownBanner as unknown as BlockComponent,
  cosmeticsInfoBoxes: CosmeticsInfoBoxes as unknown as BlockComponent,
  cosmeticsBlogPosts: CosmeticsBlogPosts as unknown as BlockComponent,
  cosmeticsInstagram: CosmeticsInstagram as unknown as BlockComponent,
  cosmeticsNewsletter: CosmeticsNewsletter as unknown as BlockComponent,
  // cosmeticsFooter - handled at page level, not as block
};

const GROCERY_BLOCKS: Record<string, BlockComponent> = {
  groceryHeroSlider: GroceryHeroSlider as unknown as BlockComponent,
  groceryFeaturesBar: GroceryFeaturesBar as unknown as BlockComponent,
  grocerySectionTitle: GrocerySectionTitle as unknown as BlockComponent,
  groceryProductGrid: GroceryProductGrid as unknown as BlockComponent,
  groceryPromoBanners: GroceryPromoBanners as unknown as BlockComponent,
  groceryCategoryGrid: GroceryCategoryGrid as unknown as BlockComponent,
  groceryNewsletter: GroceryNewsletter as unknown as BlockComponent,
  groceryBestSellers: GroceryBestSellers as unknown as BlockComponent,
  groceryFooter: GroceryFooter as unknown as BlockComponent,
};

const HEALTH_BLOCKS: Record<string, BlockComponent> = {
  healthHero: HealthHero as unknown as BlockComponent,
  healthMarquee: HealthMarquee as unknown as BlockComponent,
  healthPromoBanners: HealthPromoBanners as unknown as BlockComponent,
  healthSectionTitle: HealthSectionTitle as unknown as BlockComponent,
  healthCategoryCards: HealthCategoryCards as unknown as BlockComponent,
  healthProductGrid: HealthProductGrid as unknown as BlockComponent,
  healthVideoSection: HealthVideoSection as unknown as BlockComponent,
  healthFeatureSection: HealthFeatureSection as unknown as BlockComponent,
  healthTestimonials: HealthTestimonials as unknown as BlockComponent,
  healthBlogPosts: HealthBlogPosts as unknown as BlockComponent,
  healthNewsletter: HealthNewsletter as unknown as BlockComponent,
  healthBrandMarquee: HealthBrandMarquee as unknown as BlockComponent,
  healthFooter: HealthFooter as unknown as BlockComponent,
};

const INTERIOR_BLOCKS: Record<string, BlockComponent> = {
  interiorHeroSlider: InteriorHeroSlider as unknown as BlockComponent,
  interiorSectionTitle: InteriorSectionTitle as unknown as BlockComponent,
  interiorCategoryGrid: InteriorCategoryGrid as unknown as BlockComponent,
  interiorProductGrid: InteriorProductGrid as unknown as BlockComponent,
  interiorInfoBoxes: InteriorInfoBoxes as unknown as BlockComponent,
  interiorGardenProducts: InteriorGardenProducts as unknown as BlockComponent,
  interiorPromoBanners: InteriorPromoBanners as unknown as BlockComponent,
  interiorFurnitureCategories: InteriorFurnitureCategories as unknown as BlockComponent,
  interiorFurnitureProducts: InteriorFurnitureProducts as unknown as BlockComponent,
  interiorBlogPosts: InteriorBlogPosts as unknown as BlockComponent,
  interiorBrandsBar: InteriorBrandsBar as unknown as BlockComponent,
  interiorCta: InteriorCta as unknown as BlockComponent,
  interiorFooter: InteriorFooter as unknown as BlockComponent,
};

const KIDS_BLOCKS: Record<string, BlockComponent> = {
  kidsAnnouncementBar: KidsAnnouncementBar as unknown as BlockComponent,
  kidsHeroSlider: KidsHeroSlider as unknown as BlockComponent,
  kidsSectionTitle: KidsSectionTitle as unknown as BlockComponent,
  kidsCategoryCards: KidsCategoryCards as unknown as BlockComponent,
  kidsProductGrid: KidsProductGrid as unknown as BlockComponent,
  kidsBundlePromo: KidsBundlePromo as unknown as BlockComponent,
  kidsBlogPosts: KidsBlogPosts as unknown as BlockComponent,
  kidsInstagram: KidsInstagram as unknown as BlockComponent,
  kidsNewsletter: KidsNewsletter as unknown as BlockComponent,
  kidsFooter: KidsFooter as unknown as BlockComponent,
  kidsFooterFull: KidsFooterFull as unknown as BlockComponent,
};

const MAKEUP_BLOCKS: Record<string, BlockComponent> = {
  makeupHeroSlider: MakeupHeroSlider as unknown as BlockComponent,
  makeupCategorySidebar: MakeupCategorySidebar as unknown as BlockComponent,
  makeupSectionTitle: MakeupSectionTitle as unknown as BlockComponent,
  makeupProductGrid: MakeupProductGrid as unknown as BlockComponent,
  makeupProductTypeCards: MakeupProductTypeCards as unknown as BlockComponent,
  makeupBeforeAfter: MakeupBeforeAfter as unknown as BlockComponent,
  makeupPromoBannerCards: MakeupPromoBannerCards as unknown as BlockComponent,
  makeupVideoBlog: MakeupVideoBlog as unknown as BlockComponent,
  makeupBlogPosts: MakeupBlogPosts as unknown as BlockComponent,
  makeupBrandsCarousel: MakeupBrandsCarousel as unknown as BlockComponent,
  makeupFooter: MakeupFooter as unknown as BlockComponent,
};

const PERFUMES_BLOCKS: Record<string, BlockComponent> = {
  perfumesHeroSlider: PerfumesHeroSlider as unknown as BlockComponent,
  perfumesSectionTitle: PerfumesSectionTitle as unknown as BlockComponent,
  perfumesProductGrid: PerfumesProductGrid as unknown as BlockComponent,
  perfumesOlfactoryTags: PerfumesOlfactoryTags as unknown as BlockComponent,
  perfumesMarquee: PerfumesMarquee as unknown as BlockComponent,
  perfumesFeaturedBanners: PerfumesFeaturedBanners as unknown as BlockComponent,
  perfumesTabbedProducts: PerfumesTabbedProducts as unknown as BlockComponent,
  perfumesCollectionBanners: PerfumesCollectionBanners as unknown as BlockComponent,
  perfumesBlogArticles: PerfumesBlogArticles as unknown as BlockComponent,
  perfumesInstagram: PerfumesInstagram as unknown as BlockComponent,
  perfumesFooter: PerfumesFooter as unknown as BlockComponent,
};

const ALL_TEMPLATE_BLOCKS: Record<string, BlockComponent> = {
  ...FASHION_BLOCKS,
  ...ELECTRONICS_BLOCKS,
  ...BAKERY_BLOCKS,
  ...COSMETICS_BLOCKS,
  ...GROCERY_BLOCKS,
  ...HEALTH_BLOCKS,
  ...INTERIOR_BLOCKS,
  ...KIDS_BLOCKS,
  ...MAKEUP_BLOCKS,
  ...PERFUMES_BLOCKS,
};

/* ─── FONT LOADER MAP ──────────────────────────────────────── */

const FONT_LOADERS: Record<string, React.ComponentType> = {
  fashion: FashionFontLoader,
  electronics: ElectronicsFontLoader,
  bakery: BakeryFontLoader,
  cosmetics: CosmeticsFontLoader,
  grocery: GroceryFontLoader,
  health: HealthFontLoader,
  interior: InteriorFontLoader,
  kids: KidsFontLoader,
  makeup: MakeupFontLoader,
  perfumes: PerfumesFontLoader,
};

/** Detect which template family a block set belongs to */
function detectTemplateFamily(blocks: TemplateBlock[]): string {
  for (const b of blocks) {
    const t = b.type;
    if (t.startsWith("electronics")) return "electronics";
    if (t.startsWith("bakery")) return "bakery";
    if (t.startsWith("cosmetics")) return "cosmetics";
    if (t.startsWith("grocery")) return "grocery";
    if (t.startsWith("health")) return "health";
    if (t.startsWith("interior")) return "interior";
    if (t.startsWith("kids")) return "kids";
    if (t.startsWith("makeup")) return "makeup";
    if (t.startsWith("perfumes")) return "perfumes";
    if (t.startsWith("fashion")) return "fashion";
  }
  return "fashion";
}

/* ─── SINGLE BLOCK RENDERER ────────────────────────────────── */

function RenderTemplateBlock({ block }: { block: TemplateBlock }) {
  const Component = ALL_TEMPLATE_BLOCKS[block.type];

  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div style={{ padding: 20, background: "#fff3cd", border: "1px solid #ffc107", margin: "10px 0", fontFamily: "monospace", fontSize: 13 }}>
          Unknown template block type: <strong>{block.type}</strong>
        </div>
      );
    }
    return null;
  }

  return <Component {...block.props} />;
}

/* ─── MAIN RENDERER ─────────────────────────────────────────── */

export interface RenderTemplateBlocksProps {
  blocks: TemplateBlock[];
  /** Pass real products to product grid blocks */
  products?: Array<Record<string, unknown>>;
}

export function RenderTemplateBlocks({ blocks }: RenderTemplateBlocksProps) {
  const family = detectTemplateFamily(blocks);
  const FontLoader = FONT_LOADERS[family] || FashionFontLoader;
  return (
    <div className={`${family}-template`}>
      <FontLoader />
      {blocks.map((block) => (
        <RenderTemplateBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

/* ─── EXPORTS ───────────────────────────────────────────────── */

export { FASHION_BLOCKS, ALL_TEMPLATE_BLOCKS };
export type {
  FashionHeroSliderProps,
  FashionPromoBannersProps,
  FashionSectionTitleProps,
  FashionProductGridProps,
  FashionCategoryCardsProps,
  FashionTestimonialsProps,
  FashionBlogPostsProps,
  FashionNewsletterProps,
  FashionFooterProps,
  FashionFeaturesProps,
  FashionInstagramProps,
  FashionMarqueeProps,
  FashionCoverBannersProps,
};
