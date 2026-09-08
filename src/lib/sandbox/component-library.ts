/**
 * A small, curated library of pre-built section components, seeded into
 * every generated project alongside the fixed scaffold.
 *
 * Same reasoning as scaffold.ts's fixed routing/layout contract, applied
 * one level deeper: an unconstrained model asked for "a hero section"
 * invents different markup, spacing, and responsive behavior every time -
 * some of it broken, none of it consistent. These components are
 * hand-written once, use the design tokens (bg-primary, font-heading,
 * etc.) instead of arbitrary hex/spacing choices, and are the *first*
 * thing the coding agent's system prompt tells it to reach for. It can
 * still write custom components for anything these don't cover - this is
 * a starting vocabulary, not a hard restriction - but for the common 80%
 * (hero, feature grid, testimonial, CTA, FAQ) every generated site now
 * shares a proven-good structural and responsive baseline instead of
 * reinventing (and often breaking) it from zero.
 */

const heroTsx = `interface HeroProps {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaHref?: string;
  imageUrl?: string;
}

export default function Hero({ heading, subheading, ctaText, ctaHref = "#", imageUrl }: HeroProps) {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 md:grid-cols-2">
        <div>
          <h1 className="font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">{heading}</h1>
          <p className="mt-4 text-lg text-foreground/70">{subheading}</p>
          <a
            href={ctaHref}
            className="mt-8 inline-block rounded bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {ctaText}
          </a>
        </div>
        {imageUrl && (
          <div className="overflow-hidden rounded">
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}
`;

const featureGridTsx = `interface Feature {
  title: string;
  description: string;
}

interface FeatureGridProps {
  heading?: string;
  features: Feature[];
}

// 2-4 items looks right at every viewport; a 5th+ item still renders but
// visually crowds on mobile - the model is told to keep this to 3-4.
export default function FeatureGrid({ heading, features }: FeatureGridProps) {
  return (
    <section className="bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {heading && <h2 className="font-heading text-center text-3xl font-bold text-foreground">{heading}</h2>}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="rounded border border-border bg-background p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-foreground/70">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

const testimonialTsx = `interface Testimonial {
  quote: string;
  name: string;
  role?: string;
}

interface TestimonialsProps {
  heading?: string;
  testimonials: Testimonial[];
}

export default function Testimonials({ heading, testimonials }: TestimonialsProps) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {heading && <h2 className="font-heading text-center text-3xl font-bold text-foreground">{heading}</h2>}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure key={i} className="rounded border border-border p-6">
              <blockquote className="text-foreground/80">"{t.quote}"</blockquote>
              <figcaption className="mt-4 font-medium text-foreground">
                {t.name}
                {t.role && <span className="font-normal text-foreground/60"> — {t.role}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

const ctaSectionTsx = `interface CtaSectionProps {
  heading: string;
  subheading?: string;
  ctaText: string;
  ctaHref?: string;
}

export default function CtaSection({ heading, subheading, ctaText, ctaHref = "#" }: CtaSectionProps) {
  return (
    <section className="bg-primary">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-heading text-3xl font-bold text-primary-foreground">{heading}</h2>
        {subheading && <p className="mt-3 text-primary-foreground/80">{subheading}</p>}
        <a
          href={ctaHref}
          className="mt-8 inline-block rounded bg-primary-foreground px-6 py-3 font-medium text-primary transition-opacity hover:opacity-90"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
`;

const faqAccordionTsx = `import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  heading?: string;
  items: FaqItem[];
}

export default function FaqAccordion({ heading, items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16">
        {heading && <h2 className="font-heading text-center text-3xl font-bold text-foreground">{heading}</h2>}
        <div className="mt-10 divide-y divide-border">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="py-4">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between text-left font-medium text-foreground"
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <span className="ml-4 flex-shrink-0 text-foreground/50">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p className="mt-2 text-foreground/70">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;

/**
 * Returns the component vocabulary as files layered on top of the fixed
 * scaffold. Combine with getStandardScaffold() when creating a sandbox.
 */
export function getComponentLibrary(): Record<string, string> {
  return {
    "src/components/sections/Hero.tsx": heroTsx,
    "src/components/sections/FeatureGrid.tsx": featureGridTsx,
    "src/components/sections/Testimonials.tsx": testimonialTsx,
    "src/components/sections/CtaSection.tsx": ctaSectionTsx,
    "src/components/sections/FaqAccordion.tsx": faqAccordionTsx,
  };
}

export const COMPONENT_LIBRARY_DESCRIPTIONS = `- Hero (src/components/sections/Hero.tsx): props heading, subheading, ctaText, ctaHref?, imageUrl?
- FeatureGrid (src/components/sections/FeatureGrid.tsx): props heading?, features: {title, description}[] - keep to 3-4 features
- Testimonials (src/components/sections/Testimonials.tsx): props heading?, testimonials: {quote, name, role?}[]
- CtaSection (src/components/sections/CtaSection.tsx): props heading, subheading?, ctaText, ctaHref?
- FaqAccordion (src/components/sections/FaqAccordion.tsx): props heading?, items: {question, answer}[]`;
