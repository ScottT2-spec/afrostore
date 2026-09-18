/**
 * The PRD's actual generation/edit mechanism (§10.2) — a tool-calling
 * loop constrained to exactly the 12 allowlisted site-mutation tools,
 * operating on the site's real structured data (Page rows, SiteSettings,
 * DeliveryZone rows, Product rows) through the existing block-rendering
 * system. This is deliberately NOT coding-agent.ts's approach: no
 * list_files/write_file/run_command, no sandbox, no generated source
 * code. NG1 rules that out explicitly for this feature; §10.3 forbids
 * "arbitrary shell, raw SQL." Every tool here can only ever do the one
 * specific, safe thing it's named for.
 *
 * The loop architecture (forced tool-calling every turn, corrective
 * retry via Zod validation, iteration cap) is the same proven pattern as
 * runCodingAgent() — that mechanism generalizes cleanly to any tool set;
 * only the tools themselves and what they're allowed to touch changes.
 */

import { z } from "zod";
import { prisma } from "@/lib/db";
import { AICapability } from "@/lib/failover";
import type { AIFailover, AIMessage, AITool } from "@/lib/failover";
import {
  sectionTypeEnum,
  createPageSchema,
  updateSectionSchema,
  setThemeSchema,
  setNavigationSchema,
  upsertProductSchema,
  removeProductSchema,
  setWhatsappSchema,
  setDeliveryZonesSchema,
  setPaymentStubSchema,
  setSeoSchema,
  attachAssetSchema,
  askUserSchema,
  finalizeDraftSchema,
} from "@/lib/ai-schemas/site-generation-tools";
import { storeGenerationSchema } from "@/lib/ai-schemas/store-generation";
import { generateStructured, AIStructuredOutputError } from "@/lib/ai-structured-output";
import { buildDynamicHomePage } from "@/lib/ai-layout-engine";
import { getRandomIndustryImages } from "@/lib/ai-image-pools";

import { getSiteIntentRules, type SiteIntentRules } from "@/lib/site-intent";
import { detectSensitiveCategory, getGuardrailPromptRules, scanForSafetyViolations, extractTextFromContent, type SensitiveCategory } from "@/lib/site-safety";

function toToolParameters(schema: z.ZodType<unknown>): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-7" }) as Record<string, unknown>;
  delete jsonSchema.$schema;
  return jsonSchema;
}

const TOOL_DEFS: AITool[] = [
  { type: "function", function: { name: "create_page", description: "Add a new page with default sections, populated with real generated content — never a placeholder skeleton.", parameters: toToolParameters(createPageSchema) } },
  { type: "function", function: { name: "update_section", description: "Change specific fields on one existing section of one page.", parameters: toToolParameters(updateSectionSchema) } },
  { type: "function", function: { name: "set_theme", description: "Set the site's visual vibe/color direction.", parameters: toToolParameters(setThemeSchema) } },
  { type: "function", function: { name: "set_navigation", description: "Set the main nav links.", parameters: toToolParameters(setNavigationSchema) } },
  { type: "function", function: { name: "upsert_product", description: "Add or update one product.", parameters: toToolParameters(upsertProductSchema) } },
  { type: "function", function: { name: "remove_product", description: "Remove one product.", parameters: toToolParameters(removeProductSchema) } },
  { type: "function", function: { name: "set_whatsapp", description: "Turn on WhatsApp ordering with the merchant's real number. Call ask_user first if the prompt didn't include one — never invent a number.", parameters: toToolParameters(setWhatsappSchema) } },
  { type: "function", function: { name: "set_delivery_zones", description: "Set the store's delivery areas and fees, from what the merchant actually said.", parameters: toToolParameters(setDeliveryZonesSchema) } },
  { type: "function", function: { name: "set_payment_stub", description: "Set checkout UI mode. 'connected' only takes effect if the merchant already has a real payment gateway configured — this tool cannot enable live charging on its own.", parameters: toToolParameters(setPaymentStubSchema) } },
  { type: "function", function: { name: "set_seo", description: "Set a page's SEO title/description.", parameters: toToolParameters(setSeoSchema) } },
  { type: "function", function: { name: "attach_asset", description: "Bind an uploaded/generated image to a section's image field.", parameters: toToolParameters(attachAssetSchema) } },
  { type: "function", function: { name: "ask_user", description: "Ask the merchant a clarifying question when a critical detail (business name, currency/country, contact channel, WhatsApp number) is missing. Ends this turn and waits for their answer — never guess instead.", parameters: toToolParameters(askUserSchema) } },
  { type: "function", function: { name: "finalize_draft", description: "Call this once the site genuinely reflects what the merchant asked for. Ends the session.", parameters: toToolParameters(finalizeDraftSchema) } },
];

