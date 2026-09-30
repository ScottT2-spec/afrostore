import { describe, it, expect } from "vitest";
import { readPageBlocks, writePageBlocks, type AIBlock } from "@/lib/page-content-adapter";
import { findTextInBlocks, replaceTextInProps } from "@/lib/section-edit";
import { editorNodeToBlock } from "@/lib/page-content";
import type { EditorNode } from "@/lib/visual-editor/node-tree";

// A page as the visual editor saves it: { elements, settings }.
const editorPage = () => ({
  settings: { backgroundColor: "#ffffff" },
  elements: [
    { id: "h1", type: "hero", settings: { heading: "Fresh Bakes", buttonText: "Order via WhatsApp", buttonLink: "https://wa.me/234" }, elements: [] },
    // generic-editor edit: content overrides settings at render time
    { id: "b1", type: "banner", settings: { text: "Old settings text", color: "#111" }, content: { text: "Sale today" }, elements: [] },
    {
      id: "s1", type: "section", settings: { padding: "20px" },
      columns: [
        { id: "c1", type: "column", settings: {}, children: [
          { id: "t1", type: "heading", settings: { text: "Our story" }, content: { text: "Our story" }, elements: [] },
          { id: "t2", type: "paragraph", settings: {}, content: { props: { text: "We bake daily" } }, elements: [] },
        ] },
      ],
    },
  ],
});

// What the storefront renders for one page (page-content.ts is the source of truth).
const rendered = (content: { elements: EditorNode[] }) => content.elements.map(editorNodeToBlock);

describe("readPageBlocks", () => {
  it("passes block arrays through untouched", () => {
    const arr = [{ type: "hero", props: { heading: "Hi" } }];
    const v = readPageBlocks(arr);
    expect(v.format).toBe("blocks");
    expect(v.blocks).toBe(arr);
    expect(writePageBlocks(arr, v.blocks)).toBe(arr);
  });

  it("reads { blocks: [...] } wrappers and writes back into them", () => {
    const doc = { blocks: [{ type: "hero", props: { heading: "Hi" } }], settings: { a: 1 } };
    const v = readPageBlocks(doc);
    expect(v.format).toBe("blocks");
    const out = writePageBlocks(doc, [{ type: "hero", props: { heading: "Yo" } }]) as typeof doc;
    expect(out.blocks[0].props.heading).toBe("Yo");
    expect(out.settings).toEqual({ a: 1 });
  });

  it("treats empty/unknown content as unsupported with no blocks", () => {
    expect(readPageBlocks(null)).toEqual({ format: "unsupported", blocks: [] });
    expect(readPageBlocks({})).toEqual({ format: "unsupported", blocks: [] });
  });

  it("no longer sees an editor-saved page as empty", () => {
    const v = readPageBlocks(editorPage());
    expect(v.format).toBe("editor");
    expect(v.blocks.map((b) => b.type)).toEqual(["hero", "banner", "section"]);
    expect(v.blocks[0].props?.heading).toBe("Fresh Bakes");
  });

  it("shows exactly what renders (content overrides settings)", () => {
    const banner = readPageBlocks(editorPage()).blocks[1];
    expect(banner.props?.text).toBe("Sale today");
  });

  it("exposes nested children (section > column > widgets) by path", () => {
    const hits = findTextInBlocks("home", readPageBlocks(editorPage()).blocks as never, "We bake daily");
    expect(hits).toHaveLength(1);
    expect(hits[0].sectionIndex).toBe(2);
    expect(hits[0].path).toBe("elements.0.props.elements.1.props.text");
  });

  it("returns detached copies (editing the view never mutates the saved page)", () => {
    const page = editorPage();
    const v = readPageBlocks(page);
    (v.blocks[0].props as Record<string, unknown>).heading = "Changed";
    expect(page.elements[0].settings.heading).toBe("Fresh Bakes");
  });
});

