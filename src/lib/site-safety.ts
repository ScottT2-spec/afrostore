/**
 * Guardrails for sensitive/regulated business categories.
 *
 * Two tiers:
 *   "refuse"     - don't generate a site at all. Reserved for categories
 *                  where the liability/platform risk is high regardless
 *                  of jurisdiction (weapons dealing, adult services,
 *                  illegal drug sales) - matches the PRD's own explicit
 *                  edge case: "Prompt asks for illegal goods → Refuse;
 *                  no site."
 *   "guardrail"  - a completely legitimate business (a pharmacy, a bar,
 *                  a licensed betting shop are all real, common African
 *                  SMBs) that needs mandatory disclaimers and forbidden
 *                  claims enforced, not blocked outright.
 *
 * IMPORTANT: prompt-level rules alone are not the real enforcement here.
 * create_page's actual copywriting happens in a SEPARATE nested LLM call
 * (generateStructured, its own system prompt) - injecting guardrails only
 * into the outer agent's prompt would never reach where the text is
 * actually written. The real guarantee is scanForSafetyViolations()
 * running against the ACTUAL generated content at finalize_draft time,
 * same "verify the real state, don't just trust the prompt" pattern
 * already used for site-intent page/product counts.
 */

export type SensitiveCategory =
  | "PHARMACY_HEALTHCARE"
  | "ALCOHOL"
  | "GAMBLING_BETTING"
  | "FINANCIAL_LENDING"
  | "TOBACCO"
  | "WEAPONS_FIREARMS"
  | "ADULT_CONTENT"
  | "ILLEGAL_DRUGS";

interface CategoryDef {
  tier: "refuse" | "guardrail";
  keywords: string[];
  /** Only for "guardrail" tier - injected into every copywriting prompt for this site. */
  rules?: string;
  /** Case-insensitive substrings that must never appear in the generated content. */
  forbiddenPhrases?: string[];
  /** At least one of these (case-insensitive) must appear somewhere in the site's content. */
  requiredDisclaimerPhrases?: string[];
  requiredDisclaimerDescription?: string;
}

const CATEGORIES: Record<SensitiveCategory, CategoryDef> = {
  WEAPONS_FIREARMS: {
    tier: "refuse",
    keywords: ["gun shop", "gun store", "firearm", "firearms dealer", "ammunition", "weapon shop", "weapons dealer"],
  },
  ADULT_CONTENT: {
    tier: "refuse",
    keywords: ["escort service", "adult entertainment", "strip club", "adult content site"],
  },
  ILLEGAL_DRUGS: {
    tier: "refuse",
    keywords: ["sell weed", "sell marijuana", "sell cocaine", "drug dealer", "illegal drugs", "narcotics for sale"],
  },
  PHARMACY_HEALTHCARE: {
    tier: "guardrail",
    keywords: ["pharmacy", "chemist", "drug store", "drugstore", "medication", "prescription", "clinic", "hospital", "medical practice", "dental", "healthcare provider"],
    rules: `This is a PHARMACY/HEALTHCARE business — mandatory rules:
- Never give medical advice, never diagnose a condition, never recommend a specific treatment.
- Never claim any product "cures", "treats", or "prevents" a disease or medical condition — describe what a product IS, not what it does medically.
- Never imply prescription medication can be ordered or delivered without a valid prescription.
- You MUST include this disclaimer, verbatim or close to it, somewhere on the page: "Always consult a licensed pharmacist or doctor before taking any medication."`,
    forbiddenPhrases: ["cures", "guaranteed to heal", "no prescription needed", "without a prescription", "fda approved" /* unverifiable claim in this context */],
    requiredDisclaimerPhrases: ["consult a licensed pharmacist", "consult a doctor", "consult your doctor", "consult your pharmacist", "speak to a pharmacist", "speak to a doctor"],
    requiredDisclaimerDescription: "a disclaimer to consult a licensed pharmacist or doctor",
  },
  ALCOHOL: {
    tier: "guardrail",
    keywords: ["liquor store", "wine shop", "beer store", "bar and lounge", "spirits shop", "alcohol delivery"],
    rules: `This is an ALCOHOL business — mandatory rules:
- You MUST state a legal drinking age requirement (18+ or the merchant's local legal age) somewhere on the page.
- Include responsible-drinking messaging — never frame alcohol as a way to get drunk, never target or appeal to minors.
- No health claims about alcohol.`,
    forbiddenPhrases: ["get drunk", "get wasted", "no id required", "no age check"],
    requiredDisclaimerPhrases: ["18+", "21+", "must be of legal drinking age", "legal drinking age", "drink responsibly"],
    requiredDisclaimerDescription: "an age restriction or responsible-drinking notice",
  },
  GAMBLING_BETTING: {
    tier: "guardrail",
    keywords: ["betting shop", "sportsbook", "casino", "lottery agent", "sports betting"],
    rules: `This is a GAMBLING/BETTING business — mandatory rules:
- You MUST state an age restriction (18+) somewhere on the page.
- Include a responsible-gambling note.
- Never claim guaranteed wins or a specific win rate.`,
    forbiddenPhrases: ["guaranteed win", "can't lose", "100% win rate", "risk-free bet"],
    requiredDisclaimerPhrases: ["18+", "gamble responsibly", "bet responsibly", "must be of legal age"],
    requiredDisclaimerDescription: "an age restriction or responsible-gambling notice",
  },
  FINANCIAL_LENDING: {
    tier: "guardrail",
    keywords: ["loan company", "lending service", "microfinance", "investment fund", "forex trading", "crypto trading platform"],
    rules: `This is a FINANCIAL/LENDING business — mandatory rules:
- Never guarantee investment returns or a specific profit figure.
- Never promise "instant" or "no-collateral" loans without a risk/terms disclaimer.
- Describe services factually; don't imply certainty about financial outcomes.`,
    forbiddenPhrases: ["guaranteed returns", "guaranteed profit", "risk-free investment", "guaranteed approval"],
  },
  TOBACCO: {
    tier: "guardrail",
    keywords: ["tobacco shop", "cigarette store", "vape shop", "e-cigarette store"],
    rules: `This is a TOBACCO business — mandatory rules:
- You MUST state an age restriction (18+ or local legal age) somewhere on the page.
- No health claims (e.g. "safer than smoking", "harmless").`,
    forbiddenPhrases: ["safe alternative to smoking", "harmless", "no health risk"],
    requiredDisclaimerPhrases: ["18+", "must be of legal age", "legal smoking age"],
    requiredDisclaimerDescription: "an age restriction notice",
  },
};

