/**
 * AI Store Generator
 *
 * WordPress-style AI site builder. Given a business type, name, and description,
 * generates a complete set of store pages (Home, About, FAQ, Contact, Policies)
 * using the page builder block system.
 *
 * The AI generates the content; this module structures it into builder blocks
 * and persists the pages to the database.
 */

import { prisma } from "@/lib/db";
import { AIFailover } from "@/lib/failover";
import type { AIProviderConfig } from "@/lib/failover";
import { AICapability } from "@/lib/failover";
import type { BuilderBlock, BlockType } from "@/lib/builder/types";
import { detectIndustry, getRandomIndustryImages, getIndustryImagesAsync } from "@/lib/ai-image-pools";
import { classifyBusiness } from "@/lib/ai-classify";
import { buildDynamicHomePage } from "@/lib/ai-layout-engine";

/** Randomized image set for this store generation run */
interface StoreImages {
  hero: string;
  about: string;
  lifestyle: string;
  showcase: string[];
  banner: string;
}

// ─── Types ──────────────────────────────────────────────────

export interface StoreGeneratorInput {
  siteId: string;
  storeSlug: string;
  storeName: string;
  businessType: string;
  description?: string;
  country?: string;
  currency?: string;
  targetAudience?: string;
  productsOffered?: string[];
  servicesOffered?: string[];
  brandVibe?: string; // e.g. "luxurious", "playful", "minimal" — from brand color/font choices or explicit input
}

export interface GeneratedPage {
  title: string;
  slug: string;
  type: "HOME" | "ABOUT" | "CONTACT" | "FAQ" | "POLICY" | "CUSTOM";
  blocks: BuilderBlock[];
  metaTitle: string;
  metaDescription: string;
}

export interface StoreGeneratorResult {
  pages: Array<{ id: string; title: string; slug: string; type: string }>;
  provider: string;
  model: string;
}

// ─── AI Provider setup (reuses same env vars as ai-service) ─

let aiFailover: AIFailover | null = null;

function getAIProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
      fallbackModels: ["gpt-4o-mini"],
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING],
    });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      provider: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-5-sonnet-20241022",
      fallbackModels: ["claude-3-haiku-20240307"],
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING],
    });
  }
  if (process.env.GOOGLE_AI_KEY) {
    providers.push({
      provider: "google",
      apiKey: process.env.GOOGLE_AI_KEY,
      model: "gemini-3.6-flash",
      fallbackModels: ["gemini-3.5-flash-lite"],
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING],
    });
  }
  // Register all available Groq keys as separate providers for rate-limit failover
  const groqKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_KEY_2,
    process.env.GROQ_KEY_3,
    process.env.GROQ_KEY_4,
  ].filter(Boolean) as string[];

  groqKeys.forEach((key, i) => {
    providers.push({
      provider: i === 0 ? "groq" : `groq_${i + 1}`,
      apiKey: key,
      model: "openai/gpt-oss-120b",
      capabilities: [AICapability.CHAT],
    });
  });
  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      provider: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: "deepseek-chat",
      capabilities: [AICapability.CHAT],
    });
  }
  return providers;
}

function getAI(): AIFailover {
  if (!aiFailover) {
    const providers = getAIProviders();
    if (providers.length === 0) {
      throw new Error("No AI providers configured");
    }
    aiFailover = new AIFailover({
      providers,
      priorityOrder: ["groq", "groq_2", "groq_3", "groq_4", "google", "openai", "anthropic", "deepseek"],
      circuitBreaker: { failureThreshold: 3, recoveryTimeoutMs: 30_000 },
      healthCheckIntervalMs: 0,
      requestTimeoutMs: 90_000, // longer timeout for generation
    });
  }
  return aiFailover;
}

// ─── Helpers ────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function block(type: BlockType, props: Record<string, unknown>): BuilderBlock {
  return { id: uid(), type, props };
}

// ─── Prompt ─────────────────────────────────────────────────