function buildSystemPrompt(rules: SiteIntentRules, safetyCategory: SensitiveCategory | null): string {
  return `You are building a real e-commerce/business/landing site for an African SMB merchant, from their plain-language description. You can ONLY act through the tools you're given — there is no code, no files, nothing outside this specific tool set.

${rules.promptRules}
${safetyCategory ? `\n${getGuardrailPromptRules(safetyCategory)}\n` : ""}

Rules:
- Default currency is NGN unless the merchant's prompt says otherwise.
- If the prompt names delivery areas, call set_delivery_zones with exactly those names — don't invent additional ones, don't skip ones they named.
- If the prompt mentions WhatsApp ordering/contact, call set_whatsapp — but only with a real number the merchant provided. If they mentioned WhatsApp but gave no number, use ask_user to get it. Never invent a phone number.
- Never call set_payment_stub with mode "connected" as a guess — that only matters if the merchant already has a real gateway configured, which you cannot cause to happen from here.
- create_page must produce real, specific, on-brand content immediately — never placeholder/lorem-ipsum text. A merchant should recognize their own business in the copy, not see generic filler.
- Use ask_user (max 3 times per session) only for genuinely critical missing information — business name, currency/country if ambiguous, primary contact channel. Don't ask about things you can reasonably default.
- Call finalize_draft only once the site actually reflects the request AND satisfies every rule under SITE TYPE above — don't finalize a half-built or wrong-shaped site. finalize_draft will be rejected with specific corrections if it doesn't, so get it right rather than guessing you're done.`;
}

export interface SiteGenerationStep {
  tool: string;
  args: unknown;
  result: string;
  isError: boolean;
}

export interface SiteGenerationResult {
  summary: string;
  steps: SiteGenerationStep[];
  provider: string;
  model: string;
  /** Set when the agent called ask_user — caller should surface this and resume with the answer, not treat it as failure. */
  pendingQuestion?: { question: string; options?: string[] };
  /** The full message history at this point — required to resume a paused (pendingQuestion) run via priorMessages. Without it, no caller could ever construct a valid resume input. */
  messages: AIMessage[];
}

export class SiteGenerationError extends Error {}

export interface RunSiteGenerationOptions {
  ai: AIFailover;
  siteId: string;
  storeName: string;
  storeSlug: string;
  industry: string;
  /** The site's own SiteType (ECOMMERCE | WEBSITE | LANDING_PAGE) — the merchant's own choice at site creation, the authoritative signal for what structural shape this generation should produce. */
  siteType: string;
  task: string;
  maxIterations?: number;
  /** Resume a session after ask_user — prior message history from the same run. */
  priorMessages?: AIMessage[];
  /** Called after every tool executes — for streaming live progress to a UI. */
  onStep?: (step: SiteGenerationStep) => void;
  /** Checked at the top of every iteration — return true to stop the run immediately (a merchant-triggered cancel). */
  shouldCancel?: () => Promise<boolean>;
}

