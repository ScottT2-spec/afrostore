"use client";

import { RenderBlocks } from "@/components/storefront/BlockRenderer";

export default function FeaturedProducts(props: Record<string, unknown>) {
  return <RenderBlocks blocks={[{ id: "featured-products", type: "featured_products", props }]} />;
}
