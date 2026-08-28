import { describe, expect, it } from "vitest";

import {
  buildThemeDataWithCustomization,
  mergeSiteCustomization,
  normalizeSiteCustomization,
} from "@/lib/site-customization";

describe("site customization helpers", () => {
  it("normalizeSiteCustomization returns defaults for null", () => {
    const customization = normalizeSiteCustomization(null);
    expect(customization.themeSettings).toEqual({});
    expect(customization.pageSettings).toEqual({});
    expect(customization.currentVersion).toBe(1);
  });

  it("mergeSiteCustomization deep merges theme and page overrides", () => {
    const base = normalizeSiteCustomization({
      themeSettings: {
        colors: { primary: "#111111", accent: "#222222" },
        typography: { headingFont: "Inter" },
      },
      pageSettings: {
        home: { title: "Home", hidden: false },
      },
      customCss: ".hero { color: red; }",
    });

    const next = mergeSiteCustomization(base, {
      themeSettings: {
        colors: { accent: "#ff0000" },
        layout: { radius: "24px" },
      },
      pageSettings: {
        home: { hidden: true },
      },
      customCss: ".hero { color: blue; }",
    });

    expect(next.themeSettings.colors?.primary).toBe("#111111");
    expect(next.themeSettings.colors?.accent).toBe("#ff0000");
    expect(next.themeSettings.layout?.radius).toBe("24px");
    expect(next.pageSettings.home?.hidden).toBe(true);
    expect(next.customCss).toBe(".hero { color: blue; }");
  });

  it("buildThemeDataWithCustomization merges colors into theme config", () => {
    const theme = {
      id: "theme-1",
      name: "Theme",
      slug: "theme",
      config: {
        colors: { primary: "#111111", headerBg: "#ffffff" },
        fonts: { heading: "Inter", body: "Inter" },
        layout: { maxWidth: "72rem" },
      },
    };

    const customization = normalizeSiteCustomization({
      themeSettings: {
        colors: { primary: "#ff6600", text: "#222222" },
        typography: { bodyFont: "Poppins" },
      },
    });

    const merged = buildThemeDataWithCustomization(theme, customization);

    expect(merged?.config.colors?.primary).toBe("#ff6600");
    expect(merged?.config.colors?.text).toBe("#222222");
    expect(merged?.config.fonts?.body).toBe("Poppins");
    expect(merged?.config.layout?.maxWidth).toBe("72rem");
  });
});