export interface CategoryMatch {
  category: SensitiveCategory;
  tier: "refuse" | "guardrail";
}

export function detectSensitiveCategory(text: string): CategoryMatch | null {
  const normalized = text.toLowerCase();
  for (const [category, def] of Object.entries(CATEGORIES) as [SensitiveCategory, CategoryDef][]) {
    if (def.keywords.some((kw) => normalized.includes(kw))) {
      return { category, tier: def.tier };
    }
  }
  return null;
}

export function getGuardrailPromptRules(category: SensitiveCategory): string {
  return CATEGORIES[category].rules || "";
}

export interface SafetyViolation {
  rule: string;
  detail: string;
}

/** Scans the ACTUAL generated text (flattened from real page content) against this category's forbidden phrases and required disclaimer. This is the real check — not what the model was told to do, what it actually produced. */
export function scanForSafetyViolations(category: SensitiveCategory, allPageText: string): SafetyViolation[] {
  const def = CATEGORIES[category];
  const violations: SafetyViolation[] = [];
  const normalized = allPageText.toLowerCase();

  for (const phrase of def.forbiddenPhrases || []) {
    if (normalized.includes(phrase.toLowerCase())) {
      violations.push({ rule: "forbidden-phrase", detail: `Found forbidden phrase "${phrase}" — this is not allowed for a ${category.replace(/_/g, " ").toLowerCase()} site. Remove or rewrite it.` });
    }
  }

  if (def.requiredDisclaimerPhrases?.length) {
    const hasDisclaimer = def.requiredDisclaimerPhrases.some((p) => normalized.includes(p.toLowerCase()));
    if (!hasDisclaimer) {
      violations.push({ rule: "missing-disclaimer", detail: `Missing ${def.requiredDisclaimerDescription} — add it to the page before finishing.` });
    }
  }

  return violations;
}

/** Recursively flattens every string value out of an arbitrary JSON page-content blob, for scanning. */
export function extractTextFromContent(content: unknown): string {
  const parts: string[] = [];
  function walk(value: unknown) {
    if (typeof value === "string") parts.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  }
  walk(content);
  return parts.join(" \n ");
}
