import { describe, it, expect, vi, beforeEach } from "vitest";

// ── mocks for the agent test (DB + next cache) ─────────────────────────────
const { pageUpdate, pages } = vi.hoisted(() => ({ pageUpdate: vi.fn(), pages: {} as Record<string, any> }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    page: {
      findFirst: vi.fn(async ({ where }: any) => Object.values(pages).find((p: any) => (!where.id || p.id === where.id) && (!where.type || p.type === where.type)) ?? null),
      findUnique: vi.fn(async ({ where }: any) => Object.values(pages).find((p: any) => p.slug === where.siteId_slug.slug) ?? null),
      findMany: vi.fn(async () => Object.values(pages)),
      update: pageUpdate,
      upsert: pageUpdate,
      count: vi.fn(async () => Object.keys(pages).length),
    },
    pageVersion: { create: pageUpdate },
    siteSettings: { upsert: pageUpdate, findUnique: vi.fn(async () => null) },
    site: { update: pageUpdate, findUnique: vi.fn(async () => null) },
    product: { update: pageUpdate, create: pageUpdate, delete: pageUpdate },
  },
}));

import { toGeminiContents } from "@/lib/failover/ai-failover";
import { CircuitBreaker } from "@/lib/failover/circuit-breaker";
import { parseDirectEdit } from "@/lib/direct-edit";
import { toStoredPageContent, parseBlockDocument } from "@/lib/page-content";
import { runSiteGenerationAgent, type DraftPages } from "@/lib/site-generation-agent";

describe("Gemini tool results", () => {
  it("send functionResponse as a 'user' turn (Gemini rejects role 'function') and merge parallel results", () => {
    const out = toGeminiContents([
      { role: "system", content: "s" },
      { role: "user", content: "go" },
      { role: "assistant", content: "", toolCalls: [
        { id: "a", type: "function", function: { name: "get_section", arguments: "{}" } },
        { id: "b", type: "function", function: { name: "find_text", arguments: "{}" } },
      ] },
      { role: "tool", toolCallId: "a", content: "one" },
      { role: "tool", toolCallId: "b", content: "two" },
    ] as any);
    expect(out.some((c) => c.role === "function")).toBe(false);
    const last = out[out.length - 1];
    expect(last.role).toBe("user");
    expect((last.parts as any[]).map((p) => p.functionResponse.name)).toEqual(["get_section", "find_text"]);
  });
});

describe("circuit breaker", () => {
  const boom = (status: number) => Object.assign(new Error(`HTTP ${status}`), { status });
  it("does not trip on client 4xx errors, but does on 5xx/429", async () => {
    const bad = new CircuitBreaker("p", { failureThreshold: 3 });
    for (let i = 0; i < 5; i++) await bad.execute(async () => { throw boom(400); }).catch(() => {});
    await expect(bad.execute(async () => "ok")).resolves.toBe("ok");

    const down = new CircuitBreaker("p2", { failureThreshold: 3 });
    for (let i = 0; i < 3; i++) await down.execute(async () => { throw boom(503); }).catch(() => {});
    await expect(down.execute(async () => "ok")).rejects.toThrow(/open/i);
  });
  it("force-probe bypasses an open circuit and closes it on success", async () => {
    const cb = new CircuitBreaker("p3", { failureThreshold: 2, recoveryTimeoutMs: 60_000 });
    for (let i = 0; i < 2; i++) await cb.execute(async () => { throw boom(500); }).catch(() => {});
    await expect(cb.execute(async () => "x")).rejects.toThrow();
    await expect(cb.execute(async () => "probed", { force: true })).resolves.toBe("probed");
    await expect(cb.execute(async () => "normal")).resolves.toBe("normal");
  });
});

describe("direct edit phrasing", () => {
  it.each([
    "change from why choose us to why select us",
    'change "why choose us" to "why select us"',
    "change why choose us to why select us",
  ])("parses %s", (t) => {
    const r = parseDirectEdit(t, ["home"]);
    expect(r?.find).toBe("why choose us");
    expect(r?.replace).toBe("why select us");
  });
});

