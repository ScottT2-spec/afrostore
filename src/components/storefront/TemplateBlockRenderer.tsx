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

/* ─── SINGLE BLOCK RENDERER ────────────────────────────────── */

function RenderTemplateBlock({ block }: { block: TemplateBlock }) {
  const Component = FASHION_BLOCKS[block.type];

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
  return (
    <div className="fashion-template">
      <FashionFontLoader />
      {blocks.map((block) => (
        <RenderTemplateBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

/* ─── EXPORTS ───────────────────────────────────────────────── */

export { FASHION_BLOCKS };
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