describe("writePageBlocks on editor pages", () => {
  const edit = (page: ReturnType<typeof editorPage>, find: string, replace: string) => {
    const blocks = readPageBlocks(page).blocks;
    blocks.forEach((b, i) => {
      const r = replaceTextInProps(b.props || {}, find, replace);
      if (r.changes.length) blocks[i] = { ...b, props: r.props };
    });
    return writePageBlocks(page, blocks) as ReturnType<typeof editorPage>;
  };

  it("a text change lands where it takes effect on the live page", () => {
    const out = edit(editorPage(), "Sale today", "Big sale");
    expect(rendered(out)[1].props?.text).toBe("Big sale");       // what the storefront now shows
    expect(out.elements[1].content).toEqual({ text: "Big sale" }); // written to the winning layer
    expect(out.elements[1].settings.text).toBe("Old settings text"); // lower layer untouched
  });

  it("changes AI-generated blocks in settings and leaves everything else identical", () => {
    const page = editorPage();
    const out = edit(page, "Fresh Bakes", "Golden Loaves");
    expect(out.elements[0].settings.heading).toBe("Golden Loaves");
    expect(out.elements[0].settings.buttonLink).toBe("https://wa.me/234");
    expect(out.elements[0].id).toBe("h1");
    expect(out.elements[1]).toEqual(page.elements[1]);
    expect(out.elements[2]).toEqual(page.elements[2]);
    expect(out.settings).toEqual({ backgroundColor: "#ffffff" });
  });

  it("edits deep inside nested children, in the container they live in", () => {
    const out = edit(editorPage(), "We bake daily", "We bake fresh every morning");
    const col = (out.elements[2] as unknown as { columns: Array<{ children: Array<{ content: { props: { text: string } } }> }> }).columns[0];
    expect(col.children[1].content.props.text).toBe("We bake fresh every morning");
    expect(rendered(out)[2].elements?.[0].elements?.[1].props?.text).toBe("We bake fresh every morning");
    // sibling heading untouched
    expect((col.children[0] as unknown as { content: { text: string } }).content.text).toBe("Our story");
  });

  it("removes a field from every layer when the AI deletes it", () => {
    const page = editorPage();
    const blocks = readPageBlocks(page).blocks;
    delete (blocks[1].props as Record<string, unknown>).text;
    const out = writePageBlocks(page, blocks) as ReturnType<typeof editorPage>;
    expect(rendered(out)[1].props?.text).toBeUndefined();
  });

  it("keeps a derived `blocks` copy in sync when the page has one", () => {
    const page = { ...editorPage(), blocks: [] as unknown[] };
    page.blocks = rendered(page);
    const blocks = readPageBlocks(page).blocks;
    blocks[0] = { ...blocks[0], props: { ...blocks[0].props, heading: "New" } };
    const out = writePageBlocks(page, blocks) as typeof page;
    expect((out.blocks[0] as AIBlock).props?.heading).toBe("New");
  });

  it("an untouched read/write round trip changes nothing", () => {
    const page = editorPage();
    expect(writePageBlocks(page, readPageBlocks(page).blocks)).toEqual(page);
  });

  it("adds a new top-level block as an editor element", () => {
    const page = editorPage();
    const blocks = [...readPageBlocks(page).blocks, { type: "faq", props: { title: "FAQ" } }];
    const out = writePageBlocks(page, blocks) as ReturnType<typeof editorPage>;
    expect(out.elements).toHaveLength(4);
    expect(out.elements[3]).toMatchObject({ type: "faq", settings: { title: "FAQ" } });
    expect(typeof out.elements[3].id).toBe("string");
  });
});

describe("instant edit path on an editor-saved page", () => {
  it('"change X to Y in the hero" works and is saved back in the editor format', async () => {
    const { parseDirectEdit, planDirectEdit } = await import("@/lib/direct-edit");
    const raw = editorPage();
    const pages = [{ id: "p1", slug: "home", title: "Home", content: readPageBlocks(raw).blocks as never }];
    const req = parseDirectEdit("change Order via WhatsApp to Order Now in the hero", ["home", "Home"])!;
    const plan = planDirectEdit(req, pages)!;
    expect(plan).not.toBeNull();
    const saved = writePageBlocks(raw, plan.pages[0].content as unknown as AIBlock[]) as ReturnType<typeof editorPage>;
    expect(Array.isArray(saved)).toBe(false);
    expect(rendered(saved)[0].props?.buttonText).toBe("Order Now");
    expect(saved.elements[0].settings.buttonText).toBe("Order Now");
    expect(saved.elements[1]).toEqual(raw.elements[1]);
  });
});