describe("page content storage shape", () => {
  it("keeps flat block pages as a plain array (what the AI tools read)", () => {
    const blocks = [{ id: "a", type: "hero", props: {} }, { id: "b", type: "faq", props: {} }];
    const stored = toStoredPageContent(parseBlockDocument(blocks));
    expect(Array.isArray(stored)).toBe(true);
    expect(stored).toEqual(blocks);
  });
  it("survives a reorder round-trip as an array the AI can still read", () => {
    const blocks = [{ id: "a", type: "hero", props: { heading: "A" } }, { id: "b", type: "faq", props: { heading: "B" } }];
    const doc = parseBlockDocument(blocks);
    const reordered = { ...doc, blocks: [doc.blocks[1], doc.blocks[0]] };
    const stored = toStoredPageContent(reordered) as any[];
    expect(Array.isArray(stored)).toBe(true);
    expect(stored.map((b) => b.id)).toEqual(["b", "a"]);
  });
});

describe("block-locked AI", () => {
  const ai = (script: any[]) => {
    let i = 0;
    return { chat: vi.fn(async () => ({ success: true, data: { provider: "t", model: "t", content: "", toolCalls: script[i++] } })) } as any;
  };
  const call = (name: string, args: unknown, id = name) => ({ id, type: "function", function: { name, arguments: JSON.stringify(args) } });
  const base = () => ({
    siteId: "s1", storeName: "Shop", storeSlug: "shop", industry: "general", siteType: "WEBSITE",
  });

  beforeEach(() => {
    pageUpdate.mockClear();
    for (const k of Object.keys(pages)) delete pages[k];
    pages.p1 = { id: "p1", slug: "home", title: "Home", type: "HOME", content: [
      { id: "b0", type: "hero", props: { heading: "Welcome" } },
      { id: "b1", type: "features", props: { heading: "Why choose us", items: [{ title: "Fast" }] } },
      { id: "b2", type: "faq", props: { heading: "Questions" } },
    ] };
    pages.p2 = { id: "p2", slug: "about", title: "About", type: "ABOUT", content: [{ id: "c0", type: "hero", props: { heading: "About us" } }] };
  });

  it("pins edits to the selected block, rejects out-of-scope tools, and never writes to the DB", async () => {
    const draft: DraftPages = {};
    const agent = ai([
      // model tries to (1) create a page, (2) edit ANOTHER page/section — both must be contained
      [call("create_page", { title: "Evil", type: "CUSTOM", sections: ["hero"] }, "c1"),
       call("edit_section", { pageSlug: "about", sectionIndex: 0, edits: [{ path: "heading", op: "set", value: "Why select us" }] }, "c2")],
      [call("finalize_draft", { summary: "Renamed the heading." }, "c3")],
    ]);
    const res = await runSiteGenerationAgent({
      ...base(), ai: agent, task: "rename the heading to Why select us",
      draft, lockedBlock: { pageId: "p1", blockId: "b1" },
    });

    expect(res.steps.find((s) => s.tool === "create_page")?.isError).toBe(true);
    const home = draft.p1.content as any[];
    expect(home[1].props.heading).toBe("Why select us");        // the selected block changed
    expect(home[0].props.heading).toBe("Welcome");               // neighbours untouched
    expect(home[2].props.heading).toBe("Questions");
    expect(draft.p2).toBeUndefined();                             // other page untouched
    expect(pageUpdate).not.toHaveBeenCalled();                    // nothing hit the database
  });

  it("only offers block-scoped tools to the model", async () => {
    const agent = ai([[call("finalize_draft", { summary: "Out of scope: deselect the block." })]]);
    await runSiteGenerationAgent({ ...base(), ai: agent, task: "add a new page", draft: {}, lockedBlock: { pageId: "p1", blockId: "b1" } });
    const tools = (agent.chat.mock.calls[0][0].tools as any[]).map((t) => t.function.name).sort();
    expect(tools).toEqual(["attach_asset", "edit_section", "finalize_draft", "get_section", "replace_text", "update_section"]);
  });

  it("fails clearly when the selected block no longer exists", async () => {
    await expect(
      runSiteGenerationAgent({ ...base(), ai: ai([]), task: "x", draft: {}, lockedBlock: { pageId: "p1", blockId: "gone" } })
    ).rejects.toThrow(/no longer exists/);
  });

  it("draft mode alone (no lock) stages edits instead of saving", async () => {
    const draft: DraftPages = {};
    const agent = ai([
      [call("edit_section", { pageSlug: "home", sectionIndex: 0, edits: [{ path: "heading", op: "set", value: "Hi" }] })],
      [call("finalize_draft", { summary: "done" })],
    ]);
    await runSiteGenerationAgent({ ...base(), ai: agent, task: "change the hero heading to Hi", draft });
    expect((draft.p1.content as any[])[0].props.heading).toBe("Hi");
    expect(pageUpdate).not.toHaveBeenCalled();
  });
});
