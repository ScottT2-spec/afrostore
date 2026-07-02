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
  return `/templates/imports/landing-gadget/${fileName}`;
}

function pageSet(source: ImportedSource, heroTitle: string, body: string, heroImage?: string) {
  return {
    about: [
      block(`${source.slug}-about-hero`, "hero", {
        badge: source.name,
        heading: heroTitle,
        subheading: body,
        buttonText: "Shop Now",
        buttonHref: "/shop",
        secondaryButtonText: "Contact",
        secondaryButtonHref: "/contact",
        bgStyle: "light",
        bgImage: heroImage,
      }),
      block(`${source.slug}-about-story`, "imageText", {
        title: "The story behind the device",
        text: body,
        imagePosition: "right",
        buttonText: "Contact us",
        buttonHref: "/contact",
        image: heroImage,
      }),
      block(`${source.slug}-about-stats`, "stats", {
        title: "At a glance",
        items: [
          { value: "100%", label: "Editable" },
          { value: "1", label: "Imported theme package" },
          { value: "24/7", label: "Rendered in builder" },
          { value: "∞", label: "Reusable sections" },
        ],
      }),
    ],
    shop: [
      block(`${source.slug}-shop-hero`, "hero", {
        badge: "Shop",
        heading: `Explore ${source.name}`,
        subheading: `Browse the complete ${source.name.toLowerCase()} collection with premium merchandising and editable product cards.`,
        buttonText: "View Collections",
        buttonHref: "/collections",
        secondaryButtonText: "Featured",
        secondaryButtonHref: "/",
        bgStyle: "dark",
        bgImage: heroImage,
      }),
      block(`${source.slug}-shop-products`, "featured_products", {
        title: "Featured Products",
        subtitle: "Best sellers and new arrivals from the imported reference.",
        limit: 8,
        columns: 4,
        showFeatured: true,
      }),
      block(`${source.slug}-shop-banner`, "banner", {
        title: "Free shipping on selected items",
        subtitle: "A conversion-focused promo block for the imported store.",
        buttonText: "Browse Deals",
        buttonHref: "/collections",
      }),
    ],
    category: [
      block(`${source.slug}-category-hero`, "hero", {
        badge: "Collections",
        heading: `${source.name} Categories`,
        subheading: `Category browsing that mirrors the imported template structure.`,
        buttonText: "Shop All",
        buttonHref: "/shop",
        bgStyle: "accent",
        bgImage: heroImage,
      }),
      block(`${source.slug}-category-grid`, "imageCategoryCards", {
        title: "Browse by Category",
        columns: 4,
        items: [],
      }),
      block(`${source.slug}-category-products`, "productGrid", {
        title: "Popular Picks",
        columns: 4,
        limit: 8,
        showFeatured: true,
      }),
    ],
    product: [
      block(`${source.slug}-product-hero`, "hero", {
        badge: source.name,
        heading: "Signature Product Detail",
        subheading: "Premium product storytelling with strong merchandising and conversion cues.",
        buttonText: "Add to Cart",
        buttonHref: "/shop",
        secondaryButtonText: "Back to Shop",
        secondaryButtonHref: "/shop",
        bgStyle: "light",
        bgImage: heroImage,
      }),
      block(`${source.slug}-product-story`, "imageText", {
        title: "Why shoppers choose this collection",
        text: body,
        imagePosition: "left",
        buttonText: "See more",
        buttonHref: "/contact",
        image: heroImage,
      }),
      block(`${source.slug}-product-benefits`, "features", {
        title: "Product highlights",
        subtitle: "All of this stays editable in the stored site model.",
        items: [
          { icon: "shield", title: "Editable details", description: "All product content stays in the site model." },
          { icon: "truck", title: "Shipping info", description: "Display delivery, pickup, or service notes." },
          { icon: "heart", title: "Wishlist-ready", description: "Keeps the storefront experience engaging." },
        ],
      }),
    ],
    blog: [
      block(`${source.slug}-blog-hero`, "hero", {
        badge: "Journal",
        heading: `${source.name} Stories`,
        subheading: "Editorial content, styling ideas, and template-driven content sections.",
        buttonText: "Read Articles",
        buttonHref: "/contact",
        bgStyle: "dark",
        bgImage: heroImage,
      }),
      block(`${source.slug}-blog-grid`, "gallery", {
        title: "Recent Stories",
        columns: 3,
      }),
      block(`${source.slug}-blog-newsletter`, "newsletter", {
        title: "Join the list",
        subtitle: "Capture subscribers with the same visual style as the imported template.",
      }),
    ],
    faq: [
      block(`${source.slug}-faq-hero`, "hero", {
        badge: "FAQ",
        heading: `Questions about ${source.name}?`,
        subheading: "The FAQ page is part of the imported package, not a generic fallback.",
        buttonText: "Contact Us",
        buttonHref: "/contact",
        bgStyle: "light",
        bgImage: heroImage,
      }),
      block(`${source.slug}-faq-list`, "faq", {
        title: "Frequently asked questions",
        items: [
          { question: "Is this template editable?", answer: "Yes. Pages, sections, blocks, media, SEO, and forms all remain editable." },
          { question: "Does preview match import?", answer: "Yes. The same package data feeds preview, builder, and live rendering." },
        ],
      }),
    ],
    contact: [
      block(`${source.slug}-contact-hero`, "hero", {
        badge: "Contact",
        heading: `Talk to ${source.name}`,
        subheading: "A brand-specific contact page with the same imported design language.",
        buttonText: "Send Message",
        buttonHref: "#contact",
        bgStyle: "dark",
        bgImage: heroImage,
      }),
      block(`${source.slug}-contact-info`, "contactInfo", {
        title: "Visit or call",
        items: [
          { icon: "map-pin", title: "Store", value: "123 Market Street" },
          { icon: "phone", title: "Phone", value: "+1 (555) 123-4567" },
          { icon: "mail", title: "Email", value: "hello@example.com" },
        ],
      }),
      block(`${source.slug}-contact-form`, "contactForm", {
        title: "Get in touch",
        subtitle: "Capture leads and support requests inside the editable site model.",
      }),
    ],
  } satisfies NonNullable<PackageDesign["pages"]>;
}

