"use client";

import { RenderBlocks } from "@/components/storefront/BlockRenderer";

export default function MenuSection(props: Record<string, unknown>) {
  return <RenderBlocks blocks={[{ id: "menu", type: "menu", props }]} />;
}
