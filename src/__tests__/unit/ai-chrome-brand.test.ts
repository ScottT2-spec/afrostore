import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AiStoreHeader, AiStoreFooter } from "@/components/storefront/AiStoreChrome";

const h = (brandColor?: string | null) =>
  renderToStaticMarkup(React.createElement(AiStoreHeader, { storeName: "Kwame", storeSlug: "kwame", brandColor }));
const f = (brandColor?: string | null) =>
  renderToStaticMarkup(React.createElement(AiStoreFooter, { storeName: "Kwame", storeSlug: "kwame", brandColor }));

describe("AI header/footer brand color is opt-in", () => {
  it("no color chosen → default look, no overrides", () => {
    expect(h()).toContain("#F1E4C8");
    expect(f()).toContain("#b5b5b2");
    for (const html of [h(), h(null), h(""), h("not-a-color"), f(), f(null), f("javascript:x")]) {
      expect(html).not.toContain("background: #0f62fe");
      expect(html).not.toContain("ai-nav-badge { background: #ffffff");
    }
    // identical output to "no prop at all"
    expect(h(null)).toBe(h());
    expect(h("not-a-color")).toBe(h());
    expect(f("")).toBe(f());
  });
  it("dark brand color → colored background + white links", () => {
    const html = h("#0F62FE");
    expect(html).toContain(".ai-nav-wrap { background: #0f62fe;");
    expect(html).toMatch(/\.ai-nav-link[^}]*color: #ffffff/);
    const foot = f("#0f62fe");
    expect(foot).toContain(".ai-footer-wrap { background: #0f62fe;");
    expect(foot).toMatch(/\.ai-footer-link[^}]*color: #ffffff/);
  });
  it("light brand color → dark text stays readable", () => {
    expect(h("#ffd400")).toMatch(/\.ai-nav-link[^}]*color: #1a1a1a/);
    expect(f("#ffd400")).toMatch(/\.ai-footer-link[^}]*color: #1a1a1a/);
  });
  it("CSS-injection attempts are ignored", () => {
    expect(h("#fff;} body{display:none")).toBe(h());
    expect(f("red;}</style><script>")).toBe(f());
  });
});