export function buildImportedLandingGadgetDesign(source: ImportedSource): PackageDesign {
  const hero = sourcePath("landing-pixel-slider-phone-opt.png");
  const sound = sourcePath("landing-pixel-sound-img-opt.png");
  const spec = sourcePath("landing-pixel-specification-opt.jpg");
  const display = sourcePath("landing-pixel-display-opt.jpg");
  const waterproof = sourcePath("landing-pixel-woterproof-opt.png");
  const photo1 = sourcePath("landing-pixel-photo-1-opt.jpg");
  const photo3 = sourcePath("landing-pixel-photo-3-opt.jpg");
  const photo4 = sourcePath("landing-pixel-photo-4-opt.jpg");
  const camera = sourcePath("landing-pixel-camera-opt.png");
  const security = sourcePath("landing-pixel-sequrity-opt-1.jpg");
  const sliderBg = sourcePath("landing-pixel-slider-bg-opt.jpg");
  const cameraBg = sourcePath("landing-pixel-camera-bg-opt.jpg");

  const pages = pageSet(
    source,
    "Inspiration Of Beauty In Simplicity.",
    "Authorities in our business will tell in no uncertain terms that Lorem Ipsum is that huge, huge no no to forswear forever. Not so fast, I'd say, there are some redeeming factors in favor of greeking text, as its use is merely the symptom of a worse problem to take.",
    hero,
  );

  const packageDesign: PackageDesign = {
    previewImage: hero,
    homeSections: [
      block(`${source.slug}-hero`, "hero", {
        badge: source.name,
        heading: "Inspiration Of\nBeauty In Simplicity.",
        subheading: "Authorities in our business will tell in no uncertain terms that Lorem Ipsum is that huge, huge no no to forswear forever. Not so fast, I'd say, there are some redeeming factors in favor of greeking text, as its use is merely the symptom of a worse problem to take.",
        buttonText: "Buy now",
        buttonHref: "/shop",
        secondaryButtonText: "View More",
        secondaryButtonHref: "/about",
        bgStyle: "light",
        bgImage: sliderBg,
        image: hero,
        layout: "split",
        textColor: "#242424",
      }),
      block(`${source.slug}-feature-strip`, "features", {
        title: "More powerful everyday essentials",
        subtitle: "The imported page pairs bold claims with concise feature cards.",
        bgColor: "surface",
        items: [
          { icon: "zap", title: "Hours Life", description: "It's unreal, uncanny, makes you wonder if something is wrong, it." },
          { icon: "camera", title: "More Powerful", description: "Usually, we prefer the real thing, wine without sulfur based pres." },
          { icon: "headphones", title: "MP Camera", description: "Real butter, not margarine, and so we'd like our layouts designs." },
        ],
      }),
      block(`${source.slug}-display`, "imageText", {
        title: "Colors and contrast in the P-OLED display.",
        text: "But worse, what if the fish doesn't fit in the can, the foot's to big for the boot that's not so bad. To short sentences, to many headings, images too large for the proposed design, or too small, or they fit in but it looks.",
        imagePosition: "right",
        buttonText: "To Shop",
        buttonHref: "/shop",
        secondaryButtonText: "View More",
        secondaryButtonHref: "/about",
        image: display,
      }),
      block(`${source.slug}-specs`, "stats", {
        title: "Hours life and processing power",
        bgColor: "surface",
        items: [
          { value: "48", label: "Hours Life" },
          { value: "2X", label: "More Powerful" },
          { value: "12.2", label: "MP Camera" },
        ],
      }),
      block(`${source.slug}-waterproof`, "imageText", {
        title: "The body is made of waterproof materials.",
        text: "When it's about controlling hundreds of articles, product pages for web shops, or user profiles in social networks, all of them potentially with different sizes, formats, rules for.",
        imagePosition: "left",
        buttonText: "View More",
        buttonHref: "/contact",
        secondaryButtonText: "Add to Cart",
        secondaryButtonHref: "/shop",
        image: waterproof,
      }),
      block(`${source.slug}-camera`, "imageText", {
        title: "Point your camera find products online.",
        text: "Using test items of real content and data in designs will help, but there's no guarantee that every oddity will be found and corrected. Do you want to be sure or beta.",
        imagePosition: "right",
        buttonText: "To Shop",
        buttonHref: "/shop",
        secondaryButtonText: "View More",
        secondaryButtonHref: "/about",
        image: cameraBg,
      }),
      block(`${source.slug}-security`, "features", {
        title: "Security and protection against thieves.",
        subtitle: "Source-derived capability cards translated into editable blocks.",
        bgColor: "surface",
        items: [
          { icon: "shield", title: "Unlock Fingerprint", description: "Presently it defines a new ipsum provider plugin service that allows for pluggable ipsum." },
          { icon: "lock", title: "Web Locking", description: "Optionally available are extracts from a speech, corporate nonsense, and a randomised." },
          { icon: "shield", title: "OS Secure", description: "Try telling a client to ignore draft copy however, and you're up to something you can't win." },
        ],
      }),
      block(`${source.slug}-camera-specs`, "stats", {
        title: "Powerful optics and advanced technology in camera.",
        bgColor: "surface",
        items: [
          { value: "12.2 MP", label: "Camera" },
          { value: "1.4 μm", label: "Pixel Size" },
          { value: "f/1.8", label: "Aperture" },
          { value: "6x Zoom", label: "Sapphire Lenses" },
        ],
      }),
      block(`${source.slug}-product-grid`, "productGrid", {
        title: "Featured pixel devices",
        columns: 2,
        limit: 2,
        showFeatured: true,
      }),
      block(`${source.slug}-gallery`, "gallery", {
        title: "Hardware detail gallery",
        columns: 3,
      }),
      block(`${source.slug}-newsletter`, "newsletter", {
        title: "Subscribe us.",
        subtitle: "A client's unhappy for a reason is a problem, a client that's unhappy though he or her can't quite put a finger on it is worse. That's not so bad, there's dummy copy.",
      }),
    ],
    pages: {
      home: [],
      about: pages.about,
      shop: pages.shop,
      category: pages.category,
      product: pages.product,
      blog: pages.blog,
      faq: pages.faq,
      contact: pages.contact,
    },
    media: [
      media("hero", hero, "Landing gadget hero"),
      media("sound", sound, "Stereo speakers"),
      media("spec", spec, "Specification"),
      media("display", display, "Display"),
      media("waterproof", waterproof, "Waterproof body"),
      media("photo-1", photo1, "Lifestyle shot 1"),
      media("photo-3", photo3, "Lifestyle shot 3"),
      media("photo-4", photo4, "Lifestyle shot 4"),
      media("camera", camera, "Camera"),
      media("security", security, "Security"),
      media("logo", sourcePath("xtemos-logo-black-3.svg"), "Xtemos Studio"),
    ],
    products: [
      product("Pixel 3", "pixel-3", 649, sourcePath("landing-pixel-product-3-white-opt.jpg"), { compareAtPrice: 699, stock: 18, isFeatured: true, tags: ["pixel", "phone", "launch"] }),
      product("Pixel 3 XL", "pixel-3-xl", 849, sourcePath("landing-pixel-product-3-xl-white-opt.jpg"), { compareAtPrice: 899, stock: 12, isFeatured: true, tags: ["pixel", "phone", "xl"] }),
    ],
    collections: [
      { name: "Landing Pixel", slug: "landing-pixel", description: "Imported launch collection", image: hero },
      { name: "Pixel Accessories", slug: "pixel-accessories", description: "Support items and add-ons", image: sound },
    ],
    blog: [
      { title: "Launch Notes", slug: "launch-notes", excerpt: "A source-derived launch page keeps editorial and commerce blocks together." },
      { title: "Feature Spotlight", slug: "feature-spotlight", excerpt: "The imported design preserves the real template flow." },
    ],
    navigation: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Blog", href: "/blog" },
      { label: "Pages", href: "/about" },
      { label: "Elements", href: "/faq" },
      { label: "Buy", href: "/shop" },
    ],
    footer: {
      columns: [
        { heading: "Support", links: [{ label: "Contact Us", href: "/contact" }, { label: "FAQs", href: "/faq" }, { label: "Returns", href: "/faq" }] },
        { heading: "Company", links: [{ label: "About us", href: "/about" }, { label: "Privacy Policy", href: "/policy" }, { label: "Terms", href: "/policy" }] },
        { heading: "Explore", links: [{ label: "Shop", href: "/shop" }, { label: "Blog", href: "/blog" }, { label: "Portfolio", href: "/blog" }] },
      ],
      copyright: "Landing Gadget — imported from the live reference source",
    },
    menus: [
      { name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Blog", href: "/blog" }, { label: "Pages", href: "/about" }, { label: "Elements", href: "/faq" }] },
      { name: "Footer Menu", slug: "footer-menu", items: [{ label: "Privacy Policy", href: "/policy" }, { label: "Returns", href: "/policy" }, { label: "Terms & Conditions", href: "/policy" }] },
    ],
    forms: [
      { name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] },
      { name: "Newsletter", slug: "newsletter", fields: [{ name: "email", label: "Email", type: "email", required: true }] },
    ],
  };

  return packageDesign;
}

