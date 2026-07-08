"use client";

import { useMemo } from "react";
import { PublicBlockRenderer, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { ALL_TEMPLATE_BLOCKS } from "@/components/storefront/TemplateBlockRenderer";
import { FashionFontLoader } from "@/components/storefront/FashionTemplateBlocks";
import { ElectronicsFontLoader } from "@/components/storefront/ElectronicsTemplateBlocks";
import { BakeryFontLoader } from "@/components/storefront/BakeryTemplateBlocks";
import { CosmeticsFontLoader } from "@/components/storefront/CosmeticsTemplateBlocks";
import { GroceryFontLoader } from "@/components/storefront/GroceryTemplateBlocks";
import { HealthFontLoader } from "@/components/storefront/HealthTemplateBlocks";
import { InteriorFontLoader } from "@/components/storefront/InteriorDesignTemplateBlocks";
import { KidsFontLoader } from "@/components/storefront/KidsTemplateBlocks";
import { MakeupFontLoader } from "@/components/storefront/MakeupTemplateBlocks";
import { PerfumesFontLoader } from "@/components/storefront/PerfumesTemplateBlocks";

const FONT_LOADER_MAP: Record<string, React.ComponentType> = {
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

function getFontLoaderForType(type: string): React.ComponentType {
  for (const [prefix, Loader] of Object.entries(FONT_LOADER_MAP)) {
    if (type.startsWith(prefix)) return Loader;
  }
  return FashionFontLoader;
}

interface BlockRendererProps {
  block: BuilderBlock;
  isSelected?: boolean;
  onInlineEdit?: (key: string, value: string) => void;
}

export default function BlockRenderer({ block, isSelected, onInlineEdit }: BlockRendererProps) {
  const editablePreview = useMemo(() => {
    if (!isSelected || typeof onInlineEdit !== "function") return null;
    if (block.type !== "heading" && block.type !== "text") return null;
    return block;
  }, [block, isSelected, onInlineEdit]);

  if (editablePreview) {
    return <InlineEditableBlock block={editablePreview} onInlineEdit={onInlineEdit} />;
  }

  // Template blocks (fashion, electronics, bakery, cosmetics, etc.)
  const TemplateComponent = ALL_TEMPLATE_BLOCKS[block.type];
  if (TemplateComponent) {
    const FontLoader = getFontLoaderForType(block.type);
    return (
      <>
        <FontLoader />
        <TemplateComponent {...(block.props as Record<string, unknown>)} />
      </>
    );
  }

  return <PublicBlockRenderer block={block} />;
}

function InlineEditableBlock({
  block,
  onInlineEdit,
}: {
  block: BuilderBlock;
  onInlineEdit?: (key: string, value: string) => void;
}) {
  const isHeading = block.type === "heading";
  const text = (block.props.text as string) || "";
  const align = (block.props.align as string) || "left";
  const color = (block.props.color as string) || (isHeading ? "#171717" : "#525252");

  if (isHeading) {
    const sizeMap: Record<string, string> = { xl: "text-xl", "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl" };
    const sizeClass = sizeMap[(block.props.fontSize as string) || "2xl"] || "text-2xl";
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(event) => onInlineEdit?.("text", event.currentTarget.textContent || "")}
        className={`font-display font-bold ${sizeClass} outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 rounded-lg px-1 -mx-1 cursor-text`}
        style={{ color, textAlign: align as React.CSSProperties["textAlign"] }}
      >
        {text}
      </div>
    );
  }

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={(event) => onInlineEdit?.("text", event.currentTarget.textContent || "")}
      className="outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 rounded-lg px-1 -mx-1 cursor-text"
      style={{ color, textAlign: align as React.CSSProperties["textAlign"] }}
    >
      {text}
    </div>
  );
}
