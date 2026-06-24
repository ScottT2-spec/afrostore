"use client";

import { RenderBlocks } from "@/components/storefront/BlockRenderer";

export default function Reservations(props: Record<string, unknown>) {
  return <RenderBlocks blocks={[{ id: "reservations", type: "reservations", props }]} />;
}