function buildGenerationPrompt(input: StoreGeneratorInput): string {
  const currency = input.currency || "GHS";
  const country = input.country || "Ghana";

  const contextLines = [
    `- Store name: "${input.storeName}"`,
    `- Business type: ${input.businessType}`,
    `- Description: ${input.description || "Not provided"}`,
    `- Country: ${country}`,
    `- Currency: ${currency}`,
  ];
  if (input.targetAudience) contextLines.push(`- Target audience: ${input.targetAudience}`);
  if (input.productsOffered && input.productsOffered.length > 0) contextLines.push(`- Specific products they sell: ${input.productsOffered.join(", ")}`);
  if (input.servicesOffered && input.servicesOffered.length > 0) contextLines.push(`- Specific services they offer: ${input.servicesOffered.join(", ")}`);
  if (input.brandVibe) contextLines.push(`- Brand personality/vibe to match: ${input.brandVibe}`);

  return `You are a senior e-commerce brand strategist and copywriter, the kind agencies pay a lot of money for. You're writing the launch content for a real business, not filling in a template. Every line should sound like it was written by someone who actually understands THIS business — never generic, never interchangeable with a competitor's store.

Generate complete website content for this store:
${contextLines.join("\n")}

Generate content for these 5 pages as a JSON object. Be specific to this business — no generic placeholder text. Write like a real brand, warm and professional. Tailor to the African market (mention local delivery, local payment methods like bank transfer/Paystack, WhatsApp ordering, etc where relevant).
${input.targetAudience ? `\nWrite specifically FOR ${input.targetAudience} — word choice, tone, and what you emphasize should all speak to that person, not a generic shopper.` : ""}
${input.productsOffered?.length || input.servicesOffered?.length ? `\nGround the copy in the ACTUAL products/services listed above — reference them specifically in the hero, FAQ, and features rather than describing the business abstractly.` : ""}

Call the generate_store_content function with this content. A few formatting notes the schema alone won't tell you:
- about.story: use \n\n between paragraphs
- layout.sections: valid section names are hero-image, hero-minimal, hero-split, hero-bold, products, products-featured, products-compact, features, stats, testimonials, story, story-full, newsletter, trust, banner, gallery, contact, faq, values, team, countdown
- seo.homeTitle/aboutTitle/faqTitle/contactTitle: 50-60 characters. The matching *Desc fields: 150-160 characters.

Rules:
- For layout.sections, pick 6-10 section names from the available list above. Order them how the homepage should flow. MUST start with a hero variant. Pick sections that make sense for this specific business type — a restaurant needs gallery and contact, a fashion store needs products-featured, a service business needs features and values, a church needs values and team, etc. Vary the combination — don't always use the same set.
- STRICT: every field this schema requires (features, testimonials, faq.items, about.values) must come back genuinely populated with real, specific content — never an empty array, never a single word placeholder. A homepage section with no content under its heading is a broken page, not an acceptable partial result. If you pick "testimonials" or "faq" or "features" or "values" for layout.sections, you MUST also write real content for it in the matching field — don't select a section and then leave its content thin or empty.
- stats: generate realistic, MODEST numbers appropriate for a new/growing business. Don't claim "10,000+ customers" for a startup. Be honest and aspirational.
- bannerCta, newsletterCopy, productSectionTitle: tailor these to the specific business. A real estate site says "Featured Properties", not "Our Products". A restaurant says "Our Menu", not "Shop Now".
- Use real-sounding African names for testimonials (${country}-appropriate)
- Make FAQ answers specific to ${input.businessType} businesses
- Shipping/delivery policy should reference local delivery in ${country}
- Payment section should reference local payment methods
- Keep tone warm, confident, and trustworthy
- NO placeholder brackets like [Your Name] — write real content
- Ban these overused AI-copywriting clichés entirely, they make copy feel fake: "elevate your", "unlock", "unleash", "seamless", "seamlessly", "in today's world", "look no further", "step into", "journey", "game-changing", "revolutionize", "at the end of the day", "whether you're... or...". If you catch yourself about to write one, rewrite the sentence a completely different way.
- Prefer concrete, specific, sensory detail over abstract claims. "Hand-stitched in Accra using leather sourced from Kumasi" beats "high-quality craftsmanship". Specificity is what makes a store memorable instead of generic.
- Every headline should sound like it belongs to THIS business and no one else's — if you could paste it onto a competitor's site unchanged, rewrite it.`;
}

// ─── Build pages from AI content ────────────────────────────

