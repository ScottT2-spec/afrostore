import type { ThemePackageDefinition } from "@/lib/templates/types";

export function getNajafAiPackageDefinition(): ThemePackageDefinition {
  return {
    slug: "najaf-ai",
    name: "Najaf AI",
    manifest: {
      category: "landing",
      industry: "AI Product Platform",
      siteType: "LANDING_PAGE",
      version: "1.0.0",
      tags: ["ai", "saas", "automation", "product"],
    },
    theme: {
      homepage_layout: "landing-editorial",
      header_style: "overlay",
      footer_style: "minimal",
      product_card_style: "standard",
      colors: {
        primary: "#111827",
        secondary: "#0F172A",
        accent: "#8B5CF6",
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
      homeTitle: "Najaf.ai | AI that builds your product, front to back",
      homeDescription: "An AI-powered product creation platform for building products from idea to launch.",
      defaultTitle: "Najaf.ai",
      defaultDescription: "Imported Najaf AI landing page package based on the live reference.",
    },
    navigation: [
      { label: "Features", href: "/#features" },
      { label: "Benefits", href: "/#benefits" },
      { label: "Why Us", href: "/#why-us" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: "Product", links: [{ label: "Features", href: "/#features" }, { label: "Benefits", href: "/#benefits" }, { label: "Pricing", href: "/#pricing" }] },
        { heading: "Company", links: [{ label: "Why Us", href: "/#why-us" }, { label: "FAQ", href: "/#faq" }, { label: "Contact", href: "/contact" }] },
      ],
      copyright: "© 2026 Najaf.ai. AI-powered product creation platform.",
    },
    menus: [
      { name: "Main Menu", slug: "main-menu", items: [{ label: "Features", href: "/#features" }, { label: "Benefits", href: "/#benefits" }, { label: "Pricing", href: "/#pricing" }, { label: "FAQ", href: "/#faq" }] },
    ],
    forms: [
      { name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] },
    ],
    homeSections: [
      {
        id: "najaf-hero",
        type: "hero",
        props: {
          badge: "Najaf.ai",
          heading: "AI that builds your product, front to back",
          subheading: "All-in-one platform for designing, building, and launching products with AI-powered workflow automation.",
          buttonText: "Free template",
          buttonHref: "/contact",
          secondaryButtonText: "Explore features",
          secondaryButtonHref: "/#features",
          bgStyle: "dark",
          bgImage: "/templates/jewellery/prefooter/about-us.webp",
        },
      },
      {
        id: "najaf-stats",
        type: "stats",
        props: {
          title: "Trusted by leaders from various industries",
          items: [{ value: "50 hours", label: "saved per project" }, { value: "40%", label: "reduced revision rounds" }, { value: "10x", label: "faster prototyping turnaround" }, { value: "5+", label: "teams collaborate in real-time" }],
        },
      },
      {
        id: "najaf-features",
        type: "features",
        props: {
          title: "Everything you need to go from idea to launch",
          subtitle: "Turn ideas into designs, specs, and content with one prompt.",
          items: [
            { icon: "sparkles", title: "One prompt, full product", description: "Turn ideas into designs, specs, and content." },
            { icon: "zap", title: "Auto tech packs and specs", description: "Export ready-to-use files with one click." },
            { icon: "chart", title: "Compare reports year over year", description: "Make data-driven decisions." },
            { icon: "message", title: "Track and review responses", description: "Turn messy feedback into clear, actionable insight." },
          ],
        },
      },
      {
        id: "najaf-benefits",
        type: "features",
        props: {
          title: "Benefits that make building feel effortless",
          subtitle: "From idea to launch, Najaf connects every step without manual handoffs or bottlenecks.",
          items: [
            { icon: "palette", title: "Smart design tools", description: "Auto-generate mockups, visuals, and prototypes in minutes." },
            { icon: "workflow", title: "Automated workflows", description: "Connect every step from idea to launch without bottlenecks." },
            { icon: "document", title: "Docs & decks", description: "Generate pitch decks, product briefs, and launch plans tailored to your product." },
            { icon: "brain", title: "AI brainstorming", description: "Generate ideas, names, and product concepts instantly." },
          ],
        },
      },
      {
        id: "najaf-whyus",
        type: "features",
        props: {
          title: "Why creators and teams choose Najaf.ai every day",
          items: [
            { icon: "layers", title: "End-to-end, all in one", description: "No more bouncing between tools or chasing teammates." },
            { icon: "users", title: "Built for real people", description: "Built for creators, not coders, with a simple visual workflow." },
            { icon: "rocket", title: "Speed without the stress", description: "Get from concept to launch without delays." },
            { icon: "sparkles", title: "Practical, not just hype", description: "Our AI helps you get real work done faster." },
          ],
        },
      },
      {
        id: "najaf-pricing",
        type: "features",
        props: {
          title: "Affordable plans to help you launch faster and smarter",
          items: [
            { icon: "check", title: "Starter", description: "$37/month for early automation workflows." },
            { icon: "check", title: "Professional", description: "$75/month for advanced sales and marketing workflows." },
            { icon: "check", title: "Enterprise", description: "Custom pricing for large teams and compliance requirements." },
          ],
        },
      },
      {
        id: "najaf-faq",
        type: "faq",
        props: {
          title: "Answers to common questions about Najaf.ai",
          items: [
            { question: "What is Najaf?", answer: "Najaf is an AI-powered, 3D-native product-creation platform that takes you from concept to commerce faster and at lower cost." },
            { question: "Who is Najaf for?", answer: "Brands, manufacturers, and e-commerce teams across apparel, accessories, footwear, jewelry, home goods, and other consumer products." },
            { question: "How secure is my data?", answer: "Najaf is hosted on SOC 2 and ISO 27001-certified infrastructure with AES-256 encryption and role-based access controls." },
          ],
        },
      },
    ],
    media: [
      { name: "hero", url: "/templates/jewellery/prefooter/about-us.webp", type: "IMAGE", alt: "Najaf hero" },
      { name: "preview", url: "/templates/jewellery/prefooter/showrooms.webp", type: "IMAGE", alt: "Najaf preview" },
    ],
    pages: [
      {
        title: "Home",
        slug: "home",
        type: "LANDING",
        metaTitle: "Najaf.ai — Home",
        metaDescription: "AI-powered product creation platform for idea to launch workflows.",
        blocks: [
          {
            id: "najaf-hero",
            type: "hero",
            props: {
              badge: "Najaf.ai",
              heading: "AI that builds your product, front to back",
              subheading: "All-in-one platform for designing, building, and launching products with AI-powered workflow automation.",
              buttonText: "Free template",
              buttonHref: "/contact",
              secondaryButtonText: "Explore features",
              secondaryButtonHref: "/#features",
              bgStyle: "dark",
              bgImage: "/templates/jewellery/prefooter/about-us.webp",
            },
          },
          {
            id: "najaf-stats",
            type: "stats",
            props: {
              title: "Trusted by leaders from various industries",
              items: [{ value: "50 hours", label: "saved per project" }, { value: "40%", label: "reduced revision rounds" }, { value: "10x", label: "faster prototyping turnaround" }, { value: "5+", label: "teams collaborate in real-time" }],
            },
          },
          {
            id: "najaf-features",
            type: "features",
            props: {
              title: "Everything you need to go from idea to launch",
              subtitle: "Turn ideas into designs, specs, and content with one prompt.",
              items: [
                { icon: "sparkles", title: "One prompt, full product", description: "Turn ideas into designs, specs, and content." },
                { icon: "zap", title: "Auto tech packs and specs", description: "Export ready-to-use files with one click." },
                { icon: "chart", title: "Compare reports year over year", description: "Make data-driven decisions." },
                { icon: "message", title: "Track and review responses", description: "Turn messy feedback into clear, actionable insight." },
              ],
            },
          },
          {
            id: "najaf-benefits",
            type: "features",
            props: {
              title: "Benefits that make building feel effortless",
              subtitle: "From idea to launch, Najaf connects every step without manual handoffs or bottlenecks.",
              items: [
                { icon: "palette", title: "Smart design tools", description: "Auto-generate mockups, visuals, and prototypes in minutes." },
                { icon: "workflow", title: "Automated workflows", description: "Connect every step from idea to launch without bottlenecks." },
                { icon: "document", title: "Docs & decks", description: "Generate pitch decks, product briefs, and launch plans tailored to your product." },
                { icon: "brain", title: "AI brainstorming", description: "Generate ideas, names, and product concepts instantly." },
              ],
            },
          },
          {
            id: "najaf-whyus",
            type: "features",
            props: {
              title: "Why creators and teams choose Najaf.ai every day",
              items: [
                { icon: "layers", title: "End-to-end, all in one", description: "No more bouncing between tools or chasing teammates." },
                { icon: "users", title: "Built for real people", description: "Built for creators, not coders, with a simple visual workflow." },
                { icon: "rocket", title: "Speed without the stress", description: "Get from concept to launch without delays." },
                { icon: "sparkles", title: "Practical, not just hype", description: "Our AI helps you get real work done faster." },
              ],
            },
          },
          {
            id: "najaf-pricing",
            type: "features",
            props: {
              title: "Affordable plans to help you launch faster and smarter",
              items: [
                { icon: "check", title: "Starter", description: "$37/month for early automation workflows." },
                { icon: "check", title: "Professional", description: "$75/month for advanced sales and marketing workflows." },
                { icon: "check", title: "Enterprise", description: "Custom pricing for large teams and compliance requirements." },
              ],
            },
          },
          {
            id: "najaf-faq",
            type: "faq",
            props: {
              title: "Answers to common questions about Najaf.ai",
              items: [
                { question: "What is Najaf?", answer: "Najaf is an AI-powered, 3D-native product-creation platform that takes you from concept to commerce faster and at lower cost." },
                { question: "Who is Najaf for?", answer: "Brands, manufacturers, and e-commerce teams across apparel, accessories, footwear, jewelry, home goods, and other consumer products." },
                { question: "How secure is my data?", answer: "Najaf is hosted on SOC 2 and ISO 27001-certified infrastructure with AES-256 encryption and role-based access controls." },
              ],
            },
          },
        ],
      },
      {
        title: "About",
        slug: "about",
        type: "ABOUT",
        metaTitle: "Najaf.ai — About",
        metaDescription: "About the imported Najaf AI product platform.",
        blocks: [
          {
            id: "najaf-about",
            type: "imageText",
            props: {
              title: "Built for founders and teams",
              text: "Najaf.ai brings strategy, design, development, and delivery together in one seamless platform so you can focus on building, not managing.",
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
        metaTitle: "Najaf.ai — Contact",
        metaDescription: "Contact the imported Najaf AI template.",
        blocks: [
          {
            id: "najaf-contact",
            type: "contactForm",
            props: {
              title: "Start your next launch",
              subtitle: "A simple editable contact block for the package.",
            },
          },
        ],
      },
    ],
    products: [],
    collections: [],
    blog: [{ title: "Product Notes", slug: "product-notes", excerpt: "Editorial content for the imported package." }],
  } as ThemePackageDefinition;
}
