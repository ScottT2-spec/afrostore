"use client";

import { useMemo } from "react";
import { PublicBlockRenderer, type BuilderBlock } from "@/components/storefront/BlockRenderer";

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