function buildHomePage(data: Record<string, any>, storeName: string, storeSlug: string, images: StoreImages, industry: string, whatsappNumber?: string): GeneratedPage {
  const brand = data.brand || {};

  // The dynamic layout engine (ai-layout-engine.ts) is the only homepage
  // path now — it always returns a populated section list (every section
  // it can pick falls back to real content, and validateAndFixSections
  // itself falls back to an industry layout preset if the AI's own
  // section list is missing or too short), so there's no case left where
  // it comes back empty. This used to have a second "if dynamicBlocks is
  // empty, fall back to the old Allbirds-preset template instead" path;
  // that fallback was legacy, effectively dead code, and a second place
  // for the exact "heading renders, content doesn't" bug to hide in, so
  // it's been removed rather than kept in sync with the real path.
  const dynamicBlocks = buildDynamicHomePage(data, storeName, storeSlug, industry, images, whatsappNumber);

  return {
    title: "Home",
    slug: "home",
    type: "HOME",
    blocks: dynamicBlocks,
    metaTitle: data.seo?.homeTitle || `${storeName} — Official Store`,
    metaDescription: data.seo?.homeDesc || brand.heroSubheading || "",
  };
}

// Same "never let a picked section render with zero content" guarantee
// used by the homepage layout engine (ai-layout-engine.ts) — the About
// and FAQ pages built below are a separate, older code path and had the
// same bug: a section's heading would render while its items list was
// silently empty, because the code skipped the block or fell through to
// items: [] instead of falling back to real, usable starter content.
const ABOUT_PAGE_GENERIC_VALUES = [
  { title: "Quality First", desc: "We stand behind everything we sell." },
  { title: "Customer Focused", desc: "Your satisfaction is our top priority." },
  { title: "Reliable Service", desc: "Consistent, dependable experience every time." },
];

function aboutPageGenericTestimonials(storeName: string) {
  return [
    { name: "Amara O.", role: "Verified Buyer", text: `Great experience with ${storeName} — quality was exactly as described and delivery was quick.` },
    { name: "Tunde K.", role: "Verified Buyer", text: `Really happy with my order. Will definitely be shopping with ${storeName} again.` },
    { name: "Chiamaka B.", role: "Verified Buyer", text: `Excellent customer service and the product exceeded my expectations.` },
  ];
}

function aboutPageGenericFaq(storeName: string) {
  return [
    { question: "How long does delivery take?", answer: `We aim to get your order to you as quickly as possible. Reach out to ${storeName} directly for exact delivery times to your area.` },
    { question: "What payment methods do you accept?", answer: "We accept a range of secure payment options at checkout." },
    { question: "Can I return or exchange an item?", answer: "Yes — contact us after your order arrives and we'll help sort out a return or exchange." },
    { question: "How can I contact you?", answer: `You can reach ${storeName} through the contact details on our Contact page.` },
  ];
}

