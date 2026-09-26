"use client";

/**
 * These are NOT industry template blocks — they're the general AI site
 * generator's own section types (src/lib/ai-layout-engine.ts, driven by
 * site-generation-agent.ts). Registered into TemplateBlockRenderer's
 * ALL_TEMPLATE_BLOCKS purely so the drag-and-drop visual editor
 * (EditorCanvas) recognizes them as "registered template blocks" —
 * which is what makes it (a) actually render them instead of falling
 * through to the raw-JSON placeholder, and (b) expose their fields in
 * the editor's Content/Style panels for editing.
 *
 * Each adapter wraps the exact same component the live storefront uses
 * (BlockRenderer.tsx), rather than re-implementing the section, so
 * there is exactly one place that owns what a section looks like — the
 * editor canvas and the live site can never visually drift apart.
 *
 * See node-tree.ts's migrateLegacyNode: every one of these types is
 * also in the verbatim-settings bypass there (alongside prokipAgent/
 * prokipBooking) for the same reason those are — these components read
 * array fields (items, faqs, stats, etc.) directly as a flat prop, not
 * as a nested children tree, so the generic array-to-child-nodes
 * migration must not run on them or it silently strips that data on
 * first save.
 */

import type { ComponentType } from "react";
import {
  HeroBlock,
  SpacerBlock,
  ProductGridBlock,
  TestimonialsBlock,
  FeaturesBlock,
  FAQBlock,
  ContactInfoBlock,
  StatsBlock,
  NewsletterBlock,
  CountdownBlock,
  TrustBadgesBlock,
  BannerBlock,
  ImageTextBlock,
  GalleryBlock,
  TeamBlock,
} from "./BlockRenderer";

function adapt(Block: ComponentType<{ props: Record<string, unknown> }>) {
  return function AiGeneratedBlockAdapter(props: Record<string, unknown>) {
    return <Block props={props} />;
  };
}

export const AiGeneratedHeroBlock = adapt(HeroBlock);
export const AiGeneratedSpacerBlock = adapt(SpacerBlock);
export const AiGeneratedProductGridBlock = adapt(ProductGridBlock);
export const AiGeneratedFeaturesBlock = adapt(FeaturesBlock);
export const AiGeneratedTestimonialsBlock = adapt(TestimonialsBlock);
export const AiGeneratedFAQBlock = adapt(FAQBlock);
export const AiGeneratedContactInfoBlock = adapt(ContactInfoBlock);
export const AiGeneratedStatsBlock = adapt(StatsBlock);
export const AiGeneratedNewsletterBlock = adapt(NewsletterBlock);
export const AiGeneratedCountdownBlock = adapt(CountdownBlock);
export const AiGeneratedTrustBadgesBlock = adapt(TrustBadgesBlock);
export const AiGeneratedBannerBlock = adapt(BannerBlock);
export const AiGeneratedImageTextBlock = adapt(ImageTextBlock);
export const AiGeneratedGalleryBlock = adapt(GalleryBlock);
export const AiGeneratedTeamBlock = adapt(TeamBlock);
