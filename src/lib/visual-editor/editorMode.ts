// Single source of truth for how much of the editor's capability is
// visible. Nothing gated by this flag is ever deleted — every hidden tab,
// panel, and menu item still exists in the code exactly as before. Flip
// this one constant to `false` to instantly restore all of it across the
// entire editor (LeftSidebar, RightSidebar, StylePanel, ContextMenu,
// EditorToolbar) — that's the only place this needs to change.
//
// The goal of "simple mode" (the default): a merchant with zero design or
// technical background can fully customize their store — text, images,
// colors, spacing, layout, pages — without ever seeing a control they
// don't need. Power-user features (raw widget library, Advanced/custom-CSS
// tab, the Custom style controls, cut/copy/paste/lock, the layer
// navigator) stay fully built and one flag away from coming back.
export const EDITOR_SIMPLE_MODE = true;

// Some theme block maps (used both for real page rendering AND to populate
// the merchant-facing "Sections" list) mistakenly include internal/plumbing
// blocks alongside real content — e.g. a theme's FontLoader, which just
// silently loads a web font and has no visible content or settings at all.
// A merchant clicking it sees an empty node and has no idea what happened.
// This filters those out of the *list offered to merchants* only — it does
// not touch how any theme actually renders or loads fonts on the live site.
export function isMerchantFacingBlockType(blockType: string): boolean {
  return !/fontloader$/i.test(blockType);
}
