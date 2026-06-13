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

// ─── Types ──────────────────────────────────────────────────

export interface StoreGeneratorInput {
  storeId: string;
  storeName: string;
  businessType: string;
  description?: string;
  country?: string;
  currency?: string;
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
      model: "gemini-1.5-pro",
      fallbackModels: ["gemini-1.5-flash"],
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING],
    });
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({
      provider: "groq",
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      capabilities: [AICapability.CHAT],
    });
  }
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
      priorityOrder: ["openai", "anthropic", "google", "groq", "deepseek"],
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
  const currency = input.currency || "NGN";
  const country = input.country || "Nigeria";

  return `You are a professional ecommerce website content writer for African businesses.

Generate complete website content for this store:
- Store name: "${input.storeName}"
- Business type: ${input.businessType}
- Description: ${input.description || "Not provided"}
- Country: ${country}
- Currency: ${currency}

Generate content for these 5 pages as a JSON object. Be specific to this business — no generic placeholder text. Write like a real brand, warm and professional. Tailor to the African market (mention local delivery, local payment methods like bank transfer/Paystack, WhatsApp ordering, etc where relevant).

Return ONLY valid JSON with this exact structure:
{
  "brand": {
    "tagline": "short catchy tagline for the hero",
    "heroHeading": "compelling hero headline (max 10 words)",
    "heroSubheading": "1-2 sentence value proposition",
    "ctaText": "call to action button text (2-4 words)"
  },
  "about": {
    "headline": "about page headline",
    "story": "2-3 paragraph brand story (use \\n\\n between paragraphs)",
    "values": [
      {"title": "value 1 name", "desc": "1 sentence description"},
      {"title": "value 2 name", "desc": "1 sentence description"},
      {"title": "value 3 name", "desc": "1 sentence description"}
    ]
  },
  "faq": {
    "items": [
      {"question": "question 1", "answer": "detailed answer"},
      {"question": "question 2", "answer": "detailed answer"},
      {"question": "question 3", "answer": "detailed answer"},
      {"question": "question 4", "answer": "detailed answer"},
      {"question": "question 5", "answer": "detailed answer"},
      {"question": "question 6", "answer": "detailed answer"}
    ]
  },
  "policies": {
    "shipping": "2-3 paragraph shipping policy",
    "returns": "2-3 paragraph return/refund policy",
    "privacy": "2-3 paragraph privacy policy summary"
  },
  "contact": {
    "headline": "contact page headline",
    "subtitle": "1 sentence encouraging contact"
  },
  "seo": {
    "homeTitle": "SEO title for home page (50-60 chars)",
    "homeDesc": "SEO meta description for home (150-160 chars)",
    "aboutTitle": "SEO title for about page",
    "aboutDesc": "SEO meta description for about",
    "faqTitle": "SEO title for FAQ page",
    "faqDesc": "SEO meta description for FAQ",
    "contactTitle": "SEO title for contact page",
    "contactDesc": "SEO meta description for contact"
  },
  "testimonials": [
    {"name": "customer name", "text": "realistic testimonial quote", "role": "e.g. Verified Buyer"},
    {"name": "customer name", "text": "realistic testimonial quote", "role": "e.g. Repeat Customer"},
    {"name": "customer name", "text": "realistic testimonial quote", "role": "e.g. First-time Buyer"}
  ],
  "features": [
    {"title": "feature/benefit 1", "desc": "short description"},
    {"title": "feature/benefit 2", "desc": "short description"},
    {"title": "feature/benefit 3", "desc": "short description"}
  ]
}

Rules:
- Use real-sounding Nigerian/African names for testimonials
- Make FAQ answers specific to ${input.businessType} businesses
- Shipping policy should mention Lagos, Abuja, and nationwide delivery
- Payment section should reference bank transfer, card payment, and pay-on-delivery
- Keep tone warm, confident, and trustworthy
- NO placeholder brackets like [Your Name] — write real content
- Return ONLY the JSON, no markdown fences, no explanation`;
}

// ─── Parse AI response ──────────────────────────────────────

