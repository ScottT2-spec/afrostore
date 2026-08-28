import { describe, expect, it } from "vitest";

import { getSectionStyle, resolveOpacity } from "@/components/storefront/block-style";

describe("block style helpers", () => {
  it("normalizes opacity values for overlays", () => {
    expect(resolveOpacity(35, 0.35)).toBe(0.35);
    expect(resolveOpacity(0.4, 0.35)).toBe(0.4);
    expect(resolveOpacity(undefined, 0.35)).toBe(0.35);
  });

  it("maps background image and color bindings onto section styles", () => {
    const style = getSectionStyle({
      bgImage: "/uploads/hero.jpg",
      bgColor: "#112233",
      textColor: "#ffffff",
    });

    expect(style.backgroundImage).toBe("url(/uploads/hero.jpg)");
    expect(style.backgroundSize).toBe("cover");
    expect(style.backgroundPosition).toBe("center center");
    expect(style.backgroundRepeat).toBe("no-repeat");
    expect(style.backgroundColor).toBe("#112233");
    expect(style.color).toBe("#ffffff");
  });
});
