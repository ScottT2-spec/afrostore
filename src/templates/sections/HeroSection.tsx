"use client";

import { RenderBlocks } from "@/components/storefront/BlockRenderer";

export default function HeroSection(props: Record<string, unknown>) {
  return <RenderBlocks blocks={[{ id: "hero", type: "hero", props }]} />;
}
