/**
 * Deterministic design tokens for AI-generated storefronts.
 *
 * Why this isn't an LLM call: asking a model to "pick a nice color scheme"
 * gets a different, unpredictable answer every single generation - even
 * for the same business type, even for the same merchant regenerating
 * their site. That's the core "doesn't look like a real product"
 * complaint. A fixed, curated set of professionally-paired palettes and
 * font pairings, selected deterministically from the business type (and
 * seeded by siteId so the SAME site always gets the SAME identity even
 * across regenerations) fixes that at the root instead of hoping the
 * model's taste is good and consistent, which it isn't.
 *
 * The coding agent's system prompt tells it these tokens are fixed CSS
 * variables (see toCssVariables()) it must use instead of inventing its
 * own hex codes or arbitrary Tailwind color classes - same "fixed
 * contract, don't reinvent" philosophy as scaffold.ts's routing/layout
 * conventions.
 */

export interface DesignTokens {
  themeName: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    /** Google Fonts URL to load both families in one request. */
    googleFontsUrl: string;
    body: string;
  };
  radius: string;
}

interface Theme {
  name: string;
  colors: DesignTokens["colors"];
  fonts: { heading: string; body: string; googleFontsParam: string };
  radius: string;
}

// Each theme is a complete, professionally-coherent pairing - not
// individually-chosen colors/fonts that happen to be assembled together.
// Curated rather than generated so quality is fixed at authoring time.
const THEMES: Theme[] = [
  {
    name: "warm-artisan",
    colors: { primary: "#B45309", primaryForeground: "#FFFBEB", secondary: "#78350F", accent: "#DC7633", background: "#FFFBF5", foreground: "#292524", muted: "#F5EDE4", border: "#E7D9C7" },
    fonts: { heading: "Fraunces", body: "Inter", googleFontsParam: "Fraunces:wght@600;700&family=Inter:wght@400;500;600" },
    radius: "0.75rem",
  },
  {
    name: "modern-minimal",
    colors: { primary: "#18181B", primaryForeground: "#FAFAFA", secondary: "#3F3F46", accent: "#2563EB", background: "#FFFFFF", foreground: "#18181B", muted: "#F4F4F5", border: "#E4E4E7" },
    fonts: { heading: "Manrope", body: "Inter", googleFontsParam: "Manrope:wght@600;700;800&family=Inter:wght@400;500;600" },
    radius: "0.5rem",
  },
  {
    name: "bold-vibrant",
    colors: { primary: "#7C3AED", primaryForeground: "#FAF5FF", secondary: "#DB2777", accent: "#F59E0B", background: "#FFFFFF", foreground: "#1E1B2E", muted: "#F5F3FF", border: "#E9E3FB" },
    fonts: { heading: "Space Grotesk", body: "Inter", googleFontsParam: "Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600" },
    radius: "1rem",
  },
  {
    name: "natural-organic",
    colors: { primary: "#166534", primaryForeground: "#F0FDF4", secondary: "#3F6212", accent: "#CA8A04", background: "#FEFEFB", foreground: "#1C2B1E", muted: "#F1F5EE", border: "#DDE6D6" },
    fonts: { heading: "Fraunces", body: "Source Sans 3", googleFontsParam: "Fraunces:wght@600;700&family=Source+Sans+3:wght@400;500;600" },
    radius: "0.75rem",
  },
  {
    name: "corporate-trust",
    colors: { primary: "#1D4ED8", primaryForeground: "#EFF6FF", secondary: "#0F172A", accent: "#0891B2", background: "#FFFFFF", foreground: "#0F172A", muted: "#F1F5F9", border: "#E2E8F0" },
    fonts: { heading: "Sora", body: "Inter", googleFontsParam: "Sora:wght@600;700&family=Inter:wght@400;500;600" },
    radius: "0.5rem",
  },
  {
    name: "elegant-luxury",
    colors: { primary: "#171412", primaryForeground: "#F5F0E8", secondary: "#57534E", accent: "#B08D57", background: "#FDFBF7", foreground: "#171412", muted: "#F0EBE1", border: "#E5DDCB" },
    fonts: { heading: "Cormorant Garamond", body: "Jost", googleFontsParam: "Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500" },
    radius: "0.25rem",
  },
  {
    name: "playful-fresh",
    colors: { primary: "#EA580C", primaryForeground: "#FFF7ED", secondary: "#0D9488", accent: "#FACC15", background: "#FFFFFF", foreground: "#292524", muted: "#FFF7ED", border: "#FED7AA" },
    fonts: { heading: "Baloo 2", body: "Nunito Sans", googleFontsParam: "Baloo+2:wght@600;700&family=Nunito+Sans:wght@400;600" },
    radius: "1.25rem",
  },
];