function parseAIResponse(content: string): Record<string, any> {
  // Strip markdown code fences if present
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

// ─── Build pages from AI content ────────────────────────────

function buildHomePage(data: Record<string, any>, storeName: string): GeneratedPage {
  const brand = data.brand || {};
  const features = data.features || [];
  const testimonials = data.testimonials || [];

  const blocks: BuilderBlock[] = [
    // Hero
    block("hero", {
      heading: brand.heroHeading || `Welcome to ${storeName}`,
      subheading: brand.heroSubheading || brand.tagline || "Discover amazing products",
      buttonText: brand.ctaText || "Shop Now",
      buttonHref: "#products",
      bgColor: "#1B2B4B",
      textColor: "#ffffff",
      align: "center",
    }),
    block("spacer", { height: 40 }),

    // Featured products
    block("productGrid", {
      title: "Our Products",
      columns: 3,
      limit: 6,
      showPrice: true,
      category: "",
    }),
    block("spacer", { height: 40 }),

    // Features / Why choose us
    block("features", {
      title: "Why Choose Us",
      items: features.length >= 3
        ? features.slice(0, 3).map((f: any) => ({
            icon: "shield",
            title: f.title,
            desc: f.desc,
          }))
        : [
            { icon: "truck", title: "Fast Delivery", desc: "Swift delivery across Nigeria" },
            { icon: "shield", title: "Secure Payments", desc: "Pay with card, bank transfer, or on delivery" },
            { icon: "headphones", title: "24/7 Support", desc: "Reach us anytime on WhatsApp" },
          ],
    }),
    block("spacer", { height: 40 }),

    // Trust badges
    block("trustBadges", {
      items: [
        { icon: "shield", label: "Secure Checkout" },
        { icon: "truck", label: "Nationwide Delivery" },
        { icon: "refresh", label: "Easy Returns" },
        { icon: "headphones", label: "WhatsApp Support" },
      ],
    }),
    block("spacer", { height: 40 }),
  ];

  // Add testimonials
  if (testimonials.length > 0) {
    blocks.push(
      block("heading", {
        text: "What Our Customers Say",
        level: "h2",
        align: "center",
        color: "#171717",
        fontSize: "2xl",
      })
    );
    blocks.push(block("spacer", { height: 16 }));

    for (const t of testimonials.slice(0, 3)) {
      blocks.push(
        block("testimonial", {
          name: t.name,
          role: t.role || "Verified Buyer",
          text: t.text,
          rating: 5,
          avatar: "",
        })
      );
      blocks.push(block("spacer", { height: 12 }));
    }
  }

  // Final CTA
  blocks.push(block("spacer", { height: 24 }));
  blocks.push(
    block("heading", {
      text: brand.tagline || "Ready to shop?",
      level: "h2",
      align: "center",
      color: "#171717",
      fontSize: "2xl",
    })
  );
  blocks.push(
    block("button", {
      text: brand.ctaText || "Start Shopping",
      href: "#products",
      variant: "primary",
      align: "center",
      size: "lg",
    })
  );

  return {
    title: "Home",
    slug: "home",
    type: "HOME",
    blocks,
    metaTitle: data.seo?.homeTitle || `${storeName} — Official Store`,
    metaDescription: data.seo?.homeDesc || brand.heroSubheading || "",
  };
}

function buildAboutPage(data: Record<string, any>, storeName: string): GeneratedPage {
  const about = data.about || {};

  const blocks: BuilderBlock[] = [
    block("heading", {
      text: about.headline || `About ${storeName}`,
      level: "h1",
      align: "center",
      color: "#171717",
      fontSize: "3xl",
    }),
    block("spacer", { height: 20 }),
    block("text", {
      text: about.story || `${storeName} is dedicated to providing the best products and services.`,
      align: "center",
      color: "#525252",
      fontSize: "base",
    }),
    block("spacer", { height: 40 }),
  ];

  // Values
  if (about.values && about.values.length > 0) {
    blocks.push(
      block("features", {
        title: "Our Values",
        items: about.values.map((v: any) => ({
          icon: "shield",
          title: v.title,
          desc: v.desc,
        })),
      })
    );
    blocks.push(block("spacer", { height: 40 }));
  }

  // CTA
  blocks.push(
    block("heading", {
      text: "Ready to experience the difference?",
      level: "h3",
      align: "center",
      color: "#171717",
      fontSize: "2xl",
    })
  );
  blocks.push(
    block("button", {
      text: "Browse Products",
      href: "/",
      variant: "primary",
      align: "center",
      size: "lg",
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

function buildFAQPage(data: Record<string, any>, storeName: string): GeneratedPage {
  const faq = data.faq || {};

  const blocks: BuilderBlock[] = [
    block("heading", {
      text: "Frequently Asked Questions",
      level: "h1",
      align: "center",
      color: "#171717",
      fontSize: "3xl",
    }),
    block("spacer", { height: 8 }),
    block("text", {
      text: "Got questions? We've got answers. If you don't find what you're looking for, reach out to us directly.",
      align: "center",
      color: "#525252",
      fontSize: "base",
    }),
    block("spacer", { height: 24 }),
    block("faq", {
      title: "",
      items: (faq.items || []).slice(0, 8).map((item: any) => ({
        question: item.question,
        answer: item.answer,
      })),
    }),
    block("spacer", { height: 32 }),
    block("divider", { color: "#e5e5e5", thickness: 1, style: "solid" }),
    block("spacer", { height: 24 }),
    block("heading", {
      text: "Still have questions?",
      level: "h3",
      align: "center",
      color: "#171717",
      fontSize: "2xl",
    }),
    block("contactForm", {
      title: "Send Us a Message",
      subtitle: "We'll respond within 24 hours",
      fields: ["name", "email", "message"],
      buttonText: "Send Message",
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
    block("heading", {
      text: contact.headline || "Get in Touch",
      level: "h1",
      align: "center",
      color: "#171717",
      fontSize: "3xl",
    }),
    block("spacer", { height: 8 }),
    block("text", {
      text: contact.subtitle || "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      align: "center",
      color: "#525252",
      fontSize: "base",
    }),
    block("spacer", { height: 32 }),
    block("contactForm", {
      title: "",
      subtitle: "",
      fields: ["name", "email", "phone", "message"],
      buttonText: "Send Message",
    }),
    block("spacer", { height: 40 }),
    block("features", {
      title: "Other Ways to Reach Us",
      items: [
        { icon: "headphones", title: "WhatsApp", desc: "Message us anytime for quick responses" },
        { icon: "mail", title: "Email", desc: "Send us a detailed message" },
        { icon: "phone", title: "Phone", desc: "Call us during business hours" },
      ],
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
      text: policies.shipping || "We deliver nationwide. Orders within Lagos are delivered in 1-2 business days. Other states take 3-5 business days.",
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

  // 1. Call AI to generate content
  const prompt = buildGenerationPrompt(input);

  const result = await ai.chat({
    capability: AICapability.CHAT,
    messages: [
      { role: "system" as const, content: "You are a professional ecommerce content generator. Return ONLY valid JSON. No markdown, no explanation." },
      { role: "user" as const, content: prompt },
    ],
    maxTokens: 4000,
    temperature: 0.7,
  });

  if (!result.success || !result.data) {
    const errors = result.failedProviders?.map((f) => `${f.provider}: ${f.error}`).join("; ") || "Unknown error";
    throw new Error(`AI generation failed: ${errors}`);
  }

  // 2. Parse the AI response
  let data: Record<string, any>;
  try {
    data = parseAIResponse(result.data.content);
  } catch (parseErr) {
    console.error("AI response parse error:", result.data.content.slice(0, 500));
    throw new Error("AI returned invalid content. Please try again.");
  }

  // 3. Build pages from the generated content
  const pages: GeneratedPage[] = [
    buildHomePage(data, input.storeName),
    buildAboutPage(data, input.storeName),
    buildFAQPage(data, input.storeName),
    buildContactPage(data, input.storeName),
    buildPoliciesPage(data, input.storeName),
  ];

  // 4. Delete any existing auto-generated pages for this store (fresh start)
  await prisma.page.deleteMany({
    where: {
      storeId: input.storeId,
      type: { in: ["HOME", "ABOUT", "FAQ", "CONTACT", "POLICY"] },
    },
  });

  // 5. Persist all pages to the database
  const createdPages = await Promise.all(
    pages.map((page, i) =>
      prisma.page.create({
        data: {
          storeId: input.storeId,
          title: page.title,
          slug: page.slug,
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
    provider: result.data.provider,
    model: result.data.model,
  };
}