export async function runSiteGenerationAgent(opts: RunSiteGenerationOptions): Promise<SiteGenerationResult> {
  const { ai, siteId, storeName, storeSlug, industry, siteType, task, maxIterations = 15, priorMessages, onStep, shouldCancel } = opts;
  const rules = getSiteIntentRules(siteType);
  const safetyMatch = detectSensitiveCategory(`${task} ${industry}`);
  const safetyCategory = safetyMatch?.tier === "guardrail" ? safetyMatch.category : null;

  const messages: AIMessage[] = priorMessages?.length
    ? [...priorMessages, { role: "user", content: task }]
    : [
        { role: "system", content: buildSystemPrompt(rules, safetyCategory) },
        { role: "user", content: task },
      ];

  const steps: SiteGenerationStep[] = [];
  let lastProvider = "";
  let lastModel = "";
  let askCount = priorMessages?.filter((m) => m.role === "assistant" && m.toolCalls?.some((t) => t.function.name === "ask_user")).length || 0;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    if (shouldCancel && (await shouldCancel())) {
      throw new SiteGenerationError("Generation was cancelled.");
    }
    const result = await ai.chat({
      capability: AICapability.FUNCTION_CALLING,
      messages,
      tools: TOOL_DEFS,
      toolChoice: "required",
      maxTokens: 4096,
      temperature: 0.5,
    });

    if (!result.success || !result.data) {
      const errors = result.failedProviders?.map((f) => `${f.provider}: ${f.error}`).join("; ") || "Unknown error";
      throw new SiteGenerationError(`AI request failed: ${errors}`);
    }

    lastProvider = result.data.provider;
    lastModel = result.data.model;

    const toolCalls = result.data.toolCalls;
    if (!toolCalls || toolCalls.length === 0) {
      messages.push({ role: "assistant", content: result.data.content || "" });
      messages.push({ role: "user", content: "You must call one of the available tools — do not reply with plain text." });
      continue;
    }

    messages.push({ role: "assistant", content: "", toolCalls });

    for (const call of toolCalls) {
      const { name, arguments: rawArgs } = call.function;
      let args: unknown;
      try {
        args = JSON.parse(rawArgs);
      } catch {
        const step: SiteGenerationStep = { tool: name, args: rawArgs, result: "Arguments were not valid JSON.", isError: true };
        steps.push(step);
        onStep?.(step);
        messages.push({ role: "tool", toolCallId: call.id, content: step.result });
        continue;
      }

      if (name === "ask_user") {
        const parsed = askUserSchema.safeParse(args);
        if (parsed.success) {
          askCount++;
          if (askCount > 3) {
            messages.push({ role: "tool", toolCallId: call.id, content: "You've already asked 3 questions this session — proceed with a reasonable default instead of asking again." });
            continue;
          }
          return {
            summary: "",
            steps,
            provider: lastProvider,
            model: lastModel,
            pendingQuestion: { question: parsed.data.question, options: parsed.data.options },
            messages,
          };
        }
      }

      if (name === "finalize_draft") {
        const parsed = finalizeDraftSchema.safeParse(args);
        if (parsed.success) {
          const violations = await rules.validate(siteId);
          if (violations.length > 0) {
            // Same enforcement shape as the coding agent's quality
            // checklist and mandatory screenshot: a self-reported "done"
            // is not accepted when the actual database state
            // demonstrably doesn't match this site type's rules. Tell it
            // exactly what's wrong and force another iteration to
            // actually fix it, rather than finalizing a wrong-shaped site.
            const message = `finalize_draft was rejected — the actual site doesn't match its site type's rules yet:\n${violations.map((v) => `- ${v.detail}`).join("\n")}\nFix these, then call finalize_draft again.`;
            messages.push({ role: "tool", toolCallId: call.id, content: message });
            const rejectionStep: SiteGenerationStep = { tool: name, args, result: message, isError: true };
            steps.push(rejectionStep);
            onStep?.(rejectionStep);
            continue;
          }

          if (safetyCategory) {
            // Real check against the actual generated text, not the
            // prompt's instructions — the copy came from a separate
            // nested LLM call that could ignore or drift from guardrail
            // wording, same reasoning as site-intent's DB-state check.
            const pages = await prisma.page.findMany({ where: { siteId }, select: { content: true } });
            const allText = pages.map((p: { content: unknown }) => extractTextFromContent(p.content)).join(" \n ");
            const safetyViolations = scanForSafetyViolations(safetyCategory, allText);
            if (safetyViolations.length > 0) {
              const message = `finalize_draft was rejected — this is a regulated business category with mandatory content rules that aren't met yet:\n${safetyViolations.map((v) => `- ${v.detail}`).join("\n")}\nFix these, then call finalize_draft again.`;
              messages.push({ role: "tool", toolCallId: call.id, content: message });
              const rejectionStep: SiteGenerationStep = { tool: name, args, result: message, isError: true };
              steps.push(rejectionStep);
              onStep?.(rejectionStep);
              continue;
            }
          }

          return { summary: parsed.data.summary, steps, provider: lastProvider, model: lastModel, messages };
        }
      }

      const { result: toolResult, isError } = await executeTool(siteId, storeName, storeSlug, industry, ai, name, args, safetyCategory);
      const step: SiteGenerationStep = { tool: name, args, result: toolResult, isError };
      steps.push(step);
      onStep?.(step);
      messages.push({ role: "tool", toolCallId: call.id, content: toolResult });
    }
  }

  throw new SiteGenerationError(`Site generation did not finish within ${maxIterations} iterations.`);
}

