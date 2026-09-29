import { describe, it, expect } from "vitest";
import {
  applySectionEdits,
  describeChanges,
  findTextInBlocks,
  replaceTextInProps,
  suggestPaths,
  normalizeText,
} from "@/lib/section-edit";

const hero = () => ({
  heading: "Fresh Bakes Daily",
  subheading: "Don\u2019t miss our morning loaves",
  buttonText: "Shop Now",
  buttonLink: "/shop",
  buttonColor: "#111111",
  items: [
    { title: "Fast delivery", desc: "Same day" },
    { title: "Shop local", desc: "Made nearby" },
  ],
});

describe("applySectionEdits", () => {
  it("sets an existing field and reports before -> after", () => {
    const r = applySectionEdits(hero(), [{ op: "set", path: "heading", value: "Order Today" }]);
    expect(r.error).toBeUndefined();
    expect(r.props.heading).toBe("Order Today");
    expect(describeChanges(r.changes)).toContain('"Fresh Bakes Daily" \u2192 "Order Today"');
  });

  it("edits a single list item without touching siblings", () => {
    const r = applySectionEdits(hero(), [{ op: "set", path: "items.1.title", value: "Buy local" }]);
    expect((r.props.items as any[])[1].title).toBe("Buy local");
    expect((r.props.items as any[])[0].title).toBe("Fast delivery");
  });

  it("REJECTS a mistyped field instead of silently creating a dead one", () => {
    const r = applySectionEdits(hero(), [{ op: "set", path: "headline", value: "X" }]);
    expect(r.error).toMatch(/no field "headline"/);
    expect(r.error).toMatch(/heading/); // suggests the real one
    expect(r.props.heading).toBe("Fresh Bakes Daily"); // nothing saved
  });

  it("allows adding style fields (colors/images) without a flag", () => {
    const r = applySectionEdits(hero(), [
      { op: "set", path: "headingColor", value: "#ff0000" },
      { op: "set", path: "backgroundImage", value: "https://x.test/a.jpg" },
    ]);
    expect(r.error).toBeUndefined();
    expect(r.props.headingColor).toBe("#ff0000");
  });

  it("allows deliberately adding a new field with createIfMissing", () => {
    const r = applySectionEdits(hero(), [{ op: "set", path: "badge", value: "New", createIfMissing: true }]);
    expect(r.error).toBeUndefined();
    expect(r.props.badge).toBe("New");
  });

  it("is atomic: one bad edit means none are applied", () => {
    const r = applySectionEdits(hero(), [
      { op: "set", path: "heading", value: "Changed" },
      { op: "set", path: "nonsenseField", value: "x" },
    ]);
    expect(r.error).toBeDefined();
    expect(r.props.heading).toBe("Fresh Bakes Daily");
  });

  it("inserts and removes list items", () => {
    let r = applySectionEdits(hero(), [{ op: "insert", path: "items", value: { title: "New", desc: "d" }, index: 0 }]);
    expect((r.props.items as any[]).length).toBe(3);
    expect((r.props.items as any[])[0].title).toBe("New");
    r = applySectionEdits(r.props, [{ op: "remove", path: "items.0" }]);
    expect((r.props.items as any[]).length).toBe(2);
  });

  it("blocks prototype-pollution paths", () => {
    const r = applySectionEdits(hero(), [{ op: "set", path: "__proto__.polluted", value: 1 }]);
    expect(r.error).toMatch(/invalid path/);
  });
});

describe("suggestPaths", () => {
  it("points a near-miss at the real field", () => {
    expect(suggestPaths(hero(), "button_text")).toContain("buttonText");
  });
});

describe("findTextInBlocks", () => {
  const blocks = [{ type: "hero", props: hero() }, { type: "features", props: { title: "Why Choose Us", items: [{ title: "Shop local" }] } }];
  it("finds text case-insensitively across blocks and list items", () => {
    const hits = findTextInBlocks("home", blocks, "shop");
    expect(hits.map((h) => `${h.sectionIndex}:${h.path}`)).toEqual(expect.arrayContaining(["0:buttonText", "1:items.0.title"]));
  });
  it("matches curly vs straight apostrophes", () => {
    expect(findTextInBlocks("home", blocks, "Don't miss").length).toBe(1);
  });
});

describe("replaceTextInProps", () => {
  it("replaces exact wording everywhere in the block", () => {
    const r = replaceTextInProps(hero(), "Shop Now", "Order Today");
    expect(r.props.buttonText).toBe("Order Today");
    expect(r.changes.length).toBe(1);
  });

  it("NEVER rewrites links or paths when replacing a plain word", () => {
    const r = replaceTextInProps(hero(), "shop", "store");
    expect(r.props.buttonLink).toBe("/shop"); // link untouched
    expect(r.props.buttonText).toBe("store Now"); // visible text changed
  });

  it("is case-insensitive by default, and case-sensitive on request", () => {
    expect(replaceTextInProps(hero(), "fresh bakes daily", "X").changes.length).toBe(1);
    expect(replaceTextInProps(hero(), "fresh bakes daily", "X", { matchCase: true }).changes.length).toBe(0);
  });

  it("wholeValue only replaces fields that are exactly the text", () => {
    const r = replaceTextInProps(hero(), "Shop", "Buy", { wholeValue: true });
    expect(r.changes.length).toBe(0);
  });

  it("tolerates curly quotes in the stored text", () => {
    const r = replaceTextInProps(hero(), "Don't miss", "Come in for");
    expect(r.props.subheading).toBe("Come in for our morning loaves");
  });

  it("treats $ in the replacement literally", () => {
    const r = replaceTextInProps(hero(), "Same day", "Only $5");
    expect((r.props.items as any[])[0].desc).toBe("Only $5");
  });
});

describe("normalizeText", () => {
  it("collapses whitespace and straightens quotes", () => {
    expect(normalizeText("  Don\u2019t   miss ")).toBe("don't miss");
  });
});

describe("coerceEditValue (models send values as text)", () => {
  it("turns 'true'/'false' into booleans for existing boolean fields", () => {
    const r = applySectionEdits({ headingItalic: false }, [{ op: "set", path: "headingItalic", value: "true" }]);
    expect(r.props.headingItalic).toBe(true);
  });
  it("parses a JSON list item on insert", () => {
    const r = applySectionEdits({ items: [] }, [{ op: "insert", path: "items", value: '{"title":"A","desc":"B"}' }]);
    expect((r.props.items as any[])[0]).toEqual({ title: "A", desc: "B" });
  });
  it("leaves ordinary text alone", () => {
    const r = applySectionEdits({ heading: "x" }, [{ op: "set", path: "heading", value: "true story" }]);
    expect(r.props.heading).toBe("true story");
  });
});
