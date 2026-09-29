import { describe, it, expect } from "vitest";
import { parseDirectEdit, planDirectEdit, describeDirectEdit, type DirectPage } from "@/lib/direct-edit";

const pages = (): DirectPage[] => [
  {
    id: "p1", slug: "home", title: "Home",
    content: [
      { type: "hero", props: { heading: "Fresh Bakes", buttonText: "Order via WhatsApp", buttonLink: "https://wa.me/234" } },
      { type: "features", props: { title: "Why Choose Us", items: [{ title: "Order online", desc: "Fast" }] } },
      { type: "banner", props: { text: "Order via WhatsApp today" } },
    ],
  },
  { id: "p2", slug: "about", title: "About", content: [{ type: "hero", props: { heading: "About us", buttonText: "Order via WhatsApp" } }] },
];
const names = ["home", "about", "Home", "About"];

describe("parseDirectEdit", () => {
  it("parses the merchant's real request", () => {
    const r = parseDirectEdit("change the order via WhatsApp to just order in the hero block", names);
    expect(r).toMatchObject({ find: "order via WhatsApp", replace: "order", scope: "hero", quoted: false });
  });
  it("parses quoted requests verbatim", () => {
    expect(parseDirectEdit('change "Shop Now" to "Order Today"', names)).toMatchObject({ find: "Shop Now", replace: "Order Today", quoted: true });
    expect(parseDirectEdit("Replace \u201CShop Now\u201D with \u201CBuy\u201D on the home page", names)).toMatchObject({ scope: "home", quoted: true });
  });
  it("keeps 'in/on' that belong to the new text", () => {
    expect(parseDirectEdit("change Shop Now to Shop on the go", names)).toMatchObject({ replace: "Shop on the go", scope: undefined });
  });
  it("hands unknown locations to the AI instead of guessing", () => {
    expect(parseDirectEdit("change Shop Now to Buy in the moon block", names)).toBeNull();
  });
  it("ignores things that aren't text swaps", () => {
    expect(parseDirectEdit("make the site look more premium", names)).toBeNull();
    expect(parseDirectEdit("add a new page", names)).toBeNull();
  });
});

describe("planDirectEdit", () => {
  it("does the exact request: hero only, keeps the capital O, leaves links alone", () => {
    const req = parseDirectEdit("change the order via WhatsApp to just order in the hero block", names)!;
    const plan = planDirectEdit(req, pages())!;
    expect(plan).not.toBeNull();
    const home = plan.pages.find((p) => p.slug === "home")!;
    expect(home.content[0].props!.buttonText).toBe("Order");
    expect(home.content[0].props!.buttonLink).toBe("https://wa.me/234");
    expect(home.content[2].props!.text).toBe("Order via WhatsApp today"); // banner untouched
    expect(plan.changes.every((c) => c.blockType === "hero")).toBe(true);
    expect(plan.changes.length).toBe(2); // hero on home AND hero on about, since no page was named
    expect(describeDirectEdit(req, plan)).toContain('to "Order"');
  });
  it("scopes to one page when named", () => {
    const req = parseDirectEdit('change "Order via WhatsApp" to "Order" on the about page', names)!;
    const plan = planDirectEdit(req, pages())!;
    expect(plan.changes.map((c) => c.pageSlug)).toEqual(["about"]);
  });
  it("returns null (-> AI) when the text isn't on the site", () => {
    expect(planDirectEdit({ find: "Nonexistent words", replace: "x", quoted: true }, pages())).toBeNull();
  });
  it("returns null when the scope has no such text", () => {
    expect(planDirectEdit({ find: "Order via WhatsApp", replace: "x", scope: "faq", quoted: true }, pages())).toBeNull();
  });
  it("returns null when it would touch too many places", () => {
    const many: DirectPage[] = [{ id: "x", slug: "home", title: "Home", content: Array.from({ length: 12 }, () => ({ type: "hero", props: { t: "Buy" } })) }];
    expect(planDirectEdit({ find: "Buy", replace: "Get", quoted: true }, many)).toBeNull();
  });
  it("respects quotes: does not auto-capitalise", () => {
    const plan = planDirectEdit({ find: "order via whatsapp", replace: "order", scope: "hero", quoted: true }, pages())!;
    expect(plan.pages[0].content[0].props!.buttonText).toBe("order");
  });
});

describe("sloppy quotes (real merchant messages)", () => {
  const pg = (): DirectPage[] => [
    {
      id: "h", slug: "home", title: "Home",
      content: [
        { type: "hero", props: { heading: "Welcome" } },
        { type: "features", props: { title: "Why Choose Us", subtitle: "Here\u2019s what makes us different" } },
        { type: "newsletter", props: { subtitle: "Stay in the loop" } },
      ],
    },
  ];
  it("ignores unbalanced curly quotes and a stray space", () => {
    const r = parseDirectEdit("Change \u201Cwhat makes us different \u201D to \u201Cwhat makes us best on the why choose us block", names)!;
    expect(r).toMatchObject({ find: "what makes us different", replace: "what makes us best", scope: "why choose us", quoted: true });
    const plan = planDirectEdit(r, pg())!;
    expect(plan.pages[0].content[1].props!.subtitle).toBe("Here\u2019s what makes us best");
    expect(plan.pages[0].content[2].props!.subtitle).toBe("Stay in the loop");
  });
  it("replaces the whole phrase when the merchant quotes the full text", () => {
    const r = parseDirectEdit("Change \u201CHere's what makes us different \u201D to \u201Cwhat makes us best on the why choose us block", names)!;
    expect(r).toMatchObject({ find: "Here's what makes us different", replace: "what makes us best" });
    const plan = planDirectEdit(r, pg())!;
    expect(plan.pages[0].content[1].props!.subtitle).toBe("what makes us best");
  });
  it("matches template-specific block types by their generic name", () => {
    const r = parseDirectEdit('change "Fast" to "Quick" in the why choose us block', names)!;
    const plan = planDirectEdit(r, [{ id: "x", slug: "home", title: "Home", content: [{ type: "perfumesWhyChooseUs", props: { items: [{ desc: "Fast" }] } }] }])!;
    expect(plan.changes[0].after).toBe("Quick");
  });
});
