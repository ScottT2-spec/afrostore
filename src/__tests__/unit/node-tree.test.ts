import { describe, expect, it } from "vitest";
import {
  buildScopedNodeCss,
  migrateLegacyPageContentToEditorTree,
  normalizeEditorNodeTree,
  resolveNodeHoverStyles,
  resolveNodeStyles,
} from "@/lib/visual-editor/node-tree";
import { widgetDefinitions } from "@/lib/visual-editor/widgets";
import { FASHION_TEMPLATE_PRESET } from "@/lib/templates/presets/fashion-preset";

describe("resolveNodeStyles", () => {
  it("maps flat settings into CSS properties without block-specific branching", () => {
    const styles = resolveNodeStyles({
      backgroundColor: "#ffffff",
      textColor: "#111111",
      fontSize: "18px",
      fontStyle: "italic",
      width: "100%",
      height: "auto",
      minHeight: "320px",
      maxHeight: "80vh",
      paddingTop: "12px",
      paddingRight: "16px",
      paddingBottom: "12px",
      paddingLeft: "16px",
      borderRadius: "20px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    });

    expect(styles).toMatchObject({
      backgroundColor: "#ffffff",
      color: "#111111",
      fontSize: "18px",
      fontStyle: "italic",
      width: "100%",
      height: "auto",
      minHeight: "320px",
      maxHeight: "80vh",
      paddingTop: "12px",
      paddingRight: "16px",
      paddingBottom: "12px",
      paddingLeft: "16px",
      borderRadius: "20px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    });
    expect(styles.padding).toBeUndefined();
  });

  it("resolves hover-prefixed settings separately", () => {
    const hoverStyles = resolveNodeHoverStyles({
      hoverBackgroundColor: "#f4f4f4",
      hoverTextColor: "#222222",
      hoverScale: 1.05,
    });

    expect(hoverStyles).toMatchObject({
      backgroundColor: "#f4f4f4",
      color: "#222222",
      transform: "scale(1.05)",
    });
  });
});

describe("migrateLegacyPageContentToEditorTree", () => {
  it("converts legacy blocks into recursive editor nodes with flat settings", () => {
    const migrated = migrateLegacyPageContentToEditorTree({
      settings: {
        backgroundColor: "#fafafa",
      },
      customCss: ".hero { color: red; }",
      blocks: [
        {
          id: "hero-1",
          type: "fashionHeroSlider",
          styleOverrides: {
            backgroundColor: "#ffffff",
            textColor: "#1f2937",
            paddingTop: "24px",
            paddingRight: "24px",
            paddingBottom: "24px",
            paddingLeft: "24px",
          },
          props: {
            title: "Fresh arrivals",
            slides: [
              { title: "Slide one", text: "Alpha" },
              { title: "Slide two", text: "Beta" },
            ],
            tags: ["new", "featured"],
          },
        },
      ],
    });

    expect(migrated.settings).toMatchObject({
      backgroundColor: "#fafafa",
      customCss: ".hero { color: red; }",
    });
    expect(migrated.elements).toHaveLength(1);

    const [node] = migrated.elements;
    expect(node).toMatchObject({
      id: "hero-1",
      type: "fashionHeroSlider",
    });
    expect(node.settings).toMatchObject({
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      paddingTop: "24px",
      paddingRight: "24px",
      paddingBottom: "24px",
      paddingLeft: "24px",
      title: "Fresh arrivals",
      tags: "new, featured",
    });
    const childNodes = node.elements ?? [];
    expect(childNodes).toHaveLength(2);
    expect(childNodes[0]).toMatchObject({
      type: "slide",
      settings: {
        title: "Slide one",
        text: "Alpha",
      },
    });
  });

  it("normalizes a real fashion-style legacy block with nested styles and lifted slides", () => {
    const sectionDefaults = widgetDefinitions.find((widget) => widget.type === "section")?.defaultStyles || {};
    const legacyFashionBlock = {
      id: "fashion-hero-legacy",
      type: "fashionHeroSlider",
      styles: sectionDefaults,
      props: {
        title: { id: "hero-title", name: "Fresh arrivals", slug: "fresh-arrivals" },
      },
      elements: FASHION_TEMPLATE_PRESET[0].elements,
    };

    const [node] = normalizeEditorNodeTree([legacyFashionBlock]);

    expect(node.id).toBe("fashion-hero-legacy");
    expect(node.type).toBe("fashionHeroSlider");
    expect(node.settings).toMatchObject({
      fontFamily: "Inter, sans-serif",
      fontSize: "16px",
      backgroundColor: "transparent",
      paddingTop: "60px",
      paddingRight: "0",
      paddingBottom: "60px",
      paddingLeft: "0",
    });
    expect(node.settings["title.name"]).toBe("Fresh arrivals");
    const slides = node.elements ?? [];
    expect(slides).toHaveLength(3);
    expect(slides[0].id).toEqual(expect.any(String));
    expect(slides[0].type).toBe("slide");
    expect(slides[0].settings).toMatchObject({
      subtitle: "YOUR FAVOURITE STORE",
      titleLine1: "Blondes with minimalistic",
      titleLine2: "tendencies to vintage",
      buttonText: "SHOP NOW",
    });
  });

  it("keeps unset spacing sides unset instead of forcing shorthand zeros", () => {
    const styles = resolveNodeStyles({
      paddingTop: "24px",
    });

    expect(styles).toMatchObject({
      paddingTop: "24px",
    });
    expect(styles.paddingRight).toBeUndefined();
    expect(styles.paddingBottom).toBeUndefined();
    expect(styles.paddingLeft).toBeUndefined();
    expect(styles.padding).toBeUndefined();
  });

  it("builds scoped CSS with ids, classes, hover rules, and breakpoint overrides", () => {
    const css = buildScopedNodeCss({
      id: "node-hero",
      type: "section",
      settings: {
        cssId: "hero-section",
        cssClass: "hero promo",
        backgroundColor: "#ffffff",
        fontStyle: "italic",
        hoverBackgroundColor: "#111111",
        hoverBorderRadius: "24px",
        desktop: {
          fontSize: "18px",
          paddingTop: "24px",
        },
        tablet: {
          fontSize: "16px",
        },
        mobile: {
          fontSize: "14px",
        },
      } as any,
      elements: [],
    } as any);

    expect(css).toContain('.editor-node-node-hero, [data-editor-node-id="node-hero"], #hero-section, .hero, .promo');
    expect(css).toContain("background-color: #ffffff");
    expect(css).toContain("font-style: italic");
    expect(css).toContain(
      '.editor-node-node-hero:hover, [data-editor-node-id="node-hero"]:hover, #hero-section:hover, .hero:hover, .promo:hover',
    );
    expect(css).toContain("background-color: #111111");
    expect(css).toContain("@media (min-width: 1025px)");
    expect(css).toContain("font-size: 18px");
    expect(css).toContain("@media (min-width: 768px) and (max-width: 1024px)");
    expect(css).toContain("font-size: 16px");
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("font-size: 14px");
  });

  it("preserves responsive editor settings during migration and emits scoped responsive CSS", () => {
    const tree = normalizeEditorNodeTree([
      {
        id: "hero-node",
        type: "section",
        settings: {
          backgroundColor: "#ffffff",
          desktop: {
            fontSize: "20px",
            paddingTop: "32px",
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
            },
            elements: [],
          },
        ],
      },
    ]);

    expect(tree).toHaveLength(1);
    expect((tree[0].settings as any).desktop).toMatchObject({ fontSize: "20px", paddingTop: "32px" });

    const css = buildScopedNodeCss(tree[0] as any);
    expect(css).toContain("background-color: #ffffff");
    expect(css).toContain("@media (min-width: 1025px)");
    expect(css).toContain("font-size: 20px");
    expect(css).toContain("@media (min-width: 768px) and (max-width: 1024px)");
    expect(css).toContain("font-size: 18px");
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("font-size: 16px");
  });
});