function buildAboutPage(data: Record<string, any>, storeName: string, storeSlug: string, images: StoreImages): GeneratedPage {
  const about = data.about || {};
  const testimonials = data.testimonials || [];
  const valueIcons = ["heart", "award", "globe", "shield", "target", "rocket"];

  // Split story into two halves for image-text sections
  const storyText = about.story || `${storeName} is dedicated to providing the best products and services.`;
  const storyParts = storyText.split(/\n\n+/);
  const firstHalf = storyParts.slice(0, Math.ceil(storyParts.length / 2)).join("\n\n");
  const secondHalf = storyParts.slice(Math.ceil(storyParts.length / 2)).join("\n\n");

  const blocks: BuilderBlock[] = [
    block("hero", {
      heading: about.headline || `About ${storeName}`,
      subheading: "Our story, our mission, our people",
      bgStyle: "gradient",
      buttonText: "",
    }),
    block("spacer", { height: 56 }),

    // Story section 1
    block("imageText", {
      badge: "Our Story",
      title: `Why ${storeName}?`,
      text: firstHalf,
      image: images.about,
      imageAlt: `${storeName} - Our Story`,
      reverse: false,
      buttonText: "",
    }),
    block("spacer", { height: 48 }),
  ];

  // Story section 2
  if (secondHalf) {
    blocks.push(
      block("imageText", {
        badge: "Our Mission",
        title: "What Drives Us",
        text: secondHalf,
        image: images.lifestyle,
        imageAlt: `${storeName} - Our Mission`,
        reverse: true,
        buttonText: "",
      })
    );
    blocks.push(block("spacer", { height: 48 }));
  }

  // Values — always render with real content. Previously this whole
  // block was skipped unless about.values was non-empty; if it skipped,
  // fine, but if it rendered with a short/empty array the heading would
  // show with nothing under it. Now it always has a heading AND items.
  {
    const values = about.values && about.values.length > 0 ? about.values : ABOUT_PAGE_GENERIC_VALUES;
    blocks.push(
      block("features", {
        title: "Our Values",
        subtitle: "The principles that guide everything we do",
        bgColor: "surface",
        items: values.map((v: any, i: number) => ({
          icon: valueIcons[i % valueIcons.length],
          title: v.title,
          desc: v.desc,
        })),
      })
    );
    blocks.push(block("spacer", { height: 48 }));
  }

  // Stats
  blocks.push(
    block("stats", {
      title: "Our Impact",
      bgColor: "brand",
      items: [
        { value: "1,000+", label: "Happy Customers", icon: "users" },
        { value: "500+", label: "Products Sold", icon: "package" },
        { value: "4.9", label: "Customer Rating", icon: "star" },
        { value: "24/7", label: "Support", icon: "headphones" },
      ],
    })
  );
  blocks.push(block("spacer", { height: 48 }));

  // Testimonials — same guarantee: always a populated section, never a
  // bare heading with an empty items array underneath it.
  {
    const items = testimonials.length > 0 ? testimonials.slice(0, 3) : aboutPageGenericTestimonials(storeName);
    blocks.push(
      block("testimonials", {
        title: "Loved by Our Customers",
        bgColor: "transparent",
        items: items.map((t: any) => ({
          name: t.name,
          role: t.role || "Customer",
          text: t.text,
          rating: 5,
        })),
      })
    );
    blocks.push(block("spacer", { height: 48 }));
  }

  // CTA Banner
  blocks.push(
    block("banner", {
      title: "Ready to Experience the Difference?",
      subtitle: "Join thousands of happy customers today",
      buttonText: "Browse Products",
      buttonHref: `/store/${storeSlug}/shop`,
      bgColor: "dark",
    })
  );

  return {
    title: "About Us",
    slug: "about",
    type: "ABOUT",
    blocks,
    metaTitle: data.seo?.aboutTitle || `About — ${storeName}`,
    metaDescription: data.seo?.aboutDesc || "",
  };
}

function buildFAQPage(data: Record<string, any>, storeName: string, storeSlug: string): GeneratedPage {
  const faq = data.faq || {};
  // Never render this page with a heading and an empty accordion under
  // it — fall back to honest, generic starter Q&A the same way the
  // homepage's "faq" section already does.
  const faqItems = faq.items && faq.items.length > 0 ? faq.items : aboutPageGenericFaq(storeName);

  const blocks: BuilderBlock[] = [
    block("hero", {
      heading: "Frequently Asked Questions",
      subheading: "Got questions? We've got answers.",
      bgStyle: "light",
      buttonText: "",
    }),
    block("spacer", { height: 48 }),
    block("faq", {
      title: "",
      items: faqItems.slice(0, 8).map((item: any) => ({
        question: item.question,
        answer: item.answer,
      })),
    }),
    block("spacer", { height: 48 }),
    block("divider", { style: "dots" }),
    block("spacer", { height: 48 }),
    block("contactInfo", {
      title: "Other Ways to Reach Us",
      items: [
        { icon: "message", title: "WhatsApp", value: "Message us for quick help" },
        { icon: "mail", title: "Email", value: "Send us a detailed message" },
        { icon: "phone", title: "Phone", value: "Call during business hours" },
      ],
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
    }),
    block("spacer", { height: 48 }),
    block("banner", {
      title: "Still Have Questions?",
      subtitle: "Our friendly team is here to help",
      buttonText: "Contact Us",
      buttonHref: `/store/${storeSlug}/contact`,
      bgColor: "dark",
    }),
  ];

  return {
    title: "FAQ",
    slug: "faq",
    type: "FAQ",
    blocks,
    metaTitle: data.seo?.faqTitle || `FAQ — ${storeName}`,
    metaDescription: data.seo?.faqDesc || "",
  };
}

