"use client";

import { lazy, Suspense, useMemo } from "react";
import type { ComponentType } from "react";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import type { TemplateDefinition } from "@/lib/templates/types";

const HeroSection = lazy(() => import("./sections/HeroSection"));
const FeaturedProducts = lazy(() => import("./sections/FeaturedProducts"));
const MenuSection = lazy(() => import("./sections/MenuSection"));
const Reservations = lazy(() => import("./sections/Reservations"));
const LookbookSection = lazy(() => import("./sections/LookbookSection"));
const PortfolioSection = lazy(() => import("./sections/PortfolioSection"));

const lazySections: Record<string, ComponentType<Record<string, unknown>>> = {
  hero: HeroSection,
  featured_products: FeaturedProducts,
  productGrid: FeaturedProducts,
  menu: MenuSection,
  reservations: Reservations,
  lookbook: LookbookSection,
  portfolio: PortfolioSection,
  projects: PortfolioSection,
};

export default function TemplateRenderer({
  template,
  blocks,
  previewMode = false,
}: {
  template: TemplateDefinition;
  blocks?: BuilderBlock[];
  previewMode?: boolean;
}) {
  const renderBlocks = useMemo(() => blocks || template.themeConfig.sections, [blocks, template.themeConfig.sections]);

  return (
    <div className={previewMode ? "space-y-8 rounded-3xl border border-surface-200 bg-white p-4 shadow-sm" : "space-y-8"}>
      {renderBlocks.map((block) => {
        const Section = lazySections[block.type];
        if (!Section) return <RenderBlocks key={block.id} blocks={[block]} />;
        return (
          <Suspense key={block.id} fallback={<div className="h-24 animate-pulse rounded-xl bg-surface-100" />}>
            <Section {...block.props} />
          </Suspense>
        );
      })}
    </div>
  );
}
