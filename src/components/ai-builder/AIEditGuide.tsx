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

const EXAMPLES = [
  { group: "Change text", items: [
    "Change \"Welcome to our store\" to \"Fresh food, delivered fast\" in the hero",
    "Change the button text \"Shop now\" to \"Order today\"",
  ]},
  { group: "Colors, images & buttons", items: [
    "Make the hero button green",
    "Use the image I uploaded as the hero background",
    "Make the Shop now button link to the products page",
  ]},
  { group: "Lists (features, FAQ, team…)", items: [
    "Add a new question to the FAQ about delivery time",
    "Remove the third item in Why choose us",
  ]},
  { group: "Whole site", items: [
    "Hide FAQ from the menu",
    "Change my phone number to 0803 000 0000",
    "Add my Instagram: https://instagram.com/mybrand",
    "Make the site look more premium and dark",
  ]},
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Puts an example into the chat box so the merchant can tweak and send it. */
  onPick: (text: string) => void;
}

export function AIEditGuide({ open, onClose, onPick }: Props) {
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

      <div className="font-semibold text-surface-800 mb-1">Try one (tap to use)</div>
      <div className="space-y-2">
        {EXAMPLES.map((g) => (
          <div key={g.group}>
            <div className="text-surface-500 mb-1">{g.group}</div>
            <div className="flex flex-col gap-1">
              {g.items.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { onPick(ex); onClose(); }}
                  className="text-left rounded-lg border border-surface-200 px-2 py-1.5 text-surface-700 hover:border-brand-300 hover:bg-brand-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-surface-400">Tip: use the paperclip to upload an image, then say where it should go.</p>
    </div>
  );
}
