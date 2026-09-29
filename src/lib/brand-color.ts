// Optional merchant "brand color" for AI-generated stores.
// Only applied when the merchant actually picked one — otherwise the store keeps its default look.

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Returns a lowercase "#rrggbb" string, or null for anything that isn't a valid hex color. */
export function normalizeBrandColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const m = value.trim().match(HEX);
  if (!m) return null;
  let h = m[1].toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return `#${h}`;
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** White or near-black — whichever is easier to read on top of `hex`. */
export function readableTextOn(hex: string): string {
  return luminance(hex) > 0.4 ? "#1a1a1a" : "#ffffff";
}

/** Lighten (amount > 0) or darken (amount < 0) a color by mixing toward white / black. */
export function shadeColor(hex: string, amount: number): string {
  const target = amount >= 0 ? 255 : 0;
  const a = Math.min(1, Math.abs(amount));
  const [r, g, b] = channels(hex).map((v) => Math.round(v + (target - v) * a));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
