import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { generatePages } from "@/lib/templates/recommendation";
import { TEMPLATE_FAMILY_PAGE_SETS, getFamilyTemplateBySlug } from "@/lib/templates/families";
import type { TemplateDefinition } from "@/lib/templates/types";

describe("template cloning", () => {
  it("keeps the selected template sections intact on the home page", () => {
    const template = getFamilyTemplateBySlug("restaurant-pro");
    assert.ok(template);

    const pages = generatePages(
      {
        businessName: "My Custom Business",
        description: "This should not rewrite the template look.",
      },
      template,
    );

    assert.equal(pages.length, TEMPLATE_FAMILY_PAGE_SETS[template.slug].length);
    assert.equal(pages[0].title, "Home");
    assert.deepEqual(pages[0].content, template.themeConfig.sections);
    assert.deepEqual(pages[0].content[0].props, {
      badge: "Restaurant Pro",
      heading: "Elevated dining experiences",
      subheading: "A refined menu-first layout with reservations, chef storytelling, and elegant gallery sections.",
      buttonText: "View Menu",
      buttonHref: "#menu",
      secondaryButtonText: "Reserve a Table",
      secondaryButtonHref: "#reservations",
      bgStyle: "dark",
    });
    assert.equal(pages[0].metaTitle, "Home — Restaurant Pro");
  });

  it("builds secondary pages from the template's own section map", () => {
    const template = getFamilyTemplateBySlug("clarity");
    assert.ok(template);

    const pages = generatePages(
      {
        businessName: "Acme Studio",
        description: "An agency site that should still follow the template.",
      },
      template,
    );

    const aboutPage = pages.find((page) => page.slug === "about");
    assert.ok(aboutPage);
    assert.equal(aboutPage?.type, "ABOUT");
    assert.equal(aboutPage?.content.some((block) => block.type === "hero"), false);
    assert.equal(aboutPage?.content.some((block) => block.type === "imageText"), true);
  });

  it("falls back to a single home page for templates without a family page set", () => {
    const template: TemplateDefinition = {
      name: "Custom Template",
      slug: "custom-template",
      category: "Business",
      description: "Fallback template",
      previewImage: "",
      previewUrl: "",
      recommendationKeywords: [],
      themeConfig: {
        homepage_layout: "default",
        header_style: "default",
        footer_style: "default",
        product_card_style: "default",
        colors: {
          primary: "#000000",
          secondary: "#111111",
          accent: "#222222",
          background: "#ffffff",
          text: "#000000",
        },
        fonts: {
          heading: "Inter",
          body: "Inter",
        },
        sections: [
          {
            id: "hero",
            type: "hero",
            props: { heading: "Fallback hero", subheading: "Still exact" },
          },
        ],
      },
      active: true,
    };

    const pages = generatePages({}, template);

    assert.equal(pages.length, 1);
    assert.deepEqual(pages[0], {
      title: "Home",
      slug: "home",
      type: "HOME",
      content: template.themeConfig.sections,
      metaTitle: "Home — Custom Template",
      metaDescription: "Fallback template",
    });
  });
});
