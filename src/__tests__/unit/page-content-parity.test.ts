import { describe, expect, it } from "vitest";
import { parsePageContent, serializePageContent } from "@/lib/page-content";
import { buildTemplatePageContent } from "@/lib/templates/template-tree";
import { mergeStoredTemplatePages } from "@/lib/templates/site-instance";

describe("page content parity", () => {
  it("preserves nested hero and FAQ trees through parse/serialize", () => {
    const content = buildTemplatePageContent([
      {
        id: "hero-1",
        type: "groceryHeroSlider",
        settings: {
          title: "Fresh groceries",
        },
        elements: [
          {
            id: "slide-1",
            type: "slide",
            settings: {
              titleLine1: "Delivered",
              titleLine2: "daily",
              buttonText: "Shop now",
            },
            elements: [],
          },
          {
            id: "slide-2",
            type: "slide",
            settings: {
              titleLine1: "Weekly",
              titleLine2: "deals",
              buttonText: "Browse",
            },
            elements: [],
          },
        ],
      },
      {
        id: "faq-1",
        type: "faqSection",
        settings: {
          title: "FAQ",
        },
        elements: [
          {
            id: "faq-item-1",
            type: "faqItem",
            settings: {
              question: "Do you deliver?",
              answer: "Yes, we do.",
            },
            elements: [],
          },
          {
            id: "faq-item-2",
            type: "faqItem",
            settings: {
              question: "Can I order in bulk?",
              answer: "Bulk orders are available.",
            },
            elements: [],
          },
        ],
      },
    ], { backgroundColor: "#ff00aa" });

    const parsed = parsePageContent(content);
    expect(parsed.elements).toHaveLength(2);
    expect(parsed.blocks).toHaveLength(2);
    expect(parsed.settings.backgroundColor).toBe("#ff00aa");
    expect(parsed.blocks[0].elements).toHaveLength(2);
    expect(parsed.blocks[0].elements?.[0].props?.titleLine1).toBe("Delivered");
    expect(parsed.blocks[1].elements).toHaveLength(2);
    expect(parsed.blocks[1].elements?.[1].props?.question).toBe("Can I order in bulk?");

    const serialized = serializePageContent(parsed);
    expect(Array.isArray((serialized as any).elements)).toBe(true);
    expect((serialized as any).elements).toHaveLength(2);
  });

  it("keeps stored page content ahead of template defaults when slugs collide", () => {
    const storedPage = {
      id: "page-1",
      slug: "about",
      content: buildTemplatePageContent([
        {
          id: "hero-1",
          type: "groceryHeroSlider",
          settings: {
            title: "Saved content",
          },
          elements: [],
        },
      ], {}),
    };

    const templatePage = {
      id: "page-template",
      slug: "about",
      content: buildTemplatePageContent([
        {
          id: "hero-template",
          type: "groceryHeroSlider",
          settings: {
            title: "Preset content",
          },
          elements: [],
        },
      ], {}),
    };

    const merged = mergeStoredTemplatePages([storedPage], [templatePage]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("page-1");
    expect((merged[0].content as any).elements[0].settings.title).toBe("Saved content");
  });
});
