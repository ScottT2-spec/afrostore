import type { BuilderBlock } from "@/components/storefront/BlockRenderer";
import type { ThemePackageCollection, ThemePackageDefinition, ThemePackageMediaAsset, ThemePackageProduct } from "../types";

type ImportedSource = {
  slug: string;
  name: string;
  category: string;
  tags: string[];
};

type PackageDesign = {
  previewImage?: string;
  homeSections: BuilderBlock[];
  pages?: Record<string, BuilderBlock[]>;
  media?: ThemePackageMediaAsset[];
  products?: ThemePackageProduct[];
  collections?: ThemePackageCollection[];
  blog?: Array<{ title: string; slug: string; excerpt?: string }>;
  navigation?: Array<{ label: string; href: string }>;
  footer?: {
    columns: Array<{ heading: string; links: Array<{ label: string; href: string }> }>;
    copyright: string;
  };
  menus?: Array<{ name: string; slug: string; items: Array<{ label: string; href: string }> }>;
  forms?: Array<{ name: string; slug: string; fields: Array<{ name: string; label: string; type: string; required?: boolean }> }>;
};

function block(id: string, type: BuilderBlock["type"], props: Record<string, unknown>): BuilderBlock {
  return { id, type, props };
}

function media(name: string, url: string, alt?: string): ThemePackageMediaAsset {
  return { name, url, alt, type: "IMAGE" };
}

function product(name: string, slug: string, price: number, image: string, extra: Partial<ThemePackageProduct> = {}): ThemePackageProduct {
  return { name, slug, price, image, ...extra };
}

function sourcePath(fileName: string) {
  return `/templates/imports/aegis/${fileName}`;
}

function pageSet(source: ImportedSource, heroTitle: string, body: string, heroImage?: string) {
  return {
    about: [
      block(`${source.slug}-about-hero`, "hero", {
        badge: "Our Mission",
        heading: heroTitle,
        subheading: body,
        buttonText: "Get Tested",
        buttonHref: "/contact",
        secondaryButtonText: "Join Us",
        secondaryButtonHref: "/contact",
        bgStyle: "light",
        bgImage: heroImage,
      }),
      block(`${source.slug}-about-story`, "imageText", {
        title: "Our Mission",
        text: body,
        imagePosition: "right",
        buttonText: "Get Tested",
        buttonHref: "/contact",
        image: heroImage,
      }),
      block(`${source.slug}-about-stats`, "stats", {
        title: "Our Impact",
        items: [
          { value: "15k+", label: "Tests Provided" },
          { value: "200+", label: "Clinics Supported" },
          { value: "98%", label: "Retention in Care" },
          { value: "Global", label: "Advocacy Impact" },
        ],
      }),
    ],
    services: [
      block(`${source.slug}-services-hero`, "hero", {
        badge: "Programs",
        heading: "Our Programs",
        subheading: "Comprehensive healthcare and support services tailored to your needs.",
        buttonText: "Get Started",
        buttonHref: "/contact",
        bgStyle: "dark",
        bgImage: heroImage,
      }),
      block(`${source.slug}-services-grid`, "features", {
        title: "Our Approach",
        subtitle: "Innovative Care, Personalized Journeys",
        items: [
          { icon: "biotech", title: "Advanced Screening", description: "Rapid, confidential testing using the latest generation diagnostic technology for immediate peace of mind." },
          { icon: "diversity_3", title: "Peer Support", description: "Connecting you with a community that understands the journey, fostering resilience through shared experience." },
          { icon: "policy", title: "Advocacy", description: "Fighting for policy changes and removing the stigma surrounding HIV/AIDS at local and national levels." },
          { icon: "medication", title: "ART Access", description: "Ensuring uninterrupted access to life-saving Antiretroviral Therapy for all community members." },
        ],
      }),
    ],
    contact: [
      block(`${source.slug}-contact-hero`, "hero", {
        badge: "Contact",
        heading: "Get in Touch",
        subheading: "We're here to help. Reach out with any questions or to schedule an appointment.",
        buttonText: "Find a Clinic Near You",
        buttonHref: "/contact",
        secondaryButtonText: "Speak with a Specialist",
        secondaryButtonHref: "/contact",
        bgStyle: "dark",
        bgImage: heroImage,
      }),
      block(`${source.slug}-contact-info`, "contactInfo", {
        title: "Contact Information",
        items: [
          { icon: "map-pin", title: "Testing Centers", value: "Find a clinic near you" },
          { icon: "phone", title: "Phone", value: "+1 (555) 123-4567" },
          { icon: "mail", title: "Email", value: "hello@aegishealth.org" },
        ],
      }),
      block(`${source.slug}-contact-form`, "contactForm", {
        title: "Send us a message",
        subtitle: "Fill out the form below and we'll get back to you within 24 hours.",
      }),
    ],
  } satisfies NonNullable<PackageDesign["pages"]>;
}

