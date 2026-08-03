import { describe, expect, it } from "vitest";
import { buildEditorCanvasCss } from "@/components/visual-editor/EditorCanvas";

describe("buildEditorCanvasCss", () => {
  it("aggregates base, hover, breakpoint, and custom CSS for nested nodes", () => {
    const css = buildEditorCanvasCss([
      {
        id: "hero-node",
        type: "section",
        settings: {
          backgroundColor: "#ffffff",
          hoverBackgroundColor: "#111111",
          cssId: "hero-section",
          cssClass: "hero promo",
          customCss: ".hero-section .cta { border-radius: 999px; }",
          desktop: {
            paddingTop: "32px",
            fontSize: "20px",
          },
          tablet: {
            fontSize: "18px",
          },
          mobile: {
            fontSize: "16px",
          },
        },
        elements: [
          {
            id: "hero-child",
            type: "text",
            settings: {
              textColor: "#222222",
              hoverTextColor: "#ff0000",
              mobile: {
                fontSize: "14px",
              },
            },
            elements: [],
          },
        ],
      } as any,
    ]);

    expect(css).toContain('.editor-node-hero-node, [data-editor-node-id="hero-node"], #hero-section, .hero, .promo');
    expect(css).toContain('.editor-node-hero-node:hover, [data-editor-node-id="hero-node"]:hover, #hero-section:hover, .hero:hover, .promo:hover');
    expect(css).toContain("@media (min-width: 1025px)");
    expect(css).toContain("padding-top: 32px");
    expect(css).toContain("@media (min-width: 768px) and (max-width: 1024px)");
    expect(css).toContain("font-size: 18px");
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("font-size: 16px");
    expect(css).toContain(".hero-section .cta { border-radius: 999px; }");
    expect(css).toContain('.editor-node-hero-child, [data-editor-node-id="hero-child"]');
    expect(css).toContain('.editor-node-hero-child:hover, [data-editor-node-id="hero-child"]:hover');
  });
});
