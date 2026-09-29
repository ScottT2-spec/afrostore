import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/site-customization", () => ({ loadSiteCustomizationSafely: vi.fn(), normalizeSiteCustomization: vi.fn(), mergeSiteCustomization: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Free-tier Groq rejects any request over 8000 tokens/minute (input + reserved reply).
// Keep the FIRST edit-mode request comfortably under that.
const summary = Array.from({ length: 4 }, (_, p) =>
  `Page "p${p}" (HOME, title: "T"):\n` + Array.from({ length: 9 }, (_, i) => `  [${i}] hero heading: "Some heading text here", sub: "sub text here that is fairly long", 4 items`).join("\n"),
).join("\n\n");
const bad = (node: any, path: string, out: string[]) => {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach((n, i) => bad(n, `${path}[${i}]`, out));
  if ("default" in node) out.push(`${path}: default`);
  if (Array.isArray(node.type)) out.push(`${path}: array type`);
  if (node.properties) for (const [k, v] of Object.entries<any>(node.properties)) if (!("type" in v) && !("anyOf" in v) && !("enum" in v)) out.push(`${path}.${k}: no type`);
  for (const [k, v] of Object.entries(node)) bad(v, `${path}.${k}`, out);
};

describe("edit-mode request size", () => {
  it("stays well under the 8k-token provider limit", async () => {
    const { buildSystemPrompt, selectEditTools } = await import("@/lib/site-generation-agent");
    const { getSiteIntentRules } = await import("@/lib/site-intent");
    const sys = buildSystemPrompt(getSiteIntentRules("ECOMMERCE"), null, summary, "Contact email: a@b.com");
    const tools = JSON.stringify(selectEditTools("change explore collection to explore now on the hero"));
    const tokens = (sys.length + tools.length) / 3.6;
    expect(tokens).toBeLessThan(3200); // + 1500 reserved reply < 5k, leaving room for tool results
  });

  it("routes extra tools only when the request needs them", async () => {
    const { selectEditTools } = await import("@/lib/site-generation-agent");
    const names = (t: string) => selectEditTools(t).map((x) => x.function.name);
    expect(names("change the hero heading")).toEqual(expect.arrayContaining(["get_section", "edit_section", "find_text", "replace_text"]));
    expect(names("change the hero heading")).not.toContain("upsert_product");
    expect(names("update the price of the red shoes")).toContain("upsert_product");
    expect(names("change my whatsapp number")).toContain("set_whatsapp");
  });
});

describe("tool schemas are safe for every provider (Gemini)", () => {
  it("has no default/untyped properties", async () => {
    const { TOOL_DEFS } = await import("@/lib/site-generation-agent");
    const issues: string[] = [];
    for (const t of TOOL_DEFS as any[]) bad(t.function.parameters, t.function.name, issues);
    expect(issues.filter((i) => !i.startsWith("update_section"))).toEqual([]);
  });
});