// Business types map to a small set of theme candidates - the mapping is
// the taste decision (a bakery choosing between warm-artisan / playful /
// natural is always going to look right; letting a bakery land on
// corporate-trust would not), but which candidate an individual site gets
// is seeded, not fixed, so a category with several plausible fits doesn't
// make every site in that category look identical to every other one.
const CATEGORY_THEMES: Record<string, string[]> = {
  bakery: ["warm-artisan", "playful-fresh", "natural-organic"],
  restaurant: ["warm-artisan", "elegant-luxury", "bold-vibrant"],
  cafe: ["warm-artisan", "natural-organic", "playful-fresh"],
  fashion: ["elegant-luxury", "bold-vibrant", "modern-minimal"],
  jewelry: ["elegant-luxury", "modern-minimal"],
  beauty: ["elegant-luxury", "bold-vibrant", "playful-fresh"],
  fitness: ["bold-vibrant", "modern-minimal"],
  wellness: ["natural-organic", "elegant-luxury"],
  consulting: ["corporate-trust", "modern-minimal"],
  agency: ["modern-minimal", "bold-vibrant", "corporate-trust"],
  saas: ["modern-minimal", "corporate-trust"],
  tech: ["modern-minimal", "corporate-trust", "bold-vibrant"],
  law: ["corporate-trust", "elegant-luxury"],
  finance: ["corporate-trust", "modern-minimal"],
  handmade: ["warm-artisan", "natural-organic", "playful-fresh"],
  kids: ["playful-fresh", "bold-vibrant"],
  general: ["modern-minimal", "warm-artisan", "corporate-trust"],
};

/** Simple deterministic string hash - no crypto needed, just needs to be stable and well-distributed. */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function matchCategory(businessType: string): string[] {
  const normalized = businessType.toLowerCase();
  for (const [category, themeNames] of Object.entries(CATEGORY_THEMES)) {
    if (normalized.includes(category)) return themeNames;
  }
  return CATEGORY_THEMES.general;
}

/**
 * Picks a theme deterministically from businessType + seed (use the
 * siteId) - same site always gets the same identity, different sites in
 * the same category still get visual variety instead of every bakery
 * looking identical.
 */
export function getDesignTokens(businessType: string, seed: string): DesignTokens {
  const candidates = matchCategory(businessType);
  const theme = THEMES.find((t) => t.name === candidates[hashString(seed) % candidates.length])!;
  return {
    themeName: theme.name,
    colors: theme.colors,
    fonts: {
      heading: theme.fonts.heading,
      body: theme.fonts.body,
      googleFontsUrl: `https://fonts.googleapis.com/css2?family=${theme.fonts.googleFontsParam}&display=swap`,
    },
    radius: theme.radius,
  };
}

/** Renders tokens as CSS custom properties for the scaffold's global stylesheet. */
export function tokensToCssVariables(tokens: DesignTokens): string {
  const c = tokens.colors;
  return `:root {
  --color-primary: ${c.primary};
  --color-primary-foreground: ${c.primaryForeground};
  --color-secondary: ${c.secondary};
  --color-accent: ${c.accent};
  --color-background: ${c.background};
  --color-foreground: ${c.foreground};
  --color-muted: ${c.muted};
  --color-border: ${c.border};
  --font-heading: "${tokens.fonts.heading}", serif;
  --font-body: "${tokens.fonts.body}", sans-serif;
  --radius: ${tokens.radius};
}`;
}

/** Tailwind config extension so `bg-primary`, `text-foreground`, `font-heading` etc. resolve to the tokens above instead of the model inventing raw hex classes. */
export function tokensToTailwindExtend(): string {
  return `{
      colors: {
        primary: { DEFAULT: "var(--color-primary)", foreground: "var(--color-primary-foreground)" },
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
    }`;
}
