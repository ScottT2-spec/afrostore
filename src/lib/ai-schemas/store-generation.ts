/**
 * Schema for AI store generation output — the exact shape previously only
 * described in English inside the prompt and consumed as untyped
 * `Record<string, any>`. This is now the single source of truth: it
 * generates the tool's parameter schema (what the model is told to
 * produce) AND validates the result (what's actually accepted), so the
 * two can no longer silently drift apart the way a hand-written prompt
 * and hand-written field access always eventually do.
 *
 * No top-level unions — this schema needs to work identically across
 * every configured provider including Gemini, which rejects anyOf/oneOf
 * in function-calling parameters (see the note in ai-failover.ts).
 */

import { z } from "zod";

const titleDescPair = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
});

export const storeGenerationSchema = z.object({
  brand: z.object({
    tagline: z.string().min(1),
    heroHeading: z.string().min(1),
    heroSubheading: z.string().min(1),
    ctaText: z.string().min(1),
  }),
  about: z.object({
    headline: z.string().min(1),
    story: z.string().min(1),
    values: z.array(titleDescPair).min(1).max(6),
  }),
  faq: z.object({
    items: z
      .array(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
        })
      )
      .min(1)
      .max(12),
  }),
  policies: z.object({
    shipping: z.string().min(1),
    returns: z.string().min(1),
    privacy: z.string().min(1),
  }),
  contact: z.object({
    headline: z.string().min(1),
    subtitle: z.string().min(1),
  }),
  seo: z.object({
    homeTitle: z.string().min(1),
    homeDesc: z.string().min(1),
    aboutTitle: z.string().min(1),
    aboutDesc: z.string().min(1),
    faqTitle: z.string().min(1),
    faqDesc: z.string().min(1),
    contactTitle: z.string().min(1),
    contactDesc: z.string().min(1),
  }),
  testimonials: z
    .array(
      z.object({
        name: z.string().min(1),
        text: z.string().min(1),
        role: z.string().min(1),
      })
    )
    .min(1)
    .max(8),
  features: z.array(titleDescPair).min(1).max(8),
  layout: z.object({
    // Enumerated rather than a free string — this is what actually
    // prevents the model from hallucinating a section name the renderer
    // doesn't recognize (which previously would have silently rendered
    // nothing, or thrown deep inside the layout engine with no useful
    // error). An invalid value here is now a schema validation failure
    // that triggers a corrective retry instead of a broken page.
    sections: z
      .array(
        z.enum([
          "hero-image",
          "hero-minimal",
          "hero-split",
          "hero-bold",
          "products",
          "products-featured",
          "products-compact",
          "features",
          "stats",
          "testimonials",
          "story",
          "story-full",
          "newsletter",
          "trust",
          "banner",
          "gallery",
          "contact",
          "faq",
          "values",
          "team",
          "countdown",
        ])
      )
      .min(6)
      .max(10),
    vibe: z.string().min(1),
  }),
  stats: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      })
    )
    .length(4),
  bannerCta: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    buttonText: z.string().min(1),
  }),
  newsletterCopy: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
  }),
  productSectionTitle: z.string().min(1),
  productSectionSubtitle: z.string().min(1),
});

export type StoreGenerationOutput = z.infer<typeof storeGenerationSchema>;
