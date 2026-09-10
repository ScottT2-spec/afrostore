import { z } from "zod";

/**
 * The site manifest: a structured summary of what a generated project
 * currently contains, kept up to date by the coding agent's finish_task
 * call and read back at the START of the next run.
 *
 * Why this exists: each new agent run starts with zero memory of previous
 * runs — the model only knows what's in its own message history for THIS
 * task. Without this, "what pages does the site have already" can only be
 * answered by list_files/read_file calls against the live sandbox, every
 * single time, even for a follow-up like "add a testimonials section to
 * the about page" where the agent first has to rediscover that an about
 * page exists at all. The manifest is a cheap, structured shortcut for
 * exactly that recurring question — not a replacement for exploration
 * when a task genuinely needs it (see the system prompt's own guidance:
 * substantial/ambiguous requests should still explore first; the manifest
 * makes that exploration start from an informed place instead of nothing,
 * it doesn't remove judgment about when to double-check by reading a file
 * directly).
 *
 * Kept intentionally small and high-level — page titles/purposes and
 * component names/purposes, not file contents. It's meant to fit in a
 * few hundred tokens of system-prompt context, not to duplicate what
 * read_file is for.
 */

export const sitePageEntrySchema = z.object({
  route: z.string().describe("The route path as registered in src/App.tsx, e.g. '/', '/pricing', '/about'."),
  title: z.string().describe("The page's actual heading/title as shown to a visitor, e.g. 'Pricing Plans'."),
  purpose: z.string().describe("One sentence: what this page is for and what's on it, e.g. 'Product pricing tiers with a comparison table and a signup CTA.'"),
  file: z.string().describe("The page's file path, e.g. 'src/pages/Pricing.tsx'."),
});

export const siteComponentEntrySchema = z.object({
  name: z.string().describe("The component's name, e.g. 'TestimonialCarousel'."),
  file: z.string().describe("The component's file path, e.g. 'src/components/TestimonialCarousel.tsx'."),
  purpose: z.string().describe("One sentence: what it does and where it's used, e.g. 'Rotating customer quote carousel, used on Home and About.'"),
});

export const siteManifestSchema = z.object({
  summary: z.string().describe("2-3 sentences: what this site is, for a viewer with no other context — the business type, its overall structure, and anything a future task should know before changing it."),
  pages: z.array(sitePageEntrySchema).describe("Every page currently registered as a route. Keep this in sync with src/App.tsx exactly — a page listed here that no longer has a route, or a route missing from here, defeats the whole point."),
  components: z.array(siteComponentEntrySchema).describe("Reusable/shared components worth knowing about before building something similar from scratch — NOT every file (skip trivial one-off pieces), just ones a future task might otherwise duplicate unknowingly."),
  designNotes: z.string().optional().describe("Anything about established visual conventions worth preserving that isn't already covered by the fixed design tokens/component library — e.g. a particular tone, an unusual layout choice made deliberately, a pattern established across pages that a new page should match."),
});

export type SiteManifest = z.infer<typeof siteManifestSchema>;

/** A manifest with no pages yet — the starting state before the first successful coding-agent run for a site. */
export function emptyManifest(): SiteManifest {
  return { summary: "No pages have been generated yet.", pages: [], components: [] };
}

/** Renders a manifest into the compact text block injected into the coding agent's context at the start of a run. Kept plain and short by design — this is a briefing, not a data dump. */
export function renderManifestForPrompt(manifest: SiteManifest | null): string {
  if (!manifest || manifest.pages.length === 0) {
    return "This site has no pages generated yet — this is the first build.";
  }

  const pageLines = manifest.pages
    .map((p) => `- ${p.route} (${p.file}): "${p.title}" — ${p.purpose}`)
    .join("\n");
  const componentLines = manifest.components.length > 0
    ? manifest.components.map((c) => `- ${c.name} (${c.file}): ${c.purpose}`).join("\n")
    : "(none noted)";

  return `CURRENT SITE STATE (from the last successful build — verify anything critical with read_file rather than assuming this is still perfectly accurate if it seems stale):
${manifest.summary}

Pages:
${pageLines}

Reusable components:
${componentLines}
${manifest.designNotes ? `\nDesign notes: ${manifest.designNotes}` : ""}`;
}
