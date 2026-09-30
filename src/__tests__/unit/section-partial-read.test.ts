import { describe, it, expect } from "vitest";
import { describeSection, readSectionPart, outlineProps, formatFlat, applySectionEdits } from "@/lib/section-edit";

const faq = (n: number) => ({
  title: "FAQ",
  backgroundColor: "#ffffff",
  items: Array.from({ length: n }, (_, i) => ({ question: `Question number ${i}?`, answer: `Answer ${i}. ` + "Lorem ipsum dolor sit amet ".repeat(12) })),
});

describe("describeSection", () => {
  it("small sections are listed in full, exactly like before", () => {
    const p = { heading: "Hi", items: [{ a: 1 }] };
    expect(describeSection(p)).toBe(formatFlat(p, 300));
  });

  it("big sections return a map of EVERY field instead of a cut-off list", () => {
    const p = faq(40);
    expect(formatFlat(p, 300).length).toBeGreaterThan(5000); // the old output would have been cut here
    const out = describeSection(p);
    expect(out).toContain("items = list of 40");
    expect(out).toContain("question, answer");
    expect(out).toContain("title");
    expect(out).toContain("backgroundColor");
    expect(out).toContain("items.10-19");
    expect(out.length).toBeLessThan(2500);
  });
});

describe("long text is shown fully when it fits, and marked when it is cut", () => {
  it("shows a 500-char paragraph in full with no cut marker", () => {
    const text = "word ".repeat(100).trim(); // 499 chars
    const out = describeSection({ heading: "H", body: text });
    expect(out).toContain(text);
    expect(out).not.toContain("chars]");
  });
  it("marks a 900-char paragraph as cut, says how much is missing, and how to read it", () => {
    const out = describeSection({ body: "x".repeat(900) });
    expect(out).toContain("[+300 chars]");
    expect(out).toContain("get_section with path");
  });
  it("falls back to the shorter cut for mid-size blocks so the size stays within budget", () => {
    const p = { items: Array.from({ length: 12 }, (_, i) => ({ q: `Q${i}`, a: "y".repeat(500) })) };
    const out = describeSection(p, 4500);
    expect(out.length).toBeLessThanOrEqual(4500);
    expect(out).toContain("[+200 chars]"); // cut at 300, not 600
    expect(out).toContain("items.11.q");    // and every item is still listed
  });
  it("partial reads also mark cut values", () => {
    const r = readSectionPart({ items: [{ a: "z".repeat(700) }, { a: "short" }] }, "items.0-1");
    expect(r.ok && r.text).toContain("[+400 chars]");
    expect(r.ok && r.text).toContain('items.1.a = "short"');
  });
});

describe("readSectionPart", () => {
  const p = faq(40);
  it("reads one field", () => {
    const r = readSectionPart(p, "backgroundColor");
    expect(r).toEqual({ ok: true, text: '  backgroundColor = "#ffffff"' });
  });
  it("shows a long text in full", () => {
    const r = readSectionPart(p, "items.25.answer");
    expect(r.ok && r.text).toContain("Answer 25.");
    expect(r.ok && r.text.length).toBeGreaterThan(300);
  });
  it("reads a range of list items with the right paths", () => {
    const r = readSectionPart(p, "items.30-32");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.text).toContain("items.30.question");
      expect(r.text).toContain("items.32.answer");
      expect(r.text).not.toContain("items.33.");
      expect(r.text).not.toContain("items.29.");
    }
  });
  it("clamps a range past the end and reaches the last item", () => {
    const r = readSectionPart(p, "items.38-99");
    expect(r.ok && r.text).toContain("items.39.question");
  });
  it("reads a range of one field across items", () => {
    const r = readSectionPart(p, "items.0-2.question");
    expect(r.ok && r.text).toContain('items.1.question = "Question number 1?"');
    expect(r.ok && r.text).not.toContain("answer");
  });
  it("gives a helpful error for a missing path", () => {
    const r = readSectionPart(p, "itemz.3");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("Top-level fields");
  });
  it("rejects a range on something that isn't a list, and out-of-range lists", () => {
    expect(readSectionPart(p, "title.0-3").ok).toBe(false);
    expect(readSectionPart(p, "items.50-60").ok).toBe(false);
  });
  it("never returns more than the budget, and says what was left out", () => {
    const r = readSectionPart({ items: Array.from({ length: 200 }, (_, i) => ({ a: "x".repeat(200), b: i })) }, "items");
    expect(r.ok && r.text.length).toBeLessThan(5300);
    expect(r.ok && r.text).toContain("more fields");
  });
});

describe("the AI can still edit a field it has not read", () => {
  it("edits items.39.answer on a 40-item section", () => {
    const res = applySectionEdits(faq(40), [{ op: "set", path: "items.39.answer", value: "New answer" }]);
    expect(res.error).toBeUndefined();
    expect((res.props.items as Array<{ answer: string }>)[39].answer).toBe("New answer");
  });
});

describe("outlineProps", () => {
  it("lists every top-level key", () => {
    const o = outlineProps({ a: "x", b: { c: 1, d: [1] }, e: [{ f: 1 }] });
    expect(o).toContain("a =");
    expect(o).toContain("b = {");
    expect(o).toContain("e = list of 1");
  });
});
