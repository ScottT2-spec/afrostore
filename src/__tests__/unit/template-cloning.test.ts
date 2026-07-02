import { describe, it, expect } from "vitest";

import { buildImportedTemplatePages } from "@/lib/templates/importer";
import { getInternalTemplateBySlug, TEMPLATE_CATEGORIES } from "@/lib/templates/catalog";
import { getLandingGadgetPackageDefinition } from "@/templates/packages/landing-gadget";
import { getAegisPackageDefinition } from "@/templates/packages/aegis";
import { getNajafAiPackageDefinition } from "@/templates/packages/najaf-ai";

describe("theme package importer", () => {
  it("exposes top-level category filtering", () => {
    expect(TEMPLATE_CATEGORIES).toEqual(["Ecommerce", "Landing Page", "Business Website"]);
  });

  it("returns complete package pages for a selected template", () => {
    const template = getInternalTemplateBySlug("fashion");
    expect(template).toBeTruthy();

    const pages = buildImportedTemplatePages(
      {
        businessName: "Moda House",
        description: "Imported from the selected theme package.",
      },
      template!,
    );

    expect(template?.package).toBeTruthy();
    expect(template?.package?.pages.length).toBeGreaterThan(1);
    expect(pages).toHaveLength(template?.package?.pages.length || 0);
    expect(pages[0].title).toBe("Home");
    expect(pages[0].content).toEqual(template?.package?.pages[0].blocks);
    expect(pages[0].metaTitle).toBe(`${template?.package?.pages[0].title} — ${template?.name}`);
  });

  it("keeps package-specific blocks intact for non-home pages", () => {
    const template = getInternalTemplateBySlug("clarity");
    expect(template).toBeTruthy();

    const pages = buildImportedTemplatePages(
      {
        businessName: "Acme Studio",
        description: "A package-backed business website.",
      },
      template!,
    );

    const aboutPage = pages.find((page) => page.slug === "about");
    expect(aboutPage).toBeTruthy();
    expect(aboutPage?.type).toBe("ABOUT");
    expect(Array.isArray(aboutPage?.content)).toBe(true);
    expect((aboutPage?.content || []).length).toBeGreaterThan(0);
  });

  it("exposes a structured landing-gadget package with editable sections and media", () => {
    const packageDefinition = getLandingGadgetPackageDefinition();

    expect(packageDefinition.slug).toBe("landing-gadget");
    expect(packageDefinition.manifest.siteType).toBe("LANDING_PAGE");
    expect(packageDefinition.homeSections?.length).toBeGreaterThan(0);
    expect(packageDefinition.media.length).toBeGreaterThan(0);
    expect(packageDefinition.pages[0].blocks.length).toBeGreaterThan(0);
    expect(packageDefinition.products?.length).toBe(2);
  });

  it("exposes a structured aegis package with editable sections and media", () => {
    const packageDefinition = getAegisPackageDefinition();

    expect(packageDefinition.slug).toBe("aegis");
    expect(packageDefinition.manifest.siteType).toBe("LANDING_PAGE");
    expect(packageDefinition.homeSections?.length).toBeGreaterThan(0);
    expect(packageDefinition.media.length).toBeGreaterThan(0);
    expect(packageDefinition.pages[0].blocks.length).toBeGreaterThan(0);
    expect(packageDefinition.products?.length).toBe(0);
  });

  it("exposes a structured najaf-ai package with editable sections and media", () => {
    const packageDefinition = getNajafAiPackageDefinition();

    expect(packageDefinition.slug).toBe("najaf-ai");
    expect(packageDefinition.manifest.siteType).toBe("LANDING_PAGE");
    expect(packageDefinition.homeSections?.length).toBeGreaterThan(0);
    expect(packageDefinition.media.length).toBeGreaterThan(0);
    expect(packageDefinition.pages[0].blocks.length).toBeGreaterThan(0);
    expect(packageDefinition.products?.length).toBe(0);
  });
});
