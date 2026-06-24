"use client";

import { RenderBlocks } from "@/components/storefront/BlockRenderer";

export default function PortfolioSection(props: Record<string, unknown>) {
  return <RenderBlocks blocks={[{ id: "portfolio", type: "portfolio", props }]} />;
}