export function buildImportedAegisDesign(source: ImportedSource): PackageDesign {
  const hero = sourcePath("aegis-hero-opt.jpg");
  const feature1 = sourcePath("aegis-screening-opt.jpg");
  const feature2 = sourcePath("aegis-support-opt.jpg");
  const feature3 = sourcePath("aegis-advocacy-opt.jpg");
  const feature4 = sourcePath("aegis-art-opt.jpg");
  const testimonial = sourcePath("aegis-testimonial-opt.jpg");
  const cta = sourcePath("aegis-cta-opt.jpg");

  const pages = pageSet(
    source,
    "Living Beyond, Living Well.",
    "We empower lives through innovative HIV/AIDS care, advocacy, and community support. Together, we build a future defined by health, not diagnosis.",
    hero,
  );

  const packageDesign: PackageDesign = {
    previewImage: hero,
    homeSections: [
      block(`${source.slug}-hero`, "hero", {
        badge: "Aegis Health",
        heading: "Living Beyond,\nLiving Well.",
        subheading: "We empower lives through innovative HIV/AIDS care, advocacy, and community support. Together, we build a future defined by health, not diagnosis.",
        buttonText: "Get Tested Today",
        buttonHref: "/contact",
        secondaryButtonText: "View Care Programs",
        secondaryButtonHref: "/services",
        bgStyle: "light",
        bgImage: hero,
        layout: "center",
        textColor: "#1a1a1a",
      }),
      block(`${source.slug}-stats`, "stats", {
        title: "Our Impact",
        items: [
          { value: "15k+", label: "Tests Provided" },
          { value: "200+", label: "Clinics Supported" },
          { value: "98%", label: "Retention in Care" },
          { value: "Global", label: "Advocacy Impact" },
        ],
      }),
      block(`${source.slug}-mission`, "imageText", {
        title: "Innovative Care, Personalized Journeys",
        text: "Healthcare is never one-size-fits-all. We combine cutting-edge biomedical research with a deeply human touch to ensure every individual thrives.",
        imagePosition: "right",
        buttonText: "Explore our medical protocols",
        buttonHref: "/services",
        image: feature1,
      }),
      block(`${source.slug}-features`, "features", {
        title: "Our Approach",
        subtitle: "Innovative Care, Personalized Journeys",
        bgColor: "surface",
        items: [
          { icon: "biotech", title: "Advanced Screening", description: "Rapid, confidential testing using the latest generation diagnostic technology for immediate peace of mind." },
          { icon: "diversity_3", title: "Peer Support", description: "Connecting you with a community that understands the journey, fostering resilience through shared experience." },
          { icon: "policy", title: "Advocacy", description: "Fighting for policy changes and removing the stigma surrounding HIV/AIDS at local and national levels." },
          { icon: "medication", title: "ART Access", description: "Ensuring uninterrupted access to life-saving Antiretroviral Therapy for all community members." },
        ],
      }),
      block(`${source.slug}-testimonials`, "testimonials", {
        title: "Stories of Resilience",
        subtitle: "Community Member • Advocate Story",
        bgColor: "light",
        items: [
          {
            name: "Marcus",
            role: "12 years thriving with Aegis support",
            quote: "My diagnosis was a beginning, not an end.",
            image: testimonial,
          },
          {
            name: "Elena Rodriguez",
            role: "Community Member since 2018",
            quote: "The team at Aegis didn't just give me medicine; they gave me my dignity back. They saw the person, not the patient.",
            image: testimonial,
          },
        ],
      }),
      block(`${source.slug}-cta`, "banner", {
        title: "Take the first step towards clarity.",
        subtitle: "Confidential, free, and compassionate testing is available at all our partner clinics. No appointment necessary for initial screening.",
        buttonText: "Find a Clinic Near You",
        buttonHref: "/contact",
        secondaryButtonText: "Speak with a Specialist",
        secondaryButtonHref: "/contact",
        bgImage: cta,
        bgColor: "primary",
      }),
      block(`${source.slug}-footer-cta`, "banner", {
        title: "Aegis Health",
        subtitle: "Dedicated to a world where health is a right, and every life is celebrated.",
        bgColor: "dark",
      }),
    ],
    pages: {
      home: [],
      about: pages.about,
      services: pages.services,
      contact: pages.contact,
    },
    media: [
      media("hero", hero, "Aegis Health hero section"),
      media("screening", feature1, "Advanced screening service"),
      media("support", feature2, "Peer support group"),
      media("advocacy", feature3, "Advocacy program"),
      media("art", feature4, "ART access program"),
      media("testimonial", testimonial, "Community member testimonial"),
      media("cta", cta, "Call to action background"),
    ],
    products: [],
    collections: [],
    blog: [
      { title: "Breaking the Stigma", slug: "breaking-stigma", excerpt: "How education and advocacy are changing perceptions around HIV/AIDS care." },
      { title: "The Importance of Early Testing", slug: "early-testing", excerpt: "Why regular screening is crucial for health and prevention." },
      { title: "Community Stories", slug: "community-stories", excerpt: "Inspiring journeys of resilience and hope from our members." },
    ],
    navigation: [
      { label: "Our Mission", href: "/about" },
      { label: "Get Tested", href: "/contact" },
      { label: "Programs", href: "/services" },
      { label: "Impact", href: "/about" },
      { label: "Join Us", href: "/contact" },
      { label: "Patient Portal", href: "/contact" },
      { label: "Donate", href: "/contact" },
      { label: "Healthcare Professional", href: "/contact" },
    ],
    footer: {
      columns: [
        { 
          heading: "Resources", 
          links: [
            { label: "Testing Centers", href: "/contact" }, 
            { label: "Patient Education", href: "/about" }, 
            { label: "PrEP & PEP Info", href: "/services" }
          ] 
        },
        { 
          heading: "Quick Links", 
          links: [
            { label: "Privacy Policy", href: "/about" }, 
            { label: "Terms of Service", href: "/about" }, 
            { label: "Newsletter Signup", href: "/contact" },
            { label: "Contact Us", href: "/contact" }
          ] 
        },
        { 
          heading: "Connect", 
          links: [
            { label: "Share", href: "/contact" }, 
            { label: "Mail", href: "/contact" }
          ] 
        },
      ],
      copyright: "© 2024 Aegis Health. Free HTML Template by TemplatesJungle.com",
    },
    menus: [
      { name: "Main Menu", slug: "main-menu", items: [{ label: "Our Mission", href: "/about" }, { label: "Get Tested", href: "/contact" }, { label: "Programs", href: "/services" }, { label: "Impact", href: "/about" }, { label: "Join Us", href: "/contact" }, { label: "Patient Portal", href: "/contact" }, { label: "Donate", href: "/contact" }, { label: "Healthcare Professional", href: "/contact" }] },
      { name: "Footer Menu", slug: "footer-menu", items: [{ label: "Privacy Policy", href: "/about" }, { label: "Terms of Service", href: "/about" }, { label: "Newsletter Signup", href: "/contact" }, { label: "Contact Us", href: "/contact" }] },
    ],
    forms: [
      { name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] },
    ],
  };

  return packageDesign;
}

