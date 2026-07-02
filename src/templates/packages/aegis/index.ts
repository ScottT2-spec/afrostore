import type { ThemePackageDefinition } from "@/lib/templates/types";

export function getAegisPackageDefinition(): ThemePackageDefinition {
  return {
    slug: "aegis",
    name: "Aegis",
    manifest: {
      category: "landing",
      industry: "Aegis",
      siteType: "LANDING_PAGE",
      version: "1.0.0",
      tags: ["saas", "security", "platform"],
    },
    theme: {
      homepage_layout: "landing-editorial",
      header_style: "overlay",
      footer_style: "minimal",
      product_card_style: "standard",
      colors: {
        primary: "#111827",
        secondary: "#0F172A",
        accent: "#C084FC",
        background: "#FFFFFF",
        text: "#111827",
        headerBg: "rgba(15,23,42,0.72)",
        headerText: "#FFFFFF",
        footerBg: "#0F172A",
        footerText: "#FFFFFF",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
    },
    seo: {
      homeTitle: "Aegis Template",
      homeDescription: "Imported Aegis landing template package.",
      defaultTitle: "Aegis",
      defaultDescription: "Imported Aegis landing template package.",
    },
    navigation: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Programs", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: "Aegis", links: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
        { heading: "Support", links: [{ label: "Programs", href: "/services" }, { label: "FAQ", href: "/faq" }] },
      ],
      copyright: "Aegis template package",
    },
    menus: [
      { name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Programs", href: "/services" }] },
    ],
    forms: [
      { name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] },
    ],
    homeSections: [
      {
        id: "aegis-hero",
        type: "hero",
        props: {
          badge: "Aegis",
          heading: "Trust-first advocacy and healthcare landing page",
          subheading: "A calm, polished landing page with impact stats, service cards, testimonials, and clear calls to action.",
          buttonText: "Get Started",
          buttonHref: "/contact",
          secondaryButtonText: "Learn More",
          secondaryButtonHref: "/about",
          bgStyle: "dark",
          bgImage: "/templates/jewellery/prefooter/about-us.webp",
        },
      },
      {
        id: "aegis-stats",
        type: "stats",
        props: {
          title: "Our Impact",
          items: [{ value: "50K+", label: "Lives impacted" }, { value: "200+", label: "Programs" }, { value: "98%", label: "Satisfaction" }, { value: "15", label: "Years" }],
        },
      },
      {
        id: "aegis-services",
        type: "features",
        props: {
          title: "Our Services",
          items: [{ icon: "heart", title: "Care" }, { icon: "shield", title: "Safety" }, { icon: "users", title: "Community" }, { icon: "globe", title: "Outreach" }],
        },
      },
      {
        id: "aegis-cta",
        type: "banner",
        props: {
          title: "Join the movement",
          subtitle: "Make a difference today.",
          buttonText: "Donate",
          buttonHref: "#contact",
        },
      },
    ],
    media: [
      { name: "hero", url: "/templates/jewellery/prefooter/about-us.webp", type: "IMAGE", alt: "Aegis hero" },
      { name: "preview", url: "/templates/jewellery/prefooter/showrooms.webp", type: "IMAGE", alt: "Aegis preview" },
    ],
    pages: [
      {
        title: "Home",
        slug: "home",
        type: "LANDING",
        metaTitle: "Aegis — Home",
        metaDescription: "Imported Aegis landing template.",
        blocks: [
          {
            id: "aegis-hero",
            type: "hero",
            props: {
              badge: "Aegis",
              heading: "Trust-first advocacy and healthcare landing page",
              subheading: "A calm, polished landing page with impact stats, service cards, testimonials, and clear calls to action.",
              buttonText: "Get Started",
              buttonHref: "/contact",
              secondaryButtonText: "Learn More",
              secondaryButtonHref: "/about",
              bgStyle: "dark",
              bgImage: "/templates/jewellery/prefooter/about-us.webp",
            },
          },
          {
            id: "aegis-stats",
            type: "stats",
            props: {
              title: "Our Impact",
              items: [{ value: "50K+", label: "Lives impacted" }, { value: "200+", label: "Programs" }, { value: "98%", label: "Satisfaction" }, { value: "15", label: "Years" }],
            },
          },
          {
            id: "aegis-services",
            type: "features",
            props: {
              title: "Our Services",
              items: [{ icon: "heart", title: "Care" }, { icon: "shield", title: "Safety" }, { icon: "users", title: "Community" }, { icon: "globe", title: "Outreach" }],
            },
          },
          {
            id: "aegis-cta",
            type: "banner",
            props: {
              title: "Join the movement",
              subtitle: "Make a difference today.",
              buttonText: "Donate",
              buttonHref: "#contact",
            },
          },
        ],
      },
      {
        title: "About",
        slug: "about",
        type: "ABOUT",
        metaTitle: "Aegis — About",
        metaDescription: "About the imported Aegis template.",
        blocks: [
          {
            id: "aegis-about",
            type: "imageText",
            props: {
              title: "About the mission",
              text: "A calm, polished landing page built to feel trustworthy and clear.",
              imagePosition: "right",
              buttonText: "Contact us",
              buttonHref: "/contact",
              image: "/templates/jewellery/prefooter/about-us.webp",
            },
          },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        type: "CONTACT",
        metaTitle: "Aegis — Contact",
        metaDescription: "Contact the imported Aegis template.",
        blocks: [
          {
            id: "aegis-contact",
            type: "contactForm",
            props: {
              title: "Get in touch",
              subtitle: "A simple editable contact block for the package.",
            },
          },
        ],
      },
    ],
    products: [],
    collections: [],
    blog: [{ title: "Impact Stories", slug: "impact-stories", excerpt: "Editorial content for the imported package." }],
  } as ThemePackageDefinition;
}