function buildContactPage(data: Record<string, any>, storeName: string): GeneratedPage {
  const contact = data.contact || {};

  const blocks: BuilderBlock[] = [
    block("hero", {
      heading: contact.headline || "Get in Touch",
      subheading: contact.subtitle || "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      bgStyle: "light",
      buttonText: "",
    }),
    block("spacer", { height: 48 }),
    block("contactInfo", {
      title: "Contact Information",
      items: [
        { icon: "mail", title: "Email", value: "hello@example.com" },
        { icon: "phone", title: "Phone", value: "+233 XX XXX XXXX" },
        { icon: "message", title: "WhatsApp", value: "Quick chat support" },
        { icon: "map-pin", title: "Address", value: "Accra, Ghana" },
      ],
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
    }),
    block("spacer", { height: 48 }),
    block("contactForm", {
      title: "Send Us a Message",
      subtitle: "We'll respond within 24 hours",
      fields: ["name", "email", "phone", "message"],
      buttonText: "Send Message",
    }),
    block("spacer", { height: 48 }),
    block("newsletter", {
      title: "Stay in the Loop",
      subtitle: "Get updates on new products and exclusive offers.",
      bgColor: "surface",
    }),
  ];

  return {
    title: "Contact Us",
    slug: "contact",
    type: "CONTACT",
    blocks,
    metaTitle: data.seo?.contactTitle || `Contact — ${storeName}`,
    metaDescription: data.seo?.contactDesc || "",
  };
}

function buildPoliciesPage(data: Record<string, any>, storeName: string): GeneratedPage {
  const policies = data.policies || {};

  const blocks: BuilderBlock[] = [
    block("heading", {
      text: "Store Policies",
      level: "h1",
      align: "center",
      color: "#171717",
      fontSize: "3xl",
    }),
    block("spacer", { height: 32 }),

    // Shipping
    block("heading", {
      text: "📦 Shipping & Delivery",
      level: "h2",
      align: "left",
      color: "#171717",
      fontSize: "xl",
    }),
    block("spacer", { height: 8 }),
    block("text", {
      text: policies.shipping || "We deliver nationwide. Orders within Accra are delivered in 1-2 business days. Other regions take 3-5 business days.",
      align: "left",
      color: "#525252",
      fontSize: "base",
    }),
    block("spacer", { height: 24 }),
    block("divider", { color: "#e5e5e5", thickness: 1, style: "solid" }),
    block("spacer", { height: 24 }),

    // Returns
    block("heading", {
      text: "🔄 Returns & Refunds",
      level: "h2",
      align: "left",
      color: "#171717",
      fontSize: "xl",
    }),
    block("spacer", { height: 8 }),
    block("text", {
      text: policies.returns || "We accept returns within 7 days of delivery. Items must be unused and in original packaging. Refunds are processed within 3-5 business days.",
      align: "left",
      color: "#525252",
      fontSize: "base",
    }),
    block("spacer", { height: 24 }),
    block("divider", { color: "#e5e5e5", thickness: 1, style: "solid" }),
    block("spacer", { height: 24 }),

    // Privacy
    block("heading", {
      text: "🔒 Privacy Policy",
      level: "h2",
      align: "left",
      color: "#171717",
      fontSize: "xl",
    }),
    block("spacer", { height: 8 }),
    block("text", {
      text: policies.privacy || "We respect your privacy. Your personal information is used only to process orders and improve your shopping experience. We never share your data with third parties without your consent.",
      align: "left",
      color: "#525252",
      fontSize: "base",
    }),
  ];

  return {
    title: "Policies",
    slug: "policies",
    type: "POLICY",
    blocks,
    metaTitle: `Store Policies — ${storeName}`,
    metaDescription: `Shipping, returns, and privacy policies for ${storeName}.`,
  };
}

// ─── Main generator ─────────────────────────────────────────