export const aegisSource = {
  slug: "aegis",
  name: "Aegis Health",
  category: "Landing Page",
  tags: ["health", "non-profit", "medical", "community", "hiv", "aids"],
};

const aegisDesign = buildImportedAegisDesign(aegisSource);

export const aegisImportedPackage: ThemePackageDefinition = {
  manifest: {
    category: "landing",
    industry: "Healthcare Non-Profit",
    siteType: "LANDING_PAGE",
    version: "1.0.0",
    tags: ["health", "non-profit", "medical", "community", "hiv", "aids"],
  },
  theme: {
    homepage_layout: "landing-imported",
    header_style: "overlay",
    footer_style: "editorial",
    product_card_style: "premium",
    colors: {
      primary: "#0D9488",
      secondary: "#0F766E",
      accent: "#14B8A6",
      background: "#FFFFFF",
      text: "#1F2937",
      headerBg: "#FFFFFF",
      headerText: "#1F2937",
      footerBg: "#0F172A",
      footerText: "#E5E7EB",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
  },
  seo: {
    homeTitle: "Aegis Health | Living Beyond, Living Well",
    homeDescription: "We empower lives through innovative HIV/AIDS care, advocacy, and community support. Together, we build a future defined by health, not diagnosis.",
    defaultTitle: "Aegis Health",
    defaultDescription: "Aegis Health - Innovative HIV/AIDS care, advocacy, and community support services.",
  },
  navigation: [
    { label: "Our Mission", href: "/about" },
    { label: "Get Tested", href: "/contact" },
    { label: "Programs", href: "/services" },
    { label: "Impact", href: "/about" },
    { label: "Join Us", href: "/contact" },
    { label: "Patient Portal", href: "/contact" },
    { label: "Donate", href: "/contact" },
    { label: "Healthcare Professional", href: "/contact" },
  ],
  footer: {
    columns: [
      { 
        heading: "Resources", 
        links: [
          { label: "Testing Centers", href: "/contact" }, 
          { label: "Patient Education", href: "/about" }, 
          { label: "PrEP & PEP Info", href: "/services" }
        ] 
      },
      { 
        heading: "Quick Links", 
        links: [
          { label: "Privacy Policy", href: "/about" }, 
          { label: "Terms of Service", href: "/about" }, 
          { label: "Newsletter Signup", href: "/contact" },
          { label: "Contact Us", href: "/contact" }
        ] 
      },
      { 
        heading: "Connect", 
        links: [
          { label: "Share", href: "/contact" }, 
          { label: "Mail", href: "/contact" }
        ] 
      },
    ],
    copyright: "© 2024 Aegis Health. Free HTML Template by TemplatesJungle.com",
  },
  menus: [
    { name: "Main Menu", slug: "main-menu", items: [{ label: "Our Mission", href: "/about" }, { label: "Get Tested", href: "/contact" }, { label: "Programs", href: "/services" }, { label: "Impact", href: "/about" }, { label: "Join Us", href: "/contact" }, { label: "Patient Portal", href: "/contact" }, { label: "Donate", href: "/contact" }, { label: "Healthcare Professional", href: "/contact" }] },
    { name: "Footer Menu", slug: "footer-menu", items: [{ label: "Privacy Policy", href: "/about" }, { label: "Terms of Service", href: "/about" }, { label: "Newsletter Signup", href: "/contact" }, { label: "Contact Us", href: "/contact" }] },
  ],
  forms: [
    { name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] },
  ],
  media: [
    media("hero", sourcePath("aegis-hero-opt.jpg"), "Aegis Health hero section"),
    media("screening", sourcePath("aegis-screening-opt.jpg"), "Advanced screening service"),
    media("support", sourcePath("aegis-support-opt.jpg"), "Peer support group"),
    media("advocacy", sourcePath("aegis-advocacy-opt.jpg"), "Advocacy program"),
    media("art", sourcePath("aegis-art-opt.jpg"), "ART access program"),
    media("testimonial", sourcePath("aegis-testimonial-opt.jpg"), "Community member testimonial"),
    media("cta", sourcePath("aegis-cta-opt.jpg"), "Call to action background"),
  ],
  pages: [
    {
      title: "Home",
      slug: "home",
      type: "LANDING",
      metaTitle: "Aegis Health | Living Beyond, Living Well",
      metaDescription: "We empower lives through innovative HIV/AIDS care, advocacy, and community support.",
      blocks: aegisDesign.homeSections,
    },
    {
      title: "About",
      slug: "about",
      type: "ABOUT",
      metaTitle: "Aegis Health — About Us",
      metaDescription: "Learn about Aegis Health's mission and impact in HIV/AIDS care and advocacy.",
      blocks: aegisDesign.pages?.about || [],
    },
    {
      title: "Services",
      slug: "services",
      type: "CUSTOM",
      metaTitle: "Aegis Health — Services",
      metaDescription: "Comprehensive healthcare and support services at Aegis Health.",
      blocks: aegisDesign.pages?.services || [],
    },
    {
      title: "Contact",
      slug: "contact",
      type: "CONTACT",
      metaTitle: "Aegis Health — Contact",
      metaDescription: "Get in touch with Aegis Health for testing, support, or information.",
      blocks: aegisDesign.pages?.contact || [],
    },
  ],
  products: [],
  collections: [],
  blog: [
    { title: "Breaking the Stigma", slug: "breaking-stigma", excerpt: "How education and advocacy are changing perceptions around HIV/AIDS care." },
    { title: "The Importance of Early Testing", slug: "early-testing", excerpt: "Why regular screening is crucial for health and prevention." },
    { title: "Community Stories", slug: "community-stories", excerpt: "Inspiring journeys of resilience and hope from our members." },
  ],
};