async function executeTool(
  siteId: string,
  storeName: string,
  storeSlug: string,
  industry: string,
  ai: AIFailover,
  name: string,
  args: unknown,
  safetyCategory: SensitiveCategory | null
): Promise<{ result: string; isError: boolean }> {
  try {
    switch (name) {
      case "create_page": {
        const parsed = createPageSchema.parse(args);
        const slug = parsed.type === "HOME" ? "home" : parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        // Real content, not a structural skeleton — generate it scoped to
        // exactly the requested sections, reusing the same schema/prompt
        // already proven for full-site generation (ai-schemas/store-generation.ts),
        // just constrained to fewer fields per call.
        const content = await generateStructured({
          ai,
          schema: storeGenerationSchema,
          toolName: "generate_page_content",
          toolDescription: `Generates real, on-brand content for a ${parsed.type} page with these sections: ${parsed.sections.join(", ")}.`,
          systemPrompt: `You are a senior brand copywriter. Always call generate_page_content — never reply with plain text. Never write placeholder/lorem-ipsum copy.${safetyCategory ? `\n\n${getGuardrailPromptRules(safetyCategory)}` : ""}`,
          userPrompt: `Business: ${storeName} (${industry}). Page: "${parsed.title}" (${parsed.type}). Sections in order: ${parsed.sections.join(", ")}. Write real, specific content — no generic filler.`,
          maxTokens: 6000,
          temperature: 0.7,
        });

        const images = getRandomIndustryImages(industry);
        const blocks = buildDynamicHomePage(
          { ...content.data, layout: { sections: parsed.sections, vibe: content.data.layout?.vibe || "clean" } },
          storeName,
          storeSlug,
          industry,
          images
        );

        const created = await prisma.page.upsert({
          where: { siteId_slug: { siteId, slug } },
          // Draft by default - isPublished: true would make this live on
          // the real public storefront the instant one page exists,
          // violating "preview != live until explicit Publish" (a
          // top-level goal, not just a nice-to-have). An explicit human
          // publish action flips this, not the agent itself finishing a task.
          create: { siteId, slug, title: parsed.title, type: parsed.type, content: blocks as object, isPublished: false },
          update: { title: parsed.title, content: blocks as object },
        });
        // Snapshot the resulting state, not the pre-change one — undo
        // restores "the version before this one", so what matters is
        // having a walkable trail of every real state this page has
        // been in, starting from its very first creation.
        await prisma.pageVersion.create({ data: { pageId: created.id, title: created.title, content: created.content as object } });

        return { result: `Created page "${parsed.title}" (${slug}) with ${parsed.sections.length} sections.`, isError: false };
      }

      case "update_section": {
        const parsed = updateSectionSchema.parse(args);
        const page = await prisma.page.findUnique({ where: { siteId_slug: { siteId, slug: parsed.pageSlug } } });
        if (!page) return { result: `No page with slug "${parsed.pageSlug}" exists — call create_page first.`, isError: true };

        const blocks = Array.isArray(page.content) ? [...(page.content as Record<string, unknown>[])] : [];
        if (parsed.sectionIndex >= blocks.length) {
          return { result: `Page "${parsed.pageSlug}" only has ${blocks.length} sections (0-${blocks.length - 1}) — sectionIndex ${parsed.sectionIndex} doesn't exist.`, isError: true };
        }
        const target = blocks[parsed.sectionIndex] as { settings?: Record<string, unknown> };
        blocks[parsed.sectionIndex] = { ...target, settings: { ...(target.settings || {}), ...parsed.content } };

        await prisma.page.update({ where: { id: page.id }, data: { content: blocks as object } });
        await prisma.pageVersion.create({ data: { pageId: page.id, title: page.title, content: blocks as object } });
        return { result: `Updated section ${parsed.sectionIndex} on "${parsed.pageSlug}".`, isError: false };
      }

      case "set_theme": {
        const parsed = setThemeSchema.parse(args);
        await prisma.siteSettings.upsert({
          where: { siteId },
          create: { siteId, themeSettings: parsed as object },
          update: { themeSettings: parsed as object },
        });
        return { result: `Theme set: ${parsed.vibe}${parsed.primaryColorHint ? ` (${parsed.primaryColorHint})` : ""}.`, isError: false };
      }

      case "set_navigation": {
        const parsed = setNavigationSchema.parse(args);
        await prisma.siteSettings.upsert({
          where: { siteId },
          create: { siteId, navigationSettings: parsed as object },
          update: { navigationSettings: parsed as object },
        });
        return { result: `Navigation set: ${parsed.links.map((l) => l.label).join(", ")}.`, isError: false };
      }

      case "upsert_product": {
        const parsed = upsertProductSchema.parse(args);
        const slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const product = parsed.id
          ? await prisma.product.update({
              where: { id: parsed.id },
              data: { name: parsed.name, description: parsed.description, price: parsed.price, compareAtPrice: parsed.compareAtPrice, images: parsed.images, stock: parsed.stock },
            })
          : await prisma.product.create({
              data: { siteId, name: parsed.name, slug, description: parsed.description, price: parsed.price, compareAtPrice: parsed.compareAtPrice, images: parsed.images, stock: parsed.stock, status: "ACTIVE" },
            });
        return { result: `${parsed.id ? "Updated" : "Created"} product "${product.name}" (${product.id}).`, isError: false };
      }

      case "remove_product": {
        const parsed = removeProductSchema.parse(args);
        await prisma.product.delete({ where: { id: parsed.id } });
        return { result: `Removed product ${parsed.id}.`, isError: false };
      }

      case "set_whatsapp": {
        const parsed = setWhatsappSchema.parse(args);
        await prisma.siteSettings.upsert({
          where: { siteId },
          create: { siteId, whatsappNumber: parsed.number, whatsappOrdering: parsed.enabled },
          update: { whatsappNumber: parsed.number, whatsappOrdering: parsed.enabled },
        });
        return { result: `WhatsApp ordering ${parsed.enabled ? "enabled" : "disabled"} with number ${parsed.number}.`, isError: false };
      }

      case "set_delivery_zones": {
        const parsed = setDeliveryZonesSchema.parse(args);
        await prisma.deliveryZone.deleteMany({ where: { siteId } });
        await prisma.deliveryZone.createMany({
          data: parsed.zones.map((z, i) => ({ siteId, name: z.name, areas: [z.name], fee: z.fee, position: i })),
        });
        return { result: `Set ${parsed.zones.length} delivery zone(s): ${parsed.zones.map((z) => z.name).join(", ")}.`, isError: false };
      }

      case "set_payment_stub": {
        const parsed = setPaymentStubSchema.parse(args);
        if (parsed.mode === "connected") {
          const gateway = parsed.preferredProvider
            ? await prisma.paymentGateway.findUnique({ where: { siteId_provider: { siteId, provider: parsed.preferredProvider } } })
            : await prisma.paymentGateway.findFirst({ where: { siteId, isEnabled: true } });
          if (!gateway?.isEnabled) {
            return { result: `No payment gateway is actually configured for this store yet — checkout will show "Order via WhatsApp" / "Configure payments" instead. This is expected for a new store, not an error to fix here.`, isError: false };
          }
        }
        await prisma.siteSettings.upsert({
          where: { siteId },
          create: { siteId, payOnDelivery: parsed.mode !== "connected", bankTransfer: parsed.mode !== "connected" },
          update: { payOnDelivery: parsed.mode !== "connected", bankTransfer: parsed.mode !== "connected" },
        });
        return { result: `Checkout mode set to ${parsed.mode}.`, isError: false };
      }

      case "set_seo": {
        const parsed = setSeoSchema.parse(args);
        await prisma.page.update({
          where: { siteId_slug: { siteId, slug: parsed.pageSlug } },
          data: { metaTitle: parsed.title, metaDescription: parsed.description },
        });
        return { result: `SEO set for "${parsed.pageSlug}".`, isError: false };
      }

      case "attach_asset": {
        const parsed = attachAssetSchema.parse(args);
        const page = await prisma.page.findUnique({ where: { siteId_slug: { siteId, slug: parsed.pageSlug } } });
        if (!page) return { result: `No page with slug "${parsed.pageSlug}" exists.`, isError: true };
        const blocks = Array.isArray(page.content) ? [...(page.content as Record<string, unknown>[])] : [];
        if (parsed.sectionIndex >= blocks.length) return { result: `Section ${parsed.sectionIndex} doesn't exist on "${parsed.pageSlug}".`, isError: true };
        const target = blocks[parsed.sectionIndex] as { settings?: Record<string, unknown> };
        blocks[parsed.sectionIndex] = { ...target, settings: { ...(target.settings || {}), [parsed.field]: parsed.assetUrl } };
        await prisma.page.update({ where: { id: page.id }, data: { content: blocks as object } });
        return { result: `Attached asset to ${parsed.field} on section ${parsed.sectionIndex}.`, isError: false };
      }

      default:
        return { result: `Unknown tool: ${name}`, isError: true };
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { result: `Invalid arguments: ${err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`, isError: true };
    }
    if (err instanceof AIStructuredOutputError) {
      return { result: `Content generation failed: ${err.message}`, isError: true };
    }
    return { result: err instanceof Error ? err.message : String(err), isError: true };
  }
}
