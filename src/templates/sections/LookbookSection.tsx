"use client";

import { RenderBlocks } from "@/components/storefront/BlockRenderer";

export default function LookbookSection(props: Record<string, unknown>) {
  return <RenderBlocks blocks={[{ id: "lookbook", type: "lookbook", props }]} />;
}
