"use client";

import { BookOpen, X } from "lucide-react";
import { BLOCK_ALIASES } from "@/lib/direct-edit";

/**
 * Human-friendly names for each block the AI editor understands.
 * Keys MUST match BLOCK_ALIASES in src/lib/direct-edit.ts (the aliases shown
 * here are read straight from it, so the guide can't drift from what the
 * editor actually recognises).
 */
const BLOCKS: Array<{ key: keyof typeof BLOCK_ALIASES; label: string; what: string }> = [
  { key: "hero", label: "Hero", what: "Big top section: headline, subtext, buttons, background image" },
  { key: "banner", label: "Banner", what: "Promo / announcement strip" },
  { key: "features", label: "Features", what: "\"Why choose us\" cards" },
  { key: "productgrid", label: "Products", what: "Product grid / shop section" },
  { key: "imagetext", label: "Story", what: "Image + text (our story, about)" },
  { key: "testimonials", label: "Testimonials", what: "Customer reviews" },
  { key: "stats", label: "Stats", what: "Numbers / highlights" },
  { key: "trustbadges", label: "Trust badges", what: "Small trust icons row" },
  { key: "gallery", label: "Gallery", what: "Image gallery" },
  { key: "faq", label: "FAQ", what: "Questions & answers" },
  { key: "team", label: "Team", what: "People on your team" },
  { key: "countdown", label: "Countdown", what: "Sale / launch timer" },
  { key: "newsletter", label: "Newsletter", what: "Email signup" },
  { key: "contactinfo", label: "Contact info", what: "Email, phone, address" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AIEditGuide({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="mb-2 max-h-[55vh] overflow-y-auto rounded-xl border border-surface-200 bg-white p-3 text-xs shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-semibold text-surface-800 text-sm">
          <BookOpen className="h-4 w-4 text-brand-600" /> How to edit with AI
        </div>
        <button onClick={onClose} aria-label="Close guide" className="text-surface-400 hover:text-surface-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <ol className="list-decimal pl-4 space-y-1 text-surface-600 mb-3">
        <li>Say <b>what</b> to change and <b>where</b> (the block name or page).</li>
        <li>Put exact wording in <b>&quot;quotes&quot;</b> — quoted text is replaced word-for-word.</li>
        <li>One change per message works best. Your site is never changed if an edit fails.</li>
      </ol>

      <div className="font-semibold text-surface-800 mb-1">Blocks the AI understands</div>
      <div className="space-y-1.5 mb-3">
        {BLOCKS.map((b) => (
          <div key={b.key} className="rounded-lg bg-surface-50 px-2 py-1.5">
            <div className="text-surface-800"><b>{b.label}</b> <span className="text-surface-500">— {b.what}</span></div>
            <div className="text-surface-400">You can also say: {BLOCK_ALIASES[b.key].filter((a) => a.toLowerCase() !== b.label.toLowerCase()).map((a) => `"${a}"`).join(", ") || "—"}</div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-surface-400">Tip: use the paperclip to upload an image, then say where it should go.</p>
    </div>
  );
}