export async function generateStore(input: StoreGeneratorInput): Promise<StoreGeneratorResult> {
  const ai = getAI();

  // 1. Call AI to generate content — schema-validated, not a hopeful
  //    JSON.parse(). See ai-structured-output.ts for why this replaced the
  //    old "ask nicely for JSON in the prompt, parse it as Record<string,
  //    any>" approach: the schema is now the single source of truth for
  //    both what the model is told to produce and what's accepted, and a
  //    malformed response triggers a corrective retry with the specific
  //    validation errors instead of silently reaching prisma.create().
  const prompt = buildGenerationPrompt(input);

  const { generateStructured, AIStructuredOutputError } = await import("@/lib/ai-structured-output");
  const { storeGenerationSchema } = await import("@/lib/ai-schemas/store-generation");

  let structuredResult;
  try {
    structuredResult = await generateStructured({
      ai,
      schema: storeGenerationSchema,
      toolName: "generate_store_content",
      toolDescription:
        "Generates complete, on-brand website copy and homepage layout for a new e-commerce store.",
      systemPrompt:
        "You are a senior e-commerce brand strategist and copywriter, the kind agencies pay a lot of money for. You always call the generate_store_content function — never reply with plain text.",
      userPrompt: prompt,
      maxTokens: 8000,
      temperature: 0.7,
    });
  } catch (err) {
    if (err instanceof AIStructuredOutputError) {
      console.error("AI store generation validation error:", err.message, err.issues);
      throw new Error("AI returned invalid content. Please try again.");
    }
    throw err;
  }

  const data = structuredResult.data;
  const lastResult = { data: { provider: structuredResult.provider, model: structuredResult.model } };

  // 3. Detect industry (real AI classification, falls back to keywords) and get images
  const classification = await classifyBusiness(`${input.businessType} ${input.description || ""}`);
  const pooledIndustries = new Set(["fashion", "electronics", "beauty", "food", "health", "real-estate", "kids", "grocery", "interior", "services"]);
  const industry = pooledIndustries.has(classification.industry) ? classification.industry : detectIndustry(input.businessType, input.description);
  const images = await getIndustryImagesAsync(industry, input.businessType);

  // 4. Build pages from the generated content with industry-matched images.
  //    Fetch whatever WhatsApp number is already set (e.g. a merchant who
  //    enabled WhatsApp, then regenerated) so the homepage's contact
  //    section can use the real number instead of a fake placeholder.
  const existingSettings = await prisma.siteSettings.findUnique({ where: { siteId: input.siteId }, select: { whatsappNumber: true } });
  const pages: GeneratedPage[] = [
    buildHomePage(data, input.storeName, input.storeSlug, images, industry, existingSettings?.whatsappNumber || undefined),
    buildAboutPage(data, input.storeName, input.storeSlug, images),
    buildFAQPage(data, input.storeName, input.storeSlug),
    buildContactPage(data, input.storeName),
    buildPoliciesPage(data, input.storeName),
  ];

  // 4. Persist all pages: upsert by (siteId, slug) rather than delete-then
  //    -create. The old approach deleted every existing HOME/ABOUT/FAQ/
  //    CONTACT/POLICY page first, then recreated all 5 with Promise.all —
  //    if a second generateStore() call ran concurrently (e.g. the
  //    background call from site creation racing a manual "regenerate"
  //    click) or any single create failed for any reason, Promise.all
  //    rejected and the whole batch aborted, leaving those pages deleted
  //    with nothing to replace them: a real, reproducible 404 for
  //    policies "and others" depending on which create lost the race.
  //    Upserting by slug is atomic per-page, idempotent under concurrent
  //    calls, and never leaves a page missing mid-regeneration.
  const createdPages = await Promise.all(
    pages.map((page, i) =>
      prisma.page.upsert({
        where: { siteId_slug: { siteId: input.siteId, slug: page.slug } },
        create: {
          siteId: input.siteId,
          title: page.title,
          slug: page.slug,
          type: page.type as any,
          content: page.blocks as any,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          isPublished: true,
          position: i,
        },
        update: {
          title: page.title,
          type: page.type as any,
          content: page.blocks as any,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          isPublished: true,
          position: i,
        },
      })
    )
  );

  return {
    pages: createdPages.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: p.type,
    })),
    provider: lastResult.data.provider,
    model: lastResult.data.model,
  };
}
