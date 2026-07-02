import type { ThemePackageDefinition } from "@/lib/templates/types";

export function getLandingGadgetPackageDefinition(): ThemePackageDefinition {
  return {
    slug: "landing-gadget",
    name: "Landing Gadget",
    manifest: {
      category: "landing",
      industry: "Landing Gadget",
      siteType: "LANDING_PAGE",
      version: "1.0.0",
      tags: ["landing", "gadget", "pixel", "launch"],
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
      homeTitle: "Landing Gadget Template",
      homeDescription: "Imported landing gadget template package.",
      defaultTitle: "Landing Gadget",
      defaultDescription: "Imported landing gadget template package.",
    },
    navigation: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: "Support", links: [{ label: "Contact", href: "/contact" }, { label: "FAQ", href: "/faq" }] },
        { heading: "Company", links: [{ label: "About", href: "/about" }, { label: "Privacy", href: "/policy" }] },
      ],
      copyright: "Landing Gadget template package",
    },
    menus: [
      { name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "About", href: "/about" }] },
    ],
    forms: [
      { name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] },
    ],
    homeSections: [
      {
        id: "landing-gadget-hero",
        type: "hero",
        props: {
          badge: "Landing Gadget",
          heading: "Inspiration of beauty in simplicity.",
          subheading: "A premium launch page built from the live reference source and adapted into editable blocks.",
          buttonText: "Buy now",
          buttonHref: "/shop",
          secondaryButtonText: "Learn more",
          secondaryButtonHref: "/about",
          bgStyle: "light",
          bgImage: "/templates/imports/landing-gadget/landing-pixel-slider-phone-opt.png",
        },
      },
      {
        id: "landing-gadget-features",
        type: "features",
        props: {
          title: "More powerful everyday essentials",
          subtitle: "Editable feature cards based on the imported source structure.",
          items: [
            { icon: "zap", title: "More Powerful", description: "Fast, sleek, and built for daily use." },
            { icon: "camera", title: "MP Camera", description: "Smart imaging with a refined visual language." },
          ],
        },
      },
      {
        id: "landing-gadget-product-grid",
        type: "productGrid",
        props: {
          title: "Featured pixel devices",
          columns: 2,
          limit: 2,
          showFeatured: true,
        },
      },
    ],
    media: [
      { name: "hero", url: "/templates/imports/landing-gadget/landing-pixel-slider-phone-opt.png", type: "IMAGE", alt: "Landing gadget hero" },
      { name: "spec", url: "/templates/imports/landing-gadget/landing-pixel-specification-opt.jpg", type: "IMAGE", alt: "Specification" },
    ],
    pages: [
      {
        title: "Home",
        slug: "home",
        type: "LANDING",
        metaTitle: "Landing Gadget — Home",
        metaDescription: "Imported landing gadget homepage.",
        blocks: [
          {
            id: "landing-gadget-hero",
            type: "hero",
            props: {
              badge: "Landing Gadget",
              heading: "Inspiration of beauty in simplicity.",
              subheading: "A premium launch page built from the live reference source and adapted into editable blocks.",
              buttonText: "Buy now",
              buttonHref: "/shop",
              secondaryButtonText: "Learn more",
              secondaryButtonHref: "/about",
              bgStyle: "light",
              bgImage: "/templates/imports/landing-gadget/landing-pixel-slider-phone-opt.png",
            },
          },
          {
            id: "landing-gadget-features",
            type: "features",
            props: {
              title: "More powerful everyday essentials",
              subtitle: "Editable feature cards based on the imported source structure.",
              items: [
                { icon: "zap", title: "More Powerful", description: "Fast, sleek, and built for daily use." },
                { icon: "camera", title: "MP Camera", description: "Smart imaging with a refined visual language." },
              ],
            },
          },
          {
            id: "landing-gadget-product-grid",
            type: "productGrid",
            props: {
              title: "Featured pixel devices",
              columns: 2,
              limit: 2,
              showFeatured: true,
            },
          },
        ],
      },
      {
        title: "About",
        slug: "about",
        type: "ABOUT",
        metaTitle: "Landing Gadget — About",
        metaDescription: "About the imported landing gadget package.",
        blocks: [
          {
            id: "landing-gadget-about",
            type: "imageText",
            props: {
              title: "The story behind the device",
              text: "This package preserves the real structure of the reference page while keeping every section editable.",
              imagePosition: "right",
              buttonText: "Contact us",
              buttonHref: "/contact",
              image: "/templates/imports/landing-gadget/landing-pixel-slider-phone-opt.png",
            },
          },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        type: "CONTACT",
        metaTitle: "Landing Gadget — Contact",
        metaDescription: "Contact the imported landing gadget package.",
        blocks: [
          {
            id: "landing-gadget-contact",
            type: "contactForm",
            props: {
              title: "Get in touch",
              subtitle: "A contact block that stays editable inside the package model.",
            },
          },
        ],
      },
    ],
    products: [
      { name: "Pixel 3", slug: "pixel-3", price: 649, compareAtPrice: 699, stock: 18, isFeatured: true, tags: ["pixel", "launch"] },
      { name: "Pixel 3 XL", slug: "pixel-3-xl", price: 849, compareAtPrice: 899, stock: 12, isFeatured: true, tags: ["pixel", "xl"] },
    ],
    collections: [
      { name: "Landing Pixel", slug: "landing-pixel", description: "Imported launch collection" },
    ],
    blog: [{ title: "Launch Notes", slug: "launch-notes", excerpt: "Editable editorial content for the imported package." }],
  } as ThemePackageDefinition;
}