export const landingGadgetSource = {
  slug: "landing-gadget",
  name: "Landing Gadget",
  category: "Landing Page",
  tags: ["landing", "gadget", "pixel", "launch"],
};

const landingGadgetDesign = buildImportedLandingGadgetDesign(landingGadgetSource);

export const landingGadgetImportedPackage: ThemePackageDefinition = {
  manifest: {
    category: "landing",
    industry: "Landing Gadget",
    siteType: "LANDING_PAGE",
    version: "1.0.0",
    tags: ["landing", "gadget", "pixel", "launch"],
  },
  theme: {
    homepage_layout: "landing-imported",
    header_style: "overlay",
    footer_style: "editorial",
    product_card_style: "premium",
    colors: {
      primary: "#e84e48",
      secondary: "#2A2A2A",
      accent: "#fbbc34",
      background: "#FFFFFF",
      text: "#767676",
      headerBg: "rgba(255,255,255,0.96)",
      headerText: "#242424",
      footerBg: "#f0f2f4",
      footerText: "#242424",
    },
    fonts: {
      heading: "HK Grotesk Pro",
      body: "HK Grotesk Pro",
    },
  },
  seo: {
    homeTitle: "Landing Gadget WordPress theme | WoodMart",
    homeDescription: "WoodMart is a premium WooCommerce theme that is perfectly optimized for performance. Build your online store without hassle.",
    defaultTitle: "Landing Gadget",
    defaultDescription: "WoodMart is a premium WooCommerce theme that is perfectly optimized for performance. Build your online store without hassle.",
  },
  navigation: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Blog", href: "/blog" },
    { label: "Pages", href: "/about" },
    { label: "Elements", href: "/faq" },
    { label: "Buy", href: "/shop" },
  ],
  footer: {
    columns: [
      { heading: "Support", links: [{ label: "Contact Us", href: "/contact" }, { label: "Returns", href: "/policy" }, { label: "Term & Conditions", href: "/policy" }] },
      { heading: "Company", links: [{ label: "Latest News", href: "/blog" }, { label: "Our Sitemap", href: "/blog" }, { label: "Privacy Policya", href: "/policy" }] },
      { heading: "Explore", links: [{ label: "Shop", href: "/shop" }, { label: "Blog", href: "/blog" }, { label: "Buy", href: "/shop" }] },
    ],
    copyright: "WOODMART 2026 CREATED BY X TEMOS STUDIO. PREMIUM E-COMMERCE SOLUTIONS.",
  },
  menus: [
    { name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Blog", href: "/blog" }, { label: "Pages", href: "/about" }, { label: "Elements", href: "/faq" }] },
    { name: "Footer Menu", slug: "footer-menu", items: [{ label: "Privacy Policya", href: "/policy" }, { label: "Returns", href: "/policy" }, { label: "Term & Conditions", href: "/policy" }, { label: "Contact Us", href: "/contact" }, { label: "Latest News", href: "/blog" }, { label: "Our Sitemap", href: "/blog" }] },
  ],
  forms: [
    { name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] },
    { name: "Newsletter", slug: "newsletter", fields: [{ name: "email", label: "Email", type: "email", required: true }] },
  ],
  media: [
    media("hero", sourcePath("landing-pixel-slider-phone-opt.png"), "Landing gadget hero"),
    media("slider-bg", sourcePath("landing-pixel-slider-bg-opt.jpg"), "Hero background"),
    media("sound", sourcePath("landing-pixel-sound-img-opt.png"), "Stereo speakers"),
    media("spec", sourcePath("landing-pixel-specification-opt.jpg"), "Specification"),
    media("display", sourcePath("landing-pixel-display-opt.jpg"), "Display"),
    media("waterproof", sourcePath("landing-pixel-woterproof-opt.png"), "Waterproof body"),
    media("photo-1", sourcePath("landing-pixel-photo-1-opt.jpg"), "Lifestyle shot 1"),
    media("photo-3", sourcePath("landing-pixel-photo-3-opt.jpg"), "Lifestyle shot 3"),
    media("photo-4", sourcePath("landing-pixel-photo-4-opt.jpg"), "Lifestyle shot 4"),
    media("camera", sourcePath("landing-pixel-camera-opt.png"), "Camera"),
    media("camera-bg", sourcePath("landing-pixel-camera-bg-opt.jpg"), "Camera background"),
    media("security", sourcePath("landing-pixel-sequrity-opt-1.jpg"), "Security"),
    media("popup", sourcePath("landing-pixel-popup-bg-opt.jpg"), "Popup background"),
    media("product-3-black", sourcePath("landing-pixel-product-3-black-opt.jpg"), "Pixel 3 black"),
    media("product-3-gold-pink", sourcePath("landing-pixel-product-3-gold-pink-opt.jpg"), "Pixel 3 gold pink"),
    media("logo", sourcePath("xtemos-logo-black-3.svg"), "Xtemos Studio"),
  ],
  pages: [
    {
      title: "Home",
      slug: "home",
      type: "LANDING",
      metaTitle: "Landing Gadget — Home",
      metaDescription: "Imported landing gadget homepage.",
      blocks: landingGadgetDesign.homeSections,
    },
    {
      title: "About",
      slug: "about",
      type: "ABOUT",
      metaTitle: "Landing Gadget — About",
      metaDescription: "About the imported landing gadget package.",
      blocks: landingGadgetDesign.pages?.about || [],
    },
    {
      title: "Shop",
      slug: "shop",
      type: "CUSTOM",
      metaTitle: "Landing Gadget — Shop",
      metaDescription: "Shop the imported landing gadget package.",
      blocks: landingGadgetDesign.pages?.shop || [],
    },
    {
      title: "Category",
      slug: "category",
      type: "CUSTOM",
      metaTitle: "Landing Gadget — Category",
      metaDescription: "Category browsing for the imported landing gadget package.",
      blocks: landingGadgetDesign.pages?.category || [],
    },
    {
      title: "Product",
      slug: "product",
      type: "CUSTOM",
      metaTitle: "Landing Gadget — Product",
      metaDescription: "Product detail content for the imported landing gadget package.",
      blocks: landingGadgetDesign.pages?.product || [],
    },
    {
      title: "Blog",
      slug: "blog",
      type: "CUSTOM",
      metaTitle: "Landing Gadget — Blog",
      metaDescription: "Blog content for the imported landing gadget package.",
      blocks: landingGadgetDesign.pages?.blog || [],
    },
    {
      title: "FAQ",
      slug: "faq",
      type: "FAQ",
      metaTitle: "Landing Gadget — FAQ",
      metaDescription: "Frequently asked questions for the imported landing gadget package.",
      blocks: landingGadgetDesign.pages?.faq || [],
    },
    {
      title: "Contact",
      slug: "contact",
      type: "CONTACT",
      metaTitle: "Landing Gadget — Contact",
      metaDescription: "Contact page for the imported landing gadget package.",
      blocks: landingGadgetDesign.pages?.contact || [],
    },
  ],
  products: [
    product("Pixel 3", "pixel-3", 649, sourcePath("landing-pixel-product-3-white-opt.jpg"), { compareAtPrice: 699, stock: 18, isFeatured: true, tags: ["pixel", "phone", "launch"] }),
    product("Pixel 3 XL", "pixel-3-xl", 849, sourcePath("landing-pixel-product-3-xl-white-opt.jpg"), { compareAtPrice: 899, stock: 12, isFeatured: true, tags: ["pixel", "phone", "xl"] }),
  ],
  collections: [
    { name: "Landing Pixel", slug: "landing-pixel", description: "Imported launch collection", image: sourcePath("landing-pixel-slider-phone-opt.png") },
    { name: "Pixel Accessories", slug: "pixel-accessories", description: "Support items and add-ons", image: sourcePath("landing-pixel-sound-img-opt.png") },
  ],
  blog: [
    { title: "Launch Notes", slug: "launch-notes", excerpt: "A source-derived launch page keeps editorial and commerce blocks together." },
    { title: "Feature Spotlight", slug: "feature-spotlight", excerpt: "The imported design preserves the real template flow." },
  ],
};
