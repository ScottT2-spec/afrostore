import type { ThemePackageDefinition } from "@/lib/templates/types";

export function getAegisPackageDefinition(): ThemePackageDefinition {
  return {
    slug: "aegis",
    name: "Aegis",
    manifest: {
      category: "landing",
      industry: "Healthcare",
      siteType: "LANDING_PAGE",
      version: "1.0.0",
      tags: ["healthcare", "advocacy", "wellness", "community"],
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
      homeTitle: "Aegis Health | Living Beyond, Living Well",
      homeDescription: "A healthcare landing page template centered on compassionate care, advocacy, and community support.",
      defaultTitle: "Aegis Health",
      defaultDescription: "Imported Aegis landing page package rooted in the live reference.",
    },
    navigation: [
      { label: "Home", href: "/" },
      { label: "Our Mission", href: "/about" },
      { label: "Programs", href: "/services" },
      { label: "Get Tested", href: "/contact" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: "Resources", links: [{ label: "Our Mission", href: "/about" }, { label: "Get Tested", href: "/contact" }, { label: "Programs", href: "/services" }] },
        { heading: "Quick Links", links: [{ label: "Impact", href: "/about" }, { label: "Patient Education", href: "/about" }, { label: "Contact Us", href: "/contact" }] },
        { heading: "Connect", links: [{ label: "Support", href: "/contact" }, { label: "Newsletter", href: "/contact" }, { label: "Privacy", href: "/policy" }] },
      ],
      copyright: "© 2024 AEGIS HEALTH. Compassionate care for every journey.",
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
          badge: "Aegis Health",
          heading: "Living Beyond, Living Well.",
          subheading: "We empower lives through innovative HIV/AIDS care, advocacy, and community support. Together, we build a future defined by health, not diagnosis.",
          buttonText: "Get Tested Today",
          buttonHref: "/contact",
          secondaryButtonText: "View Care Programs",
          secondaryButtonHref: "/services",
          bgStyle: "dark",
          bgImage: "/templates/jewellery/prefooter/about-us.webp",
        },
      },
      {
        id: "aegis-stats",
        type: "stats",
        props: {
          title: "Our Impact",
          items: [{ value: "15k+", label: "Tests Provided" }, { value: "200+", label: "Clinics Supported" }, { value: "98%", label: "Satisfaction" }, { value: "24/7", label: "Support" }],
        },
      },
      {
        id: "aegis-services",
        type: "features",
        props: {
          title: "Innovative Care, Personalized Journeys",
          subtitle: "Healthcare is never one-size-fits-all. We combine cutting-edge biomedical research with a deeply human touch to ensure every individual thrives.",
          items: [
            { icon: "heart", title: "Advanced Screening", description: "Rapid, confidential testing using the latest generation diagnostic technology for immediate peace of mind." },
            { icon: "users", title: "Peer Support", description: "Connecting you with a community that understands the journey, fostering resilience through shared experience." },
            { icon: "shield", title: "Advocacy", description: "Fighting for policy changes and removing the stigma surrounding HIV/AIDS at local and national levels." },
            { icon: "globe", title: "ART Access", description: "Ensuring uninterrupted access to life-saving Antiretroviral Therapy for all community members." },
          ],
        },
      },
      {
        id: "aegis-testimonials",
        type: "testimonials",
        props: {
          title: "Stories of Resilience",
          bgColor: "surface",
          items: [
            { quote: "The team at Aegis didn't just give me medicine; they gave me my dignity back. They saw the person, not the patient.", name: "Elena Rodriguez", role: "Community Member since 2018" },
          ],
        },
      },
      {
        id: "aegis-cta",
        type: "banner",
        props: {
          title: "Take the first step towards clarity.",
          subtitle: "Confidential, free, and compassionate testing is available at all our partner clinics. No appointment necessary for initial screening.",
          buttonText: "Find a Clinic Near You",
          buttonHref: "/contact",
        },
      },
    ],
    media: [
      { name: "hero", url: "/templates/jewellery/prefooter/about-us.webp", type: "IMAGE", alt: "Aegis hero" },
      { name: "preview", url: "/templates/jewellery/prefooter/showrooms.webp", type: "IMAGE", alt: "Aegis preview" },
      { name: "banner", url: "/templates/jewellery/prefooter/showrooms.webp", type: "IMAGE", alt: "Aegis banner" },
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
              badge: "Aegis Health",
              heading: "Living Beyond, Living Well.",
              subheading: "We empower lives through innovative HIV/AIDS care, advocacy, and community support. Together, we build a future defined by health, not diagnosis.",
              buttonText: "Get Tested Today",
              buttonHref: "/contact",
              secondaryButtonText: "View Care Programs",
              secondaryButtonHref: "/services",
              bgStyle: "dark",
              bgImage: "/templates/jewellery/prefooter/about-us.webp",
            },
          },
          {
            id: "aegis-stats",
            type: "stats",
            props: {
              title: "Our Impact",
              items: [{ value: "15k+", label: "Tests Provided" }, { value: "200+", label: "Clinics Supported" }, { value: "98%", label: "Satisfaction" }, { value: "24/7", label: "Support" }],
            },
          },
          {
            id: "aegis-services",
            type: "features",
            props: {
              title: "Innovative Care, Personalized Journeys",
              subtitle: "Healthcare is never one-size-fits-all. We combine cutting-edge biomedical research with a deeply human touch to ensure every individual thrives.",
              items: [
                { icon: "heart", title: "Advanced Screening", description: "Rapid, confidential testing using the latest generation diagnostic technology for immediate peace of mind." },
                { icon: "users", title: "Peer Support", description: "Connecting you with a community that understands the journey, fostering resilience through shared experience." },
                { icon: "shield", title: "Advocacy", description: "Fighting for policy changes and removing the stigma surrounding HIV/AIDS at local and national levels." },
                { icon: "globe", title: "ART Access", description: "Ensuring uninterrupted access to life-saving Antiretroviral Therapy for all community members." },
              ],
            },
          },
          {
            id: "aegis-testimonials",
            type: "testimonials",
            props: {
              title: "Stories of Resilience",
              bgColor: "surface",
              items: [
                { quote: "The team at Aegis didn't just give me medicine; they gave me my dignity back. They saw the person, not the patient.", name: "Elena Rodriguez", role: "Community Member since 2018" },
              ],
            },
          },
          {
            id: "aegis-cta",
            type: "banner",
            props: {
              title: "Take the first step towards clarity.",
              subtitle: "Confidential, free, and compassionate testing is available at all our partner clinics. No appointment necessary for initial screening.",
              buttonText: "Find a Clinic Near You",
              buttonHref: "/contact",
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
              title: "Our Mission",
              text: "We empower lives through innovative HIV/AIDS care, advocacy, and community support. Together, we build a future defined by health, not diagnosis.",
              imagePosition: "right",
              buttonText: "Get Tested",
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
