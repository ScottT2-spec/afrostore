import { describe, it, expect } from "vitest";
import { normalizeBrandColor, readableTextOn, shadeColor } from "@/lib/brand-color";

describe("brand color helpers", () => {
  it("normalizes valid hex and rejects junk", () => {
    expect(normalizeBrandColor("#0F62FE")).toBe("#0f62fe");
    expect(normalizeBrandColor("0f62fe")).toBe("#0f62fe");
    expect(normalizeBrandColor("#abc")).toBe("#aabbcc");
    for (const bad of ["", "red", "#12", "#gggggg", "url(x)", "#fff;}</style>", null, undefined, 5]) {
      expect(normalizeBrandColor(bad)).toBeNull();
    }
  });
  it("picks readable text", () => {
    expect(readableTextOn("#000000")).toBe("#ffffff");
    expect(readableTextOn("#0f62fe")).toBe("#ffffff");
    expect(readableTextOn("#ffffff")).toBe("#1a1a1a");
    expect(readableTextOn("#f1e4c8")).toBe("#1a1a1a");
    expect(readableTextOn("#ffd400")).toBe("#1a1a1a");
  });
  it("shades toward white/black", () => {
    expect(shadeColor("#808080", 0.5)).toBe("#c0c0c0");
    expect(shadeColor("#808080", -0.5)).toBe("#404040");
  });
});

import { brandButtonCss } from "@/lib/brand-color";
describe("brandButtonCss (buttons only)", () => {
  it("is empty unless a valid color is chosen", () => {
    for (const v of [undefined, null, "", "red", "#zzz", "#fff;}x{"]) expect(brandButtonCss(v)).toBe("");
  });
  it("targets buttons, never header/footer/links", () => {
    const css = brandButtonCss("#0F62FE");
    expect(css).toContain("#0f62fe");
    expect(css).toContain(".btn-primary");
    expect(css).toContain('a[class~="bg-brand-600"]');
    expect(css).not.toMatch(/ai-nav|ai-footer|header|footer/);
    expect(css).not.toContain('bg-white');
    expect(brandButtonCss("#ffd400")).toContain("color:#1a1a1a");
  });
});
