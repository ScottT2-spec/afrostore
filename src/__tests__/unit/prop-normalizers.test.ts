// @vitest-environment jsdom

import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { normalizeArrayValue, normalizeSocialLinks, normalizeStorefrontTemplateProps, normalizeTextArray, resolveNestedNodeText } from "@/components/storefront/prop-normalizers";
import { InlineEditableText } from "@/components/storefront/InlineEditableText";
import { RenderTemplateBlocks, isRegisteredTemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { FashionPromoBanners } from "@/components/storefront/FashionTemplateBlocks";
import { AccessoriesFaqsContactInfo, AccessoriesStrategySection } from "@/components/storefront/AccessoriesTemplateBlocks";
import { BakeryCategoryInfoBoxes, BakeryHeroSlider } from "@/components/storefront/BakeryTemplateBlocks";
import { KidsBundlePromo } from "@/components/storefront/KidsTemplateBlocks";
import { MakeupProductTypeCards, MakeupVideoBlog } from "@/components/storefront/MakeupTemplateBlocks";
import { InteriorBrandsBar, InteriorOfficeLocations, InteriorStatsCounters } from "@/components/storefront/InteriorDesignTemplateBlocks";
import { LandingGadgetHero } from "@/components/storefront/LandingGadgetBlocks";
import { useEditorStore } from "@/lib/visual-editor/store";

describe("prop-normalizers", () => {
  it("converts relation-like objects into primitive template props", () => {
    const normalized = normalizeStorefrontTemplateProps({
      title: { id: "cat-1", name: "Summer Picks", slug: "summer-picks" },
      category: { id: "cat-2", name: "Accessories", slug: "accessories" },
      customCss: ".x { color: red; }",
    });

    expect(normalized.title).toBe("Summer Picks");
    expect(normalized.category).toBe("Accessories");
    expect(normalized.customCss).toBe(".x { color: red; }");
  });

  it("normalizes socialLinks object maps into arrays", () => {
    expect(
      normalizeSocialLinks({
        facebook: "#",
        instagram: "https://instagram.com/example",
        youtube: "https://youtube.com/example",
      }),
    ).toEqual([
      { platform: "facebook", url: "#" },
      { platform: "instagram", url: "https://instagram.com/example" },
      { platform: "youtube", url: "https://youtube.com/example" },
    ]);
  });

  it("normalizes text arrays and relation objects into string arrays", () => {
    expect(normalizeTextArray([{ id: "tab-1", name: "New" }, { id: "tab-2", name: "Sale" }], [])).toEqual(["New", "Sale"]);
    expect(normalizeTextArray({ id: "tab-3", name: "Featured" }, [])).toEqual(["Featured"]);
  });

  it("resolves nested hero text from child nodes instead of schema labels", () => {
    const node = {
      id: "hero-1",
      type: "fashionHeroSlider",
      settings: {
        autoplaySpeed: 5000,
      },
      elements: [
        {
          id: "slide-1",
          type: "slide",
          settings: {
            titleLine1: "Handcrafted Excellence",
            subtitle: "ABOUT US",
          },
          elements: [],
        },
      ],
    };

    expect(resolveNestedNodeText(node, ["titleLine1", "title"], "Title")).toBe("Handcrafted Excellence");
    expect(resolveNestedNodeText(node, ["subtitle"], "")).toBe("ABOUT US");
  });

  it("normalizes array-shaped storefront props into safe arrays", () => {
    expect(normalizeStorefrontTemplateProps({}).banners).toEqual([]);
    expect(normalizeStorefrontTemplateProps({}).bodyText).toEqual([]);
    expect(normalizeStorefrontTemplateProps({}).boxes).toEqual([]);
    expect(normalizeStorefrontTemplateProps({}).brands).toEqual([]);
    expect(normalizeStorefrontTemplateProps({}).cards).toEqual([]);
    expect(normalizeStorefrontTemplateProps({}).members).toEqual([]);
    expect(normalizeStorefrontTemplateProps({}).productImages).toEqual([]);
    expect(normalizeStorefrontTemplateProps({}).videos).toEqual([]);
    expect(normalizeStorefrontTemplateProps({}).team).toEqual([]);
    expect(normalizeStorefrontTemplateProps({}).offices).toEqual([]);

    const normalizedObject = normalizeStorefrontTemplateProps({
      banners: { id: "banner-1", title: "Winter Sale" },
      tabs: { id: "tab-1", name: "New" },
      socialLinks: {
        instagram: "https://instagram.com/example",
      },
      items: { id: "item-1", title: "One" },
    });

    const normalizedPrimitive = normalizeStorefrontTemplateProps({
      banners: "hero-banner",
    });

    expect(normalizedObject.banners).toEqual([{ id: "banner-1", title: "Winter Sale" }]);
    expect(normalizedObject.tabs).toEqual(["New"]);
    expect(normalizedObject.socialLinks).toEqual([{ platform: "instagram", url: "https://instagram.com/example" }]);
    expect(normalizedObject.items).toEqual([{ id: "item-1", title: "One" }]);
    expect(normalizedPrimitive.banners).toEqual(["hero-banner"]);
  });

  it("wraps primitive array inputs safely", () => {
    expect(normalizeArrayValue("single")).toEqual(["single"]);
    expect(normalizeArrayValue({ id: "x" })).toEqual([{ id: "x" }]);
    expect(normalizeArrayValue(undefined)).toEqual([]);
  });

  it("renders FashionPromoBanners without a banners prop", () => {
    expect(() => renderToStaticMarkup(React.createElement(FashionPromoBanners, {} as any))).not.toThrow();
  });

  it("keeps grocery slide children inside the parent template block render path", () => {
    expect(isRegisteredTemplateBlock("slide")).toBe(false);

    const markup = renderToStaticMarkup(
      React.createElement(RenderTemplateBlocks, {
        isEditor: true,
        blocks: [
          {
            id: "grocery-hero",
            type: "groceryHeroSlider",
            props: { autoplaySpeed: 5000 },
            elements: [
              {
                id: "slide-1",
                type: "slide",
                props: {
                  label: "Weekly discounts",
                  titleLine1: "Fresh produce",
                  titleLine2: "Delivered daily",
                  description: "Farm to door",
                  buttonText: "Shop now",
                  buttonLink: "/shop",
                  backgroundColor: "#f8f4e8",
                  productImage: "https://example.com/slide.png",
                },
                elements: [],
              },
            ],
          } as any,
        ],
      } as any),
    );

    expect(markup).not.toContain("Unknown template block type");
    expect(markup).toContain('data-inline-field="titleLine1"');
    expect(markup).toContain('data-inline-field="buttonText"');
    expect(markup).toContain('data-editor-node-id="slide-1"');
  });

  it("renders other array-driven template blocks without missing props crashing", () => {
    expect(() => renderToStaticMarkup(React.createElement(AccessoriesStrategySection, { title: "T", infoboxes: [] } as any))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(AccessoriesFaqsContactInfo, { contactInfo: { address: "", phones: [], emails: [] } } as any))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(BakeryHeroSlider, {} as any))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(BakeryCategoryInfoBoxes, {} as any))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(KidsBundlePromo, { title: "Bundle", productImages: [] } as any))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(MakeupProductTypeCards, { cards: [] } as any))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(MakeupVideoBlog, { videos: [] } as any))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(InteriorBrandsBar, {} as any))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(InteriorStatsCounters, { counters: [] } as any))).not.toThrow();
    expect(() => renderToStaticMarkup(React.createElement(InteriorOfficeLocations, { offices: [] } as any))).not.toThrow();
  });

  it("renders the landing gadget hero with saved content and style fields", () => {
    const markup = renderToStaticMarkup(
      React.createElement(LandingGadgetHero, {
        titleLine1: "LANDING_PARITY_TOKEN_42",
        titleLine2: "Hero copy",
        description: "The live site should show this exact text.",
        primaryButtonText: "Buy now",
        secondaryButtonText: "View More",
        backgroundColor: "#c83232",
        textColor: "#114cac",
      } as any),
    );

    expect(markup).toContain("LANDING_PARITY_TOKEN_42");
    expect(markup).toContain("Hero copy");
    expect(markup).toContain("#c83232");
    expect(markup).toContain("#114cac");
  });

  it("keeps Space key events inside the inline editor", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);
    let bubbled = false;

    useEditorStore.setState((state) => ({
      ...state,
      pageStructure: {
        ...state.pageStructure,
        elements: [
          {
            id: "hero-node",
            type: "heading",
            parentId: null,
            order: 0,
            visible: true,
            locked: false,
            name: "Heading",
            settings: {},
            styles: {},
            responsiveStyles: {},
            content: {},
            children: [],
          },
        ],
      } as any,
      selectedElementId: null,
      isDirty: false,
    }));

    act(() => {
      root.render(
        React.createElement(
          "div",
          { onKeyDown: () => { bubbled = true; } },
          React.createElement(InlineEditableText, {
            nodeId: "hero-node",
            field: "title",
            value: "Hello world",
            isEditor: true,
            as: "div",
          }),
        ),
      );
    });

    const editable = container.querySelector<HTMLElement>('[data-inline-editable="true"]');
    expect(editable).toBeTruthy();

    const event = new KeyboardEvent("keydown", {
      key: " ",
      code: "Space",
      bubbles: true,
      cancelable: true,
    });

    const notPrevented = editable!.dispatchEvent(event);

    expect(notPrevented).toBe(true);
    expect(bubbled).toBe(false);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
