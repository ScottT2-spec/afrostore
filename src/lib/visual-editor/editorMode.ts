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
