import type { BuilderBlock } from "@/components/storefront/BlockRenderer";
import type { ThemePackageCollection, ThemePackageMediaAsset, ThemePackageProduct } from "./types";
import { buildImportedLandingGadgetDesign } from "./imported/landing-gadget";
import { buildImportedAegisDesign } from "./imported/aegis";

export interface PackageDesign {
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
}

type PackageSource = {
  slug: string;
  name: string;
  category: string;
  tags: string[];
};

function block(id: string, type: BuilderBlock["type"], props: Record<string, unknown>): BuilderBlock {
  return { id, type, props };
}

function product(name: string, slug: string, price: number, image: string, extra: Partial<ThemePackageProduct> = {}): ThemePackageProduct {
  return { name, slug, price, image, ...extra };
}

function media(name: string, url: string, alt?: string): ThemePackageMediaAsset {
  return { name, url, alt, type: "IMAGE" };
}

function pageSet(source: PackageSource, heroTitle: string, body: string, heroImage?: string) {
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
        title: `The Story Behind ${source.name}`,
        text: body,
        imagePosition: "right",
        buttonText: "Meet the Brand",
        buttonHref: "/contact",
        image: heroImage,
      }),
      block(`${source.slug}-about-stats`, "stats", {
        title: "At a Glance",
        items: [
          { value: "100%", label: "Editable" },
          { value: "1", label: "Independent theme package" },
          { value: "24/7", label: "Storefront rendering" },
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
        subtitle: "Best sellers and new arrivals.",
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
        buttonText: "See More",
        buttonHref: "/contact",
        image: heroImage,
      }),
      block(`${source.slug}-product-benefits`, "features", {
        title: "Product Highlights",
        subtitle: "Shape trust and urgency with the same layout in preview, builder, and live site.",
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
        subtitle: "Capture subscribers with the same visual style as the template.",
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
        title: "Frequently Asked Questions",
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
        title: "Visit or Call",
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

function buildLuxuryCommerce(source: PackageSource, options: {
  heroImage: string;
  categoryImages: Array<{ title: string; image: string; href: string }>;
  products: ThemePackageProduct[];
  gallery: Array<{ src: string; alt: string }>;
  brandLogos: string[];
  previewImage: string;
  headline: string;
  subheading: string;
}) {
  const pages = pageSet(source, options.headline, options.subheading, options.heroImage);
  return {
    previewImage: options.previewImage,
    homeSections: [
      block(`${source.slug}-hero`, "hero", {
        badge: source.name,
        heading: options.headline,
        subheading: options.subheading,
        buttonText: "Shop Collection",
        buttonHref: "/shop",
        secondaryButtonText: "Explore Story",
        secondaryButtonHref: "/about",
        bgStyle: "dark",
        bgImage: options.heroImage,
      }),
      block(`${source.slug}-collections`, "imageCategoryCards", { title: "Shop by Category", columns: 4, items: options.categoryImages }),
      block(`${source.slug}-featured`, "featured_products", { title: "Featured Pieces", subtitle: "Premium product cards with live store data.", limit: 8, columns: 4, showFeatured: true }),
      block(`${source.slug}-story`, "promoSplit", {
        leftImages: [{ src: options.gallery[0]?.src || options.heroImage, title: "Crafted details" }, { src: options.gallery[1]?.src || options.heroImage, title: "Luxury packaging" }],
        centerProducts: options.products.slice(0, 2).map(({ name, price, image, compareAtPrice }) => ({ name, price, image, compareAtPrice })),
        rightImages: [{ src: options.gallery[2]?.src || options.heroImage, title: "Editorial styling" }],
      }),
      block(`${source.slug}-gallery`, "gallery", { title: "Campaign Gallery", columns: 3, images: options.gallery }),
      block(`${source.slug}-brands`, "imageBrands", {
        title: "Featured In",
        logos: options.brandLogos.map((logo) => ({ name: logo, logo })),
      }),
      block(`${source.slug}-newsletter`, "newsletter", {
        title: "Join the list",
        subtitle: "Announce launches and VIP access.",
      }),
    ],
    pages,
    media: [
      media(`${source.name} hero`, options.heroImage, `${source.name} hero`),
      ...options.gallery.map((item, index) => media(`${source.name} gallery ${index + 1}`, item.src, item.alt)),
    ],
    products: options.products,
    collections: [{ name: "Featured", slug: "featured", description: "Curated featured collection" }],
    blog: [{ title: `${source.name} Journal`, slug: "journal", excerpt: "Editorial storytelling and product updates." }],
    navigation: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: source.name, links: [{ label: "Shop", href: "/shop" }, { label: "Collections", href: "/collections" }, { label: "Contact", href: "/contact" }] },
        { heading: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Shipping", href: "/faq" }, { label: "Returns", href: "/faq" }] },
      ],
      copyright: `${source.name} Theme Package`,
    },
    menus: [{ name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] }],
    forms: [{ name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] }],
  } satisfies PackageDesign;
}

function buildFashionDesign(source: PackageSource): PackageDesign {
  const products = [
    product("Editorial Blazer", "editorial-blazer", 185, "/templates/fashion-colored/assets/fashion-product-1-430x490.jpg", { compareAtPrice: 225, isFeatured: true, tags: ["fashion", "outerwear"] }),
    product("Runway Dress", "runway-dress", 210, "/templates/fashion-colored/assets/fashion-product-6-430x490.jpg", { compareAtPrice: 260, isFeatured: true, tags: ["dress", "runway"] }),
    product("Statement Bag", "statement-bag", 120, "/templates/fashion-colored/assets/fashion-colored-product-3-263x300.jpg", { compareAtPrice: 150, tags: ["accessories", "bag"] }),
    product("Silk Set", "silk-set", 165, "/templates/fashion-colored/assets/fashion-colored-product-5-131x150.jpg", { compareAtPrice: 210, tags: ["set", "silk"] }),
    product("Tailored Coat", "tailored-coat", 240, "/templates/fashion-colored/assets/fashion-product-10-2-430x490.jpg", { compareAtPrice: 295, isFeatured: true, tags: ["coat", "winter"] }),
    product("Catwalk Top", "catwalk-top", 95, "/templates/fashion-colored/assets/fashion-product-10-430x490.jpg", { compareAtPrice: 125, tags: ["top", "fashion"] }),
  ];
  const categories = [
    { title: "New Drops", image: "/templates/fashion-colored/assets/cat-colored-fashion-14.jpg", href: "/collections" },
    { title: "Outerwear", image: "/templates/fashion-colored/assets/cat-colored-27.jpg", href: "/collections" },
    { title: "Accessories", image: "/templates/fashion-colored/assets/cat-colored-35.jpg", href: "/collections" },
    { title: "Evening", image: "/templates/fashion-colored/assets/cat-colored-45.jpg", href: "/collections" },
  ];
  return buildLuxuryCommerce(source, {
    heroImage: "/templates/fashion-colored/assets/slider-colored-fashion-7.jpg",
    categoryImages: categories,
    products,
    gallery: [
      { src: "/templates/fashion-colored/assets/wd-inst-fashion-colored-1.jpg", alt: "Lookbook 1" },
      { src: "/templates/fashion-colored/assets/wd-inst-fashion-colored-2.jpg", alt: "Lookbook 2" },
      { src: "/templates/fashion-colored/assets/wd-inst-fashion-colored-6-430x430.jpg", alt: "Lookbook 3" },
      { src: "/templates/fashion-colored/assets/wd-inst-fashion-colored-8-430x430.jpg", alt: "Lookbook 4" },
      { src: "/templates/fashion-colored/assets/slider-colored-fashion-9-1-1536x640.jpg", alt: "Campaign" },
      { src: "/templates/fashion-colored/assets/slider-colored-fashion-9-1536x640.jpg", alt: "Campaign" },
    ],
    brandLogos: ["Studio", "Maison", "Atelier", "Muse"],
    previewImage: "/templates/fashion-colored/assets/slider-colored-fashion-9-1536x640.jpg",
    headline: "Editorial fashion with a premium runway feel",
    subheading: "Large hero, curated collections, trending products, lookbooks, testimonials, and a polished editorial footer.",
  });
}

function buildJewelleryDesign(source: PackageSource): PackageDesign {
  const products = [
    product("Aurora Studs", "aurora-studs", 68, "/templates/jewellery/products/aurora-studs.webp", { compareAtPrice: 82, isFeatured: true, tags: ["studs", "gold"] }),
    product("Maeve Bangle", "maeve-bangle", 144, "/templates/jewellery/products/maeve-bangle.webp", { compareAtPrice: 176, tags: ["bangle", "bracelet"] }),
    product("Baya Hoop", "baya-hoop", 92, "/templates/jewellery/products/baya-hoop.webp", { compareAtPrice: 112, tags: ["hoop", "earrings"] }),
    product("Scarlett Hoop", "scarlett-hoop", 108, "/templates/jewellery/products/scarlett-hoop.webp", { compareAtPrice: 132, isFeatured: true, tags: ["hoops", "statement"] }),
    product("Paige Bracelet", "paige-bracelet", 126, "/templates/jewellery/products/paige-bracelet.webp", { compareAtPrice: 154, tags: ["bracelet", "stack"] }),
    product("Bold Bonds", "bold-bonds", 148, "/templates/jewellery/products/bold-bonds.webp", { compareAtPrice: 190, tags: ["layering", "luxury"] }),
  ];
  return buildLuxuryCommerce(source, {
    heroImage: "/templates/jewellery/hero/banner-1.webp",
    categoryImages: [
      { title: "Rings", image: "/templates/jewellery/categories/rings.webp", href: "/collections" },
      { title: "Necklaces", image: "/templates/jewellery/categories/necklaces.webp", href: "/collections" },
      { title: "Earrings", image: "/templates/jewellery/categories/earrings.webp", href: "/collections" },
      { title: "Bracelets", image: "/templates/jewellery/categories/bracelets.webp", href: "/collections" },
    ],
    products,
    gallery: [
      { src: "/templates/jewellery/prefooter/about-us.webp", alt: "About us" },
      { src: "/templates/jewellery/prefooter/collections.webp", alt: "Collections" },
      { src: "/templates/jewellery/prefooter/showrooms.webp", alt: "Showrooms" },
      { src: "/templates/jewellery/prefooter/packages.webp", alt: "Packages" },
      { src: "/templates/jewellery/promo/left-1.webp", alt: "Promo 1" },
      { src: "/templates/jewellery/promo/right-1.webp", alt: "Promo 2" },
    ],
    brandLogos: ["Minotti", "Poliform", "Vitra", "Lladro"],
    previewImage: "/templates/jewellery/hero/banner-2.webp",
    headline: "Timeless jewellery with luxury navigation and premium product cards",
    subheading: "A refined jewellery storefront with featured collections, editorial promos, brand logos, and an elegant newsletter footer.",
  });
}

function buildGroceryDesign(source: PackageSource): PackageDesign {
  const products = [
    product("Fresh Apples", "fresh-apples", 8, "/templates/grocery/assets/w-food-market-product-1-opt.jpg", { compareAtPrice: 10, isFeatured: true, tags: ["produce", "fresh"] }),
    product("Organic Avocados", "organic-avocados", 12, "/templates/grocery/assets/w-food-market-product-2-opt.jpg", { compareAtPrice: 14, tags: ["fruit", "organic"] }),
    product("Whole Grain Bread", "whole-grain-bread", 5, "/templates/grocery/assets/w-food-market-product-3-opt.jpg", { compareAtPrice: 7, tags: ["bakery", "bread"] }),
    product("Greek Yogurt", "greek-yogurt", 4, "/templates/grocery/assets/w-food-market-product-4-opt.jpg", { compareAtPrice: 5, tags: ["dairy", "fresh"] }),
    product("Organic Bananas", "organic-bananas", 6, "/templates/grocery/assets/w-food-market-product-5-opt.jpg", { compareAtPrice: 8, isFeatured: true, tags: ["fruit", "organic"] }),
    product("Honey Granola", "honey-granola", 11, "/templates/grocery/assets/w-food-market-product-6-opt.jpg", { compareAtPrice: 13, tags: ["pantry", "snack"] }),
  ];
  return {
    previewImage: "/templates/grocery/hero.jpg",
    homeSections: [
      block(`${source.slug}-hero`, "hero", {
        badge: "Weekly Deals",
        heading: "Fresh grocery shopping with strong category browsing",
        subheading: "Promotional banners, large product grid, featured brands, and quick checkout cues.",
        buttonText: "Shop Deals",
        buttonHref: "/shop",
        secondaryButtonText: "Browse Categories",
        secondaryButtonHref: "/collections",
        bgStyle: "dark",
        bgImage: "/templates/grocery/hero.jpg",
      }),
      block(`${source.slug}-slider`, "imageHeroBanner", {
        items: [
          { image: "/templates/grocery/assets/wood-food-market-slider-bg-1-opt-1-1300x393.jpg", title: "Fresh Produce", subtitle: "Daily specials", buttonText: "Shop", buttonHref: "/shop" },
          { image: "/templates/grocery/assets/wood-food-market-slider-bg-3-1300x393.jpg", title: "Weekly Deals", subtitle: "Save more", buttonText: "Shop", buttonHref: "/shop" },
        ],
      }),
      block(`${source.slug}-categories`, "imageCategoryCards", {
        title: "Shop by Category",
        columns: 4,
        items: [
          { title: "Fruit", image: "/templates/grocery/assets/w-food-market-product-9-opt.jpg", href: "/collections" },
          { title: "Bakery", image: "/templates/grocery/assets/w-food-market-product-14-opt.jpg", href: "/collections" },
          { title: "Dairy", image: "/templates/grocery/assets/w-food-market-product-17-opt.jpg", href: "/collections" },
          { title: "Pantry", image: "/templates/grocery/assets/w-food-market-product-21-opt.jpg", href: "/collections" },
        ],
      }),
      block(`${source.slug}-products`, "featured_products", { title: "This Week's Specials", subtitle: "Live product data imported from the package.", limit: 8, columns: 4, showFeatured: true }),
      block(`${source.slug}-features`, "features", {
        title: "Why shoppers stay",
        subtitle: "Delivery, freshness, and category-rich browsing all in one place.",
        items: [
          { icon: "truck", title: "Same-day delivery", description: "Fast delivery slots and pickup-friendly flows." },
          { icon: "shield", title: "Quality guarantee", description: "Only fresh items and transparent product cards." },
          { icon: "credit-card", title: "Easy checkout", description: "Optimized for quick purchase and repeat orders." },
          { icon: "heart", title: "Favorites", description: "Create a friendly browsing experience for regulars." },
        ],
      }),
      block(`${source.slug}-promo`, "banner", {
        title: "Fresh picks, weekly offers, and seasonal bundles",
        subtitle: "A grocery-specific promo strip that mirrors the imported store design.",
        buttonText: "See Offers",
        buttonHref: "/shop",
      }),
      block(`${source.slug}-gallery`, "gallery", {
        title: "Market Story",
        columns: 3,
        images: [
          { src: "/templates/grocery/assets/wood-food-market-ban-1-opt.jpg", alt: "Banner" },
          { src: "/templates/grocery/assets/wood-food-market-ban-2-opt.jpg", alt: "Banner" },
          { src: "/templates/grocery/assets/wood-food-market-slider-1-opt.png", alt: "Slider" },
        ],
      }),
      block(`${source.slug}-newsletter`, "newsletter", { title: "Weekly deals in your inbox", subtitle: "A store-branded newsletter footer instead of a placeholder CTA." }),
    ],
    pages: pageSet(source, "Fresh grocery shopping made simple", "Market-style browsing, weekly deals, and product categories that keep the store feeling real.", "/templates/grocery/hero.jpg"),
    media: [media("Grocery hero", "/templates/grocery/hero.jpg")],
    products,
    collections: [{ name: "Fresh Produce", slug: "fresh-produce", description: "Fresh produce and pantry basics" }],
    blog: [{ title: "Market Notes", slug: "market-notes", excerpt: "Seasonal tips, recipes, and grocery updates." }],
    navigation: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Categories", href: "/collections" },
      { label: "Deals", href: "/shop" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: source.name, links: [{ label: "Shop", href: "/shop" }, { label: "Deals", href: "/shop" }, { label: "Contact", href: "/contact" }] },
        { heading: "Help", links: [{ label: "FAQ", href: "/faq" }, { label: "Delivery", href: "/faq" }, { label: "Returns", href: "/faq" }] },
      ],
      copyright: `${source.name} Theme Package`,
    },
    menus: [{ name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Categories", href: "/collections" }, { label: "Contact", href: "/contact" }] }],
    forms: [{ name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] }],
  };
}

function buildElectronicsDesign(source: PackageSource): PackageDesign {
  const products = [
    product("Black Series Laptop", "black-series-laptop", 1250, "/templates/hardware/assets/black-electronics-product-1-1.jpg", { compareAtPrice: 1490, isFeatured: true, tags: ["laptop", "tech"] }),
    product("Noise Cancelling Headphones", "noise-cancelling-headphones", 320, "/templates/hardware/assets/black-electronics-product-2-700x691.jpg", { compareAtPrice: 380, tags: ["audio", "accessories"] }),
    product("Smart Monitor", "smart-monitor", 480, "/templates/hardware/assets/black-electronics-product-3-304x300.jpg", { compareAtPrice: 540, tags: ["display", "office"] }),
    product("Gaming Console", "gaming-console", 510, "/templates/hardware/assets/black-electronics-product-4-700x691.jpg", { compareAtPrice: 590, isFeatured: true, tags: ["gaming", "console"] }),
    product("Wireless Speaker", "wireless-speaker", 160, "/templates/hardware/assets/black-electronics-product-5-304x300.jpg", { compareAtPrice: 190, tags: ["audio", "portable"] }),
    product("Smartwatch", "smartwatch", 220, "/templates/hardware/assets/black-electronics-product-6-768x758.jpg", { compareAtPrice: 260, tags: ["wearable", "smart"] }),
  ];
  return {
    previewImage: "/templates/hardware/hero.jpg",
    homeSections: [
      block(`${source.slug}-hero`, "hero", {
        badge: "Electronics",
        heading: "Promotional banners, deals, and a large product grid",
        subheading: "A tech storefront with comparison-ready product cards, featured brands, and editorial promos.",
        buttonText: "Shop Deals",
        buttonHref: "/shop",
        secondaryButtonText: "Browse Tech",
        secondaryButtonHref: "/collections",
        bgStyle: "dark",
        bgImage: "/templates/hardware/hero.jpg",
      }),
      block(`${source.slug}-banners`, "imageHeroBanner", {
        items: [
          { image: "/templates/hardware/assets/hardware-black-slide-1-1536x736.jpg", title: "Big Tech Deals", subtitle: "New arrivals", buttonText: "Shop", buttonHref: "/shop" },
          { image: "/templates/hardware/assets/hardware-black-slide-2-860x412.jpg", title: "Featured Brands", subtitle: "Premium gear", buttonText: "Shop", buttonHref: "/shop" },
        ],
      }),
      block(`${source.slug}-categories`, "imageCategoryCards", {
        title: "Popular Categories",
        columns: 4,
        items: [
          { title: "Laptops", image: "/templates/hardware/assets/black-electronics-category-1-opt.jpg", href: "/collections" },
          { title: "Audio", image: "/templates/hardware/assets/black-electronics-category-2-opt.jpg", href: "/collections" },
          { title: "Gaming", image: "/templates/hardware/assets/black-electronics-category-3-opt.jpg", href: "/collections" },
          { title: "Accessories", image: "/templates/hardware/assets/black-electronics-pc-r-14.png", href: "/collections" },
        ],
      }),
      block(`${source.slug}-featured`, "featured_products", { title: "Featured Products", subtitle: "Conversion-friendly product grid", limit: 8, columns: 4, showFeatured: true }),
      block(`${source.slug}-split`, "promoSplit", {
        leftImages: [{ src: "/templates/hardware/assets/black-electronics-gallary-3-opt.jpg", title: "Studio setup" }],
        centerProducts: products.slice(0, 2).map(({ name, price, image, compareAtPrice }) => ({ name, price, image, compareAtPrice })),
        rightImages: [{ src: "/templates/hardware/assets/black-electronics-gallary-4-opt.jpg", title: "Tech detail" }],
      }),
      block(`${source.slug}-gallery`, "gallery", {
        title: "Tech Gallery",
        columns: 3,
        images: [
          { src: "/templates/hardware/assets/black-electronics-gallary-5-opt-480x339.jpg", alt: "Gallery 1" },
          { src: "/templates/hardware/assets/black-electronics-gallary-6-opt.jpg", alt: "Gallery 2" },
          { src: "/templates/hardware/assets/black-electronics-gallary-7-opt.jpg", alt: "Gallery 3" },
        ],
      }),
      block(`${source.slug}-brands`, "brands", { title: "Featured Brands", names: ["Sony", "Samsung", "LG", "JBL", "Dell"] }),
      block(`${source.slug}-testimonials`, "testimonials", {
        title: "Customer Reviews",
        bgColor: "surface",
        items: [
          { name: "Alex", role: "Verified Buyer", text: "The product cards feel like a real electronics store, not a placeholder." },
          { name: "Nia", role: "Power User", text: "The layout, spacing, and banner structure all match the tech reference vibe." },
        ],
      }),
      block(`${source.slug}-newsletter`, "newsletter", { title: "Get deal alerts", subtitle: "A real newsletter footer for launches and promotions." }),
    ],
    pages: pageSet(source, "Electronics for everyday and enthusiast shoppers", "A full tech storefront with large grids, banners, product comparison style content, and premium brand sections.", "/templates/hardware/hero.jpg"),
    media: [media("Electronics hero", "/templates/hardware/hero.jpg")],
    products,
    collections: [{ name: "Deals", slug: "deals", description: "Promoted tech products" }],
    blog: [{ title: "Tech Notes", slug: "tech-notes", excerpt: "Product news, launches, and buying guides." }],
    navigation: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Deals", href: "/shop" },
      { label: "Brands", href: "/collections" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: source.name, links: [{ label: "Shop", href: "/shop" }, { label: "Deals", href: "/shop" }, { label: "Contact", href: "/contact" }] },
        { heading: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Warranty", href: "/faq" }, { label: "Returns", href: "/faq" }] },
      ],
      copyright: `${source.name} Theme Package`,
    },
    menus: [{ name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Brands", href: "/collections" }, { label: "Contact", href: "/contact" }] }],
    forms: [{ name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] }],
  };
}

function buildKidsDesign(source: PackageSource): PackageDesign {
  const products = [
    product("Playful Jumper", "playful-jumper", 42, "/templates/kids/assets/w-bcs-jumpers-1-1.jpg", { compareAtPrice: 54, isFeatured: true, tags: ["kids", "clothing"] }),
    product("Dino Dress", "dino-dress", 36, "/templates/kids/assets/w-bcs-dresses-4-1.jpg", { compareAtPrice: 44, tags: ["kids", "dress"] }),
    product("Organic Growsuit", "organic-growsuit", 28, "/templates/kids/assets/w-bcs-growsuit-1-1.jpg", { compareAtPrice: 34, tags: ["baby", "organic"] }),
    product("Adventure Toy", "adventure-toy", 18, "/templates/kids/assets/w-bcs-toys-2-1.jpg", { compareAtPrice: 24, tags: ["toys", "play"] }),
    product("Snuggle Accessories", "snuggle-accessories", 16, "/templates/kids/assets/w-bcs-accessories-1-1.jpg", { compareAtPrice: 22, tags: ["accessories", "kids"] }),
  ];
  return {
    previewImage: "/templates/kids/hero.jpg",
    homeSections: [
      block(`${source.slug}-hero`, "hero", {
        badge: "Kids World",
        heading: "Playful, colorful, and parent-friendly shopping",
        subheading: "Age-based categories, toy collections, blog content, and a cheerful editable storefront.",
        buttonText: "Shop Now",
        buttonHref: "/shop",
        secondaryButtonText: "Parents Guide",
        secondaryButtonHref: "/about",
        bgStyle: "accent",
        bgImage: "/templates/kids/hero.jpg",
      }),
      block(`${source.slug}-categories`, "imageCategoryCards", {
        title: "Shop by Age",
        columns: 4,
        items: [
          { title: "Toys", image: "/templates/kids/assets/w-bcs-category-toys.jpg", href: "/collections" },
          { title: "Growsuits", image: "/templates/kids/assets/w-bcs-category-growsuit.jpg", href: "/collections" },
          { title: "Jumpers", image: "/templates/kids/assets/w-bcs-category-jumpers.jpg", href: "/collections" },
          { title: "Dresses", image: "/templates/kids/assets/w-bcs-category-dresses.jpg", href: "/collections" },
        ],
      }),
      block(`${source.slug}-featured`, "featured_products", { title: "Featured Products", subtitle: "Soft, safe, and bright merchandising.", limit: 8, columns: 4, showFeatured: true }),
      block(`${source.slug}-story`, "imageText", {
        title: "Built for families",
        text: "A kids template should feel friendly, playful, and trustworthy. The package includes playful images, blog content, and a strong storefront structure.",
        imagePosition: "right",
        buttonText: "Learn More",
        buttonHref: "/about",
        image: "/templates/kids/assets/w-bcs-blog-1-860x605.jpg",
      }),
      block(`${source.slug}-blog`, "gallery", {
        title: "Family Stories",
        columns: 3,
        images: [
          { src: "/templates/kids/assets/w-bcs-blog-1-860x605.jpg", alt: "Story 1" },
          { src: "/templates/kids/assets/w-bcs-blog-2-860x605.jpg", alt: "Story 2" },
          { src: "/templates/kids/assets/w-bcs-blog-3-860x605.jpg", alt: "Story 3" },
        ],
      }),
      block(`${source.slug}-newsletter`, "newsletter", { title: "Stay in the loop", subtitle: "Updates on new arrivals and family tips." }),
    ],
    pages: pageSet(source, "A playful template for children and baby brands", "A colorful, family-friendly storefront with category cards, bright product photography, blog content, and a trustworthy layout.", "/templates/kids/hero.jpg"),
    media: [media("Kids hero", "/templates/kids/hero.jpg")],
    products,
    collections: [{ name: "Toy Sets", slug: "toy-sets", description: "Playful toy and clothing bundles" }],
    blog: [{ title: "Parents Guide", slug: "parents-guide", excerpt: "Helpful content for families and kids brands." }],
    navigation: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: source.name, links: [{ label: "Shop", href: "/shop" }, { label: "Collections", href: "/collections" }, { label: "Blog", href: "/blog" }] },
        { heading: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Shipping", href: "/faq" }, { label: "Returns", href: "/faq" }] },
      ],
      copyright: `${source.name} Theme Package`,
    },
    menus: [{ name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Blog", href: "/blog" }, { label: "Contact", href: "/contact" }] }],
    forms: [{ name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] }],
  };
}

function buildRestaurantDesign(source: PackageSource, variant: "classic" | "modern"): PackageDesign {
  const heroImage = variant === "modern" ? "/templates/sites/nutrio/assets/images/homepage/restaurant.jpg" : "/templates/sites/bistro/assets/images/homepage/restaurant.jpg";
  const products = [
    product("Signature Starter", "signature-starter", 18, "/templates/sites/nutrio/assets/images/homepage/coffee.jpg", { compareAtPrice: 24, isFeatured: true, tags: ["menu", "starter"] }),
    product("Chef Special", "chef-special", 28, "/templates/sites/nutrio/assets/images/homepage/dinner.jpg", { compareAtPrice: 35, isFeatured: true, tags: ["menu", "main"] }),
    product("Dessert Plate", "dessert-plate", 14, "/templates/sites/nutrio/assets/images/homepage/dessert.jpg", { compareAtPrice: 18, tags: ["dessert"] }),
  ];
  return {
    previewImage: heroImage,
    homeSections: [
      block(`${source.slug}-hero`, "hero", {
        badge: "Restaurant",
        heading: variant === "modern" ? "Fresh, modern, and reservation-ready dining" : "Elegant dining experiences with a refined menu flow",
        subheading: "Reservation, menu, chef, gallery, testimonials, and contact sections all live in the package.",
        buttonText: "View Menu",
        buttonHref: "/menu",
        secondaryButtonText: "Reserve a Table",
        secondaryButtonHref: "/contact",
        bgStyle: variant === "modern" ? "accent" : "dark",
        bgImage: heroImage,
      }),
      block(`${source.slug}-menu`, "menu", {
        title: "Menu Highlights",
        subtitle: "A menu-led layout instead of a generic hero stack.",
      }),
      block(`${source.slug}-reservations`, "reservations", {
        title: "Reserve a Table",
        subtitle: "Bookings, events, and takeout requests.",
      }),
      block(`${source.slug}-chef`, "team", {
        title: "Chef & Team",
        subtitle: "Showcase the people behind the food.",
        members: [
          { name: "Chef Daniel", role: "Head Chef", bio: "Seasonal menus and plated precision." },
          { name: "Maya", role: "Restaurant Manager", bio: "Warm hospitality and service excellence." },
        ],
      }),
      block(`${source.slug}-gallery`, "gallery", {
        title: "Food Gallery",
        columns: 3,
        images: [
          { src: heroImage, alt: "Restaurant hero" },
          { src: "/templates/sites/nutrio/assets/images/homepage/dessert.jpg", alt: "Dessert" },
          { src: "/templates/sites/nutrio/assets/images/homepage/wine.jpeg", alt: "Wine" },
        ],
      }),
      block(`${source.slug}-testimonials`, "testimonials", { title: "Guest Stories", bgColor: "surface", items: [] }),
      block(`${source.slug}-contact`, "contactInfo", {
        title: "Visit Us",
        items: [
          { icon: "map-pin", title: "Address", value: "123 Culinary Avenue" },
          { icon: "phone", title: "Phone", value: "+1 (555) 321-9876" },
          { icon: "clock", title: "Hours", value: "Mon-Sun 11AM - 11PM" },
        ],
      }),
    ],
    pages: pageSet(source, variant === "modern" ? "Modern dining with clean editorial sections" : "Fine dining with chef-led storytelling", "Menu, reservations, chef story, gallery, testimonials, and contact sections all remain editable.", heroImage),
    media: [media(`${source.name} hero`, heroImage)],
    products,
    collections: [{ name: "Menu", slug: "menu", description: "Restaurant menu items" }],
    blog: [{ title: "Kitchen Notes", slug: "kitchen-notes", excerpt: "Chef stories and restaurant updates." }],
    navigation: [
      { label: "Home", href: "/" },
      { label: "Menu", href: "/menu" },
      { label: "Reservations", href: "/contact" },
      { label: "Gallery", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: source.name, links: [{ label: "Menu", href: "/menu" }, { label: "Reservations", href: "/contact" }, { label: "Contact", href: "/contact" }] },
        { heading: "Info", links: [{ label: "FAQ", href: "/faq" }, { label: "Hours", href: "/faq" }, { label: "Location", href: "/contact" }] },
      ],
      copyright: `${source.name} Theme Package`,
    },
    menus: [{ name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Menu", href: "/menu" }, { label: "Reservations", href: "/contact" }, { label: "Contact", href: "/contact" }] }],
    forms: [{ name: "Reservation Form", slug: "reservation", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] }],
  };
}

function buildBeautyDesign(source: PackageSource): PackageDesign {
  const products = [
    product("Glow Serum", "glow-serum", 48, "/templates/fashion-colored/assets/fashion-colored-product-6-263x300.jpg", { compareAtPrice: 60, isFeatured: true, tags: ["skincare"] }),
    product("Velvet Palette", "velvet-palette", 55, "/templates/fashion-colored/assets/fashion-product-1-2-430x490.jpg", { compareAtPrice: 72, tags: ["makeup"] }),
    product("Radiance Cream", "radiance-cream", 44, "/templates/fashion-colored/assets/fashion-colored-product-3-263x300.jpg", { compareAtPrice: 56, tags: ["skincare"] }),
    product("Silk Mist", "silk-mist", 38, "/templates/fashion-colored/assets/fashion-product-10-2-263x300.jpg", { compareAtPrice: 48, tags: ["fragrance"] }),
  ];
  return buildLuxuryCommerce(source, {
    heroImage: "/templates/fashion-colored/assets/slider-colored-fashion-9-1536x640.jpg",
    categoryImages: [
      { title: "Skincare", image: "/templates/fashion-colored/assets/wd-inst-fashion-colored-1-430x430.jpg", href: "/collections" },
      { title: "Makeup", image: "/templates/fashion-colored/assets/wd-inst-fashion-colored-3.jpg", href: "/collections" },
      { title: "Fragrance", image: "/templates/fashion-colored/assets/wd-inst-fashion-colored-4.jpg", href: "/collections" },
      { title: "Body Care", image: "/templates/fashion-colored/assets/wd-inst-fashion-colored-6-430x430.jpg", href: "/collections" },
    ],
    products,
    gallery: [
      { src: "/templates/fashion-colored/assets/wd-inst-fashion-colored-5-300x300.jpg", alt: "Beauty 1" },
      { src: "/templates/fashion-colored/assets/wd-inst-fashion-colored-7-300x300.jpg", alt: "Beauty 2" },
      { src: "/templates/fashion-colored/assets/wd-inst-fashion-colored-8-430x430.jpg", alt: "Beauty 3" },
      { src: "/templates/fashion-colored/assets/wd-inst-fashion-colored-2.jpg", alt: "Beauty 4" },
    ],
    brandLogos: ["Rose", "Lune", "Aura", "Bloom"],
    previewImage: "/templates/fashion-colored/assets/slider-colored-fashion-9-1-1536x640.jpg",
    headline: "Beauty with premium merchandising and editorial polish",
    subheading: "Skincare-first layouts, premium product cards, and an Instagram-like gallery flow.",
  });
}

function buildHandmadeDesign(source: PackageSource): PackageDesign {
  const products = [
    product("Hand-thrown Mug", "hand-thrown-mug", 28, "/templates/jewellery/promo/left-2.jpg", { compareAtPrice: 36, isFeatured: true, tags: ["ceramics"] }),
    product("Studio Bowl", "studio-bowl", 34, "/templates/jewellery/promo/right-2.webp", { compareAtPrice: 42, tags: ["ceramics"] }),
    product("Craft Necklace", "craft-necklace", 48, "/templates/jewellery/products/button-pearl.webp", { compareAtPrice: 60, tags: ["handmade", "jewelry"] }),
    product("Art Print", "art-print", 22, "/templates/jewellery/prefooter/about-us.webp", { compareAtPrice: 28, tags: ["art"] }),
  ];
  return buildLuxuryCommerce(source, {
    heroImage: "/templates/jewellery/prefooter/showrooms.webp",
    categoryImages: [
      { title: "Ceramics", image: "/templates/jewellery/promo/left-1.webp", href: "/collections" },
      { title: "Jewelry", image: "/templates/jewellery/categories/earrings.webp", href: "/collections" },
      { title: "Prints", image: "/templates/jewellery/prefooter/collections.webp", href: "/collections" },
      { title: "Studio Goods", image: "/templates/jewellery/prefooter/packages.webp", href: "/collections" },
    ],
    products,
    gallery: [
      { src: "/templates/jewellery/promo/left-1.webp", alt: "Handmade 1" },
      { src: "/templates/jewellery/promo/right-1.webp", alt: "Handmade 2" },
      { src: "/templates/jewellery/promo/left-2.jpg", alt: "Handmade 3" },
      { src: "/templates/jewellery/promo/right-2.webp", alt: "Handmade 4" },
    ],
    brandLogos: ["Clay", "Thread", "Studio", "Craft"],
    previewImage: "/templates/jewellery/prefooter/packages.webp",
    headline: "Arts & Handmade with a crafted editorial feel",
    subheading: "A tactile storefront with story-driven merchandising, maker showcases, and gallery-led sections.",
  });
}

function buildBeverageDesign(source: PackageSource): PackageDesign {
  const products = [
    product("Reserve Red", "reserve-red", 55, "/templates/wine/assets/wine-product-1-450x650.png", { compareAtPrice: 68, isFeatured: true, tags: ["wine"] }),
    product("Classic White", "classic-white", 42, "/templates/wine/assets/wine-product-2-450x650.png", { compareAtPrice: 52, tags: ["wine"] }),
    product("Rosé Blend", "rose-blend", 48, "/templates/wine/assets/wine-product-3-450x650.png", { compareAtPrice: 58, tags: ["wine"] }),
    product("Vintage Bottle", "vintage-bottle", 72, "/templates/wine/assets/wine-product-4-450x650.png", { compareAtPrice: 88, isFeatured: true, tags: ["wine"] }),
  ];
  return buildLuxuryCommerce(source, {
    heroImage: "/templates/wine/assets/wine-sleder-bg-1-opt.jpg",
    categoryImages: [
      { title: "Red Wine", image: "/templates/wine/assets/wine-red-wine-left-img-1-860x495.jpg", href: "/collections" },
      { title: "White Wine", image: "/templates/wine/assets/wine-gen-img-1.jpg", href: "/collections" },
      { title: "Accessories", image: "/templates/wine/assets/wine-bottle-flangship-min.jpg", href: "/collections" },
      { title: "Gifts", image: "/templates/wine/assets/wine-sommelier-img-1.png", href: "/collections" },
    ],
    products,
    gallery: [
      { src: "/templates/wine/assets/wine-red-wine-left-img-1-860x495.jpg", alt: "Wine 1" },
      { src: "/templates/wine/assets/wine-gen-img-1.jpg", alt: "Wine 2" },
      { src: "/templates/wine/assets/wine-bottle-flangship-min.jpg", alt: "Wine 3" },
      { src: "/templates/wine/assets/wine-sommelier-img-1.png", alt: "Wine 4" },
    ],
    brandLogos: ["Vine", "Reserve", "Cellar", "Estate"],
    previewImage: "/templates/wine/assets/wine-slider-1-img-min-1.jpg",
    headline: "A polished beverage storefront with cellar-style merchandising",
    subheading: "Wine and beverage templates with premium bottles, collections, and editorial product storytelling.",
  });
}

function buildBakeryDesign(source: PackageSource): PackageDesign {
  const products = [
    product("Sourdough Loaf", "sourdough-loaf", 9, "/templates/sites/nutrio/assets/images/homepage/breakfast.jpg", { compareAtPrice: 12, isFeatured: true, tags: ["bread", "bakery"] }),
    product("Berry Tart", "berry-tart", 7, "/templates/sites/nutrio/assets/images/homepage/dessert.jpg", { compareAtPrice: 9, tags: ["dessert"] }),
    product("Morning Bun", "morning-bun", 5, "/templates/sites/nutrio/assets/images/homepage/coffee.jpg", { compareAtPrice: 7, tags: ["pastry"] }),
    product("Family Cake", "family-cake", 22, "/templates/sites/nutrio/assets/images/homepage/dinner.jpg", { compareAtPrice: 28, isFeatured: true, tags: ["cake"] }),
  ];
  return {
    previewImage: "/templates/sites/nutrio/assets/images/homepage/hero.png",
    homeSections: [
      block(`${source.slug}-hero`, "hero", {
        badge: "Bakery",
        heading: "Fresh bakes, daily specials, and pickup-friendly shopping",
        subheading: "A bakery-specific homepage with menu highlights, reservations, gallery, and editorial food storytelling.",
        buttonText: "See Specials",
        buttonHref: "/shop",
        secondaryButtonText: "Order Pickup",
        secondaryButtonHref: "/contact",
        bgStyle: "light",
        bgImage: "/templates/sites/nutrio/assets/images/homepage/hero.png",
      }),
      block(`${source.slug}-specials`, "banner", {
        title: "Daily specials and house favourites",
        subtitle: "A warm bakery banner section that feels like the reference site.",
        buttonText: "View Menu",
        buttonHref: "/menu",
      }),
      block(`${source.slug}-products`, "featured_products", { title: "Fresh Products", subtitle: "Bread, cakes, and pastries.", limit: 8, columns: 4, showFeatured: true }),
      block(`${source.slug}-menu`, "menu", { title: "Menu", subtitle: "Breakfast, lunch, desserts, and drinks." }),
      block(`${source.slug}-chef`, "team", {
        title: "Bakers & Chefs",
        members: [
          { name: "Chef Rosa", role: "Head Baker", bio: "Daily bread and pastry production." },
          { name: "Amina", role: "Kitchen Lead", bio: "Seasonal specials and custom orders." },
        ],
      }),
      block(`${source.slug}-gallery`, "gallery", {
        title: "Fresh From the Oven",
        columns: 3,
        images: [
          { src: "/templates/sites/nutrio/assets/images/homepage/breakfast.jpg", alt: "Breakfast" },
          { src: "/templates/sites/nutrio/assets/images/homepage/dessert.jpg", alt: "Dessert" },
          { src: "/templates/sites/nutrio/assets/images/homepage/coffee.jpg", alt: "Coffee" },
        ],
      }),
      block(`${source.slug}-reservations`, "reservations", { title: "Reservation or pickup", subtitle: "Order custom cakes, seasonal boxes, or weekday pickup." }),
      block(`${source.slug}-contact`, "contactForm", { title: "Contact the bakery", subtitle: "Capture special orders without breaking the design flow." }),
    ],
    pages: pageSet(source, "Fresh bakery experiences with menu and pickup flow", "A warm bakery template with fresh bread cards, menu, chef, reservation, and gallery sections.", "/templates/sites/nutrio/assets/images/homepage/hero.png"),
    media: [media("Bakery hero", "/templates/sites/nutrio/assets/images/homepage/hero.png")],
    products,
    collections: [{ name: "Fresh Bread", slug: "fresh-bread", description: "Freshly baked loaves and pastries" }],
    blog: [{ title: "Baking Journal", slug: "baking-journal", excerpt: "Recipes, behind-the-scenes, and seasonal specials." }],
    navigation: [
      { label: "Home", href: "/" },
      { label: "Menu", href: "/menu" },
      { label: "Reservations", href: "/contact" },
      { label: "Gallery", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: source.name, links: [{ label: "Menu", href: "/menu" }, { label: "Shop", href: "/shop" }, { label: "Contact", href: "/contact" }] },
        { heading: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Pickup", href: "/contact" }, { label: "Catering", href: "/contact" }] },
      ],
      copyright: `${source.name} Theme Package`,
    },
    menus: [{ name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Menu", href: "/menu" }, { label: "Shop", href: "/shop" }, { label: "Contact", href: "/contact" }] }],
    forms: [{ name: "Order Form", slug: "order", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] }],
  };
}

function buildHealthDesign(source: PackageSource): PackageDesign {
  const heroImage = "/templates/sites/medicare/assets/img/health/showcase-5.webp";
  return simpleTemplate(source, {
    previewImage: heroImage,
    heroImage,
    tagline: "Health",
    heading: "Wellness and pharmacy storefront with a calm, trustworthy feel",
    subheading: "A health-focused ecommerce template with service highlights, product grids, FAQ, and contact sections.",
    buttons: { primary: "Shop Health", secondary: "Learn More" },
    sections: [
      block(`${source.slug}-services`, "features", {
        title: "Health Services",
        items: [
          { icon: "shield", title: "Trusted Care", description: "Reliable wellness and pharmacy merchandising." },
          { icon: "heart", title: "Wellness First", description: "Customer-friendly product discovery and support." },
          { icon: "truck", title: "Delivery", description: "Fast fulfillment and local delivery details." },
          { icon: "zap", title: "Fast Ordering", description: "Clear shopping flow for repeat customers." },
        ],
      }),
      block(`${source.slug}-products`, "featured_products", { title: "Featured Products", subtitle: "Health products and wellness essentials.", limit: 8, columns: 4, showFeatured: true }),
      block(`${source.slug}-faq`, "faq", { title: "FAQ", items: [] }),
      block(`${source.slug}-contact`, "contactForm", { title: "Contact the pharmacy", subtitle: "Questions about products, delivery, or support." }),
    ],
    navigation: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Health Guide", href: "/services" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      columns: [
        { heading: source.name, links: [{ label: "Shop", href: "/shop" }, { label: "Health Guide", href: "/services" }, { label: "Contact", href: "/contact" }] },
        { heading: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Delivery", href: "/contact" }, { label: "Returns", href: "/faq" }] },
      ],
      copyright: `${source.name} Theme Package`,
    },
    menus: [{ name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Health Guide", href: "/services" }, { label: "Contact", href: "/contact" }] }],
    forms: [{ name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] }],
  });
}

function simpleTemplate(source: PackageSource, options: {
  previewImage?: string;
  heroImage?: string;
  heading: string;
  subheading: string;
  tagline?: string;
  buttons?: { primary: string; secondary?: string };
  sections?: BuilderBlock[];
  products?: ThemePackageProduct[];
  collections?: ThemePackageCollection[];
  blog?: Array<{ title: string; slug: string; excerpt?: string }>;
  navigation?: Array<{ label: string; href: string }>;
  footer?: PackageDesign["footer"];
  menus?: PackageDesign["menus"];
  forms?: PackageDesign["forms"];
  media?: ThemePackageMediaAsset[];
}) {
  return {
    previewImage: options.previewImage || options.heroImage,
    homeSections: [
      block(`${source.slug}-hero`, "hero", {
        badge: options.tagline || source.name,
        heading: options.heading,
        subheading: options.subheading,
        buttonText: options.buttons?.primary || "Explore",
        buttonHref: "/shop",
        secondaryButtonText: options.buttons?.secondary,
        secondaryButtonHref: "/contact",
        bgStyle: "dark",
        bgImage: options.heroImage,
      }),
      ...(options.sections || []),
    ],
    pages: pageSet(source, options.heading, options.subheading, options.heroImage),
    products: options.products,
    collections: options.collections,
    blog: options.blog,
    navigation: options.navigation || [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    footer: options.footer || {
      columns: [
        { heading: source.name, links: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
        { heading: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Contact", href: "/contact" }, { label: "Blog", href: "/blog" }] },
      ],
      copyright: `${source.name} Theme Package`,
    },
    menus: options.menus || [{ name: "Main Menu", slug: "main-menu", items: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] }],
    forms: options.forms || [{ name: "Contact Form", slug: "contact", fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }] }],
    media: options.media,
  } satisfies PackageDesign;
}

function buildLandingAegisDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/jewellery/prefooter/showrooms.webp",
    heroImage: "/templates/jewellery/prefooter/about-us.webp",
    tagline: "Aegis",
    heading: "Trust-first advocacy and healthcare landing page",
    subheading: "A calm, polished landing page with impact stats, service cards, testimonials, and clear calls to action.",
    buttons: { primary: "Get Started", secondary: "Learn More" },
    sections: [
      block(`${source.slug}-stats`, "stats", { title: "Our Impact", items: [{ value: "50K+", label: "Lives impacted" }, { value: "200+", label: "Programs" }, { value: "98%", label: "Satisfaction" }, { value: "15", label: "Years" }] }),
      block(`${source.slug}-services`, "features", { title: "Our Services", items: [{ icon: "heart", title: "Care" }, { icon: "shield", title: "Safety" }, { icon: "users", title: "Community" }, { icon: "globe", title: "Outreach" }] }),
      block(`${source.slug}-testimonials`, "testimonials", { title: "Testimonials", bgColor: "surface", items: [] }),
      block(`${source.slug}-cta`, "banner", { title: "Join the movement", subtitle: "Make a difference today.", buttonText: "Donate", buttonHref: "#contact" }),
    ],
    navigation: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Programs", href: "/services" }, { label: "Contact", href: "/contact" }],
  });
}

function buildLandingNajafDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/landing-saas-minimal/assets/images/hero.png",
    heroImage: "/templates/sites/landing-saas-minimal/assets/images/hero.png",
    tagline: "Najaf AI",
    heading: "Minimal AI product launch page",
    subheading: "Dark, minimal, and conversion-focused with a technical edge and pricing section.",
    buttons: { primary: "Start Free", secondary: "Watch Demo" },
    sections: [
      block(`${source.slug}-features`, "features", { title: "Everything You Need", items: [{ icon: "zap", title: "Fast" }, { icon: "sparkles", title: "AI" }, { icon: "shield", title: "Secure" }, { icon: "globe", title: "Global" }] }),
      block(`${source.slug}-pricing`, "features", { title: "Pricing", items: [{ icon: "check", title: "Free" }, { icon: "star", title: "Pro" }, { icon: "rocket", title: "Enterprise" }] }),
      block(`${source.slug}-faq`, "faq", { title: "Frequently Asked Questions", items: [] }),
    ],
    navigation: [{ label: "Features", href: "/services" }, { label: "Pricing", href: "/pricing" }, { label: "FAQ", href: "/faq" }, { label: "Contact", href: "/contact" }],
    media: [
      media("hero", "/templates/sites/landing-saas-minimal/assets/images/hero.png", "Najaf AI hero"),
    ],
  });
}

function buildLandingAurapodDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/landing-wellness/assets/images/hero.png",
    heroImage: "/templates/sites/landing-wellness/assets/images/hero.png",
    tagline: "AuraPod",
    heading: "Ambient wellness tech with a premium glow",
    subheading: "Soft gradients, biometric trust, and a calm wellness narrative.",
    buttons: { primary: "Order Now", secondary: "How It Works" },
    sections: [
      block(`${source.slug}-science`, "stats", { title: "The science", items: [] }),
      block(`${source.slug}-features`, "imageText", { title: "Features", image: "/templates/sites/landing-wellness/assets/images/feature.png", imagePosition: "right" }),
      block(`${source.slug}-reviews`, "testimonials", { title: "Reviews", bgColor: "surface", items: [] }),
    ],
    navigation: [{ label: "Features", href: "/services" }, { label: "Science", href: "/science" }, { label: "Reviews", href: "/reviews" }],
    media: [
      media("hero", "/templates/sites/landing-wellness/assets/images/hero.png", "AuraPod hero"),
      media("feature", "/templates/sites/landing-wellness/assets/images/feature.png", "AuraPod feature"),
    ],
  });
}

function buildLandingArtsPortfolioDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/landing-dev-portfolio/assets/images/design.jpg",
    heroImage: "/templates/sites/landing-dev-portfolio/assets/images/hero.jpg",
    tagline: "Arts Portfolio",
    heading: "Illustration portfolio with editorial personality",
    subheading: "Creative, warm, and playful with gallery-led storytelling and bold typography.",
    buttons: { primary: "View Portfolio", secondary: "Get in Touch" },
    sections: [
      block(`${source.slug}-portfolio`, "gallery", { title: "Selected Works", columns: 3, items: [
        { image: "/templates/sites/landing-dev-portfolio/assets/images/design.jpg", title: "Design Work" },
        { image: "/templates/sites/landing-dev-portfolio/assets/images/photography.jpg", title: "Photography" },
        { image: "/templates/sites/landing-dev-portfolio/assets/images/forest.jpg", title: "Nature Series" },
      ] }),
      block(`${source.slug}-about`, "imageText", { title: "About the artist", text: "Creative storytelling through illustration, character design, and animation.", image: "/templates/sites/landing-dev-portfolio/assets/images/editing.jpg", imagePosition: "right" }),
      block(`${source.slug}-testimonials`, "testimonials", { title: "Kind Words", bgColor: "surface", items: [] }),
    ],
    media: [
      media("hero", "/templates/sites/landing-dev-portfolio/assets/images/hero.jpg", "Portfolio hero"),
      media("design", "/templates/sites/landing-dev-portfolio/assets/images/design.jpg", "Design work"),
      media("photography", "/templates/sites/landing-dev-portfolio/assets/images/photography.jpg", "Photography"),
      media("forest", "/templates/sites/landing-dev-portfolio/assets/images/forest.jpg", "Nature series"),
      media("editing", "/templates/sites/landing-dev-portfolio/assets/images/editing.jpg", "Editing"),
    ],
  });
}

function buildLandingDevPortfolioDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/landing-dev-portfolio/assets/images/hero.jpg",
    heroImage: "/templates/sites/landing-dev-portfolio/assets/images/hero.jpg",
    tagline: "Developer Portfolio",
    heading: "A clean developer portfolio with sharp focus",
    subheading: "Dark, minimal, and performance-minded with projects and skills sections.",
    buttons: { primary: "View Projects", secondary: "Contact Me" },
    sections: [
      block(`${source.slug}-projects`, "gallery", { title: "Projects", columns: 3, items: [
        { image: "/templates/sites/landing-dev-portfolio/assets/images/design.jpg", title: "Web Design" },
        { image: "/templates/sites/landing-dev-portfolio/assets/images/editing.jpg", title: "Video Editing" },
        { image: "/templates/sites/landing-dev-portfolio/assets/images/photography.jpg", title: "Photography" },
      ] }),
      block(`${source.slug}-skills`, "features", { title: "Tech Stack", items: [{ icon: "code", title: "React" }, { icon: "server", title: "Node.js" }, { icon: "database", title: "PostgreSQL" }, { icon: "cloud", title: "AWS" }] }),
      block(`${source.slug}-contact`, "contactForm", { title: "Get in touch" }),
    ],
    media: [
      media("hero", "/templates/sites/landing-dev-portfolio/assets/images/hero.jpg", "Developer portrait"),
      media("design", "/templates/sites/landing-dev-portfolio/assets/images/design.jpg", "Design project"),
      media("editing", "/templates/sites/landing-dev-portfolio/assets/images/editing.jpg", "Editing project"),
      media("photography", "/templates/sites/landing-dev-portfolio/assets/images/photography.jpg", "Photography project"),
      media("forest", "/templates/sites/landing-dev-portfolio/assets/images/forest.jpg", "Nature project"),
    ],
  });
}

function buildLandingToyboxDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/landing-kids/assets/images/banner.jpg",
    heroImage: "/templates/sites/landing-kids/assets/images/banner.jpg",
    tagline: "Toybox",
    heading: "Playful kids subscription landing page",
    subheading: "Bright, friendly, and parent-first with toy boxes, featured picks, and FAQs.",
    buttons: { primary: "Subscribe Now", secondary: "See Boxes" },
    sections: [
      block(`${source.slug}-boxes`, "imageCategoryCards", { title: "Boxes", columns: 4, items: [
        { image: "/templates/sites/landing-kids/assets/images/image-01.jpg", title: "Starter Box" },
        { image: "/templates/sites/landing-kids/assets/images/image-02.jpg", title: "Explorer Box" },
        { image: "/templates/sites/landing-kids/assets/images/image-03.jpg", title: "Creative Box" },
        { image: "/templates/sites/landing-kids/assets/images/image-04.jpg", title: "Adventure Box" },
      ] }),
      block(`${source.slug}-faq`, "faq", { title: "Questions", items: [] }),
      block(`${source.slug}-newsletter`, "newsletter", { title: "Join the list" }),
    ],
    media: [
      media("banner", "/templates/sites/landing-kids/assets/images/banner.jpg", "Toybox banner"),
      media("box-1", "/templates/sites/landing-kids/assets/images/image-01.jpg", "Starter box"),
      media("box-2", "/templates/sites/landing-kids/assets/images/image-02.jpg", "Explorer box"),
      media("box-3", "/templates/sites/landing-kids/assets/images/image-03.jpg", "Creative box"),
      media("box-4", "/templates/sites/landing-kids/assets/images/image-04.jpg", "Adventure box"),
    ],
  });
}

function buildLandingPixaPageDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/landing-tech-saas/assets/images/logo.png",
    heroImage: "/templates/sites/landing-tech-saas/assets/images/person-1.jpg",
    tagline: "PixaPage SaaS",
    heading: "SaaS landing page with a conversion-first flow",
    subheading: "Pricing, features, testimonials, and a strong product narrative.",
    buttons: { primary: "Start Free", secondary: "See Pricing" },
    sections: [
      block(`${source.slug}-features`, "features", { title: "Features", items: [{ icon: "zap", title: "Lightning Fast" }, { icon: "shield", title: "Enterprise Security" }, { icon: "users", title: "Team Collaboration" }, { icon: "bar-chart", title: "Analytics" }] }),
      block(`${source.slug}-pricing`, "features", { title: "Pricing", items: [{ icon: "check", title: "Free" }, { icon: "star", title: "Pro — $29/mo" }, { icon: "rocket", title: "Enterprise" }] }),
      block(`${source.slug}-testimonials`, "testimonials", { title: "Testimonials", bgColor: "surface", items: [
        { quote: "PixaPage transformed our workflow.", author: "Sarah Chen", image: "/templates/sites/landing-tech-saas/assets/images/person-2.jpg" },
        { quote: "Best SaaS tool we've used.", author: "Marcus Johnson", image: "/templates/sites/landing-tech-saas/assets/images/person-3.jpg" },
      ] }),
    ],
    media: [
      media("logo", "/templates/sites/landing-tech-saas/assets/images/logo.png", "PixaPage logo"),
      media("person-1", "/templates/sites/landing-tech-saas/assets/images/person-1.jpg", "Team member"),
      media("person-2", "/templates/sites/landing-tech-saas/assets/images/person-2.jpg", "Testimonial author"),
      media("person-3", "/templates/sites/landing-tech-saas/assets/images/person-3.jpg", "Testimonial author"),
    ],
  });
}

function buildLandingTravelerDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/landing-travel/assets/images/phone.png",
    heroImage: "/templates/sites/landing-travel/assets/images/phone.png",
    tagline: "Traveler Startup",
    heading: "Travel startup landing page for discovery and booking",
    subheading: "Destinations, experiences, and a crisp signup flow.",
    buttons: { primary: "Explore Destinations", secondary: "Plan a Trip" },
    sections: [
      block(`${source.slug}-destinations`, "gallery", { title: "Destinations", columns: 3 }),
      block(`${source.slug}-experiences`, "features", { title: "Experiences", items: [{ icon: "map", title: "Curated Routes" }, { icon: "compass", title: "Local Guides" }, { icon: "camera", title: "Photo Spots" }, { icon: "star", title: "Reviews" }] }),
      block(`${source.slug}-contact`, "contactForm", { title: "Book now" }),
    ],
    media: [
      media("phone", "/templates/sites/landing-travel/assets/images/phone.png", "Travel app on phone"),
      media("logo", "/templates/sites/landing-travel/assets/images/logo.png", "Traveler logo"),
    ],
  });
}

function buildCorporateDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/jewellery/prefooter/collections.webp",
    heroImage: "/templates/jewellery/prefooter/showrooms.webp",
    tagline: "Corporate",
    heading: "Corporate consulting with enterprise polish",
    subheading: "Strategy, services, and proof points in a modern business layout.",
    buttons: { primary: "Get Started", secondary: "Learn More" },
    sections: [block(`${source.slug}-services`, "features", { title: "Services", items: [] }), block(`${source.slug}-stats`, "stats", { title: "Impact", items: [] }), block(`${source.slug}-contact`, "contactForm", { title: "Contact" })],
  });
}

function buildLawyerDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/lawyer-corporate/hero.jpg",
    heroImage: "/templates/lawyer-corporate/office.jpg",
    tagline: "Lawyer",
    heading: "Trusted legal counsel with a premium feel",
    subheading: "Practice areas, case results, attorney profiles, and consultations.",
    buttons: { primary: "Free Consultation", secondary: "Practice Areas" },
    sections: [block(`${source.slug}-practice`, "features", { title: "Practice Areas", items: [] }), block(`${source.slug}-team`, "team", { title: "Attorneys", members: [] }), block(`${source.slug}-contact`, "contactForm", { title: "Consultation" })],
  });
}

function buildRealEstateDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/jewellery/prefooter/showrooms.webp",
    heroImage: "/templates/jewellery/prefooter/about-us.webp",
    tagline: "Real Estate",
    heading: "Property discovery and lead capture",
    subheading: "Listings, agents, and premium lead generation for property sites.",
    buttons: { primary: "Browse Properties", secondary: "Contact an Agent" },
    sections: [block(`${source.slug}-properties`, "gallery", { title: "Properties", columns: 3 }), block(`${source.slug}-agents`, "team", { title: "Agents", members: [] }), block(`${source.slug}-contact`, "contactForm", { title: "Contact" })],
  });
}

function buildClarityDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/clarity/assets/img/misc/misc-16.webp",
    heroImage: "/templates/sites/clarity/assets/img/misc/misc-16.webp",
    tagline: "Clarity",
    heading: "Digital agency with crisp editorial structure",
    subheading: "Services, portfolio, team, testimonials, and lead capture.",
    buttons: { primary: "Get Started", secondary: "Our Work" },
    sections: [block(`${source.slug}-services`, "features", { title: "Services", items: [] }), block(`${source.slug}-portfolio`, "gallery", { title: "Portfolio", columns: 3 }), block(`${source.slug}-testimonials`, "testimonials", { title: "Testimonials", bgColor: "surface", items: [] })],
  });
}

function buildAgencyDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/arsha/assets/img/hero-img.png",
    heroImage: "/templates/sites/arsha/assets/img/hero-img.png",
    tagline: "Agency",
    heading: "Modern agency landing page",
    subheading: "Services, case studies, team, and conversion-focused CTAs.",
    buttons: { primary: "Our Services", secondary: "See Results" },
    sections: [block(`${source.slug}-services`, "features", { title: "Services", items: [] }), block(`${source.slug}-cases`, "features", { title: "Case Studies", items: [] }), block(`${source.slug}-contact`, "contactForm", { title: "Contact" })],
  });
}

function buildPortfolioDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/jewellery/prefooter/about-us.webp",
    heroImage: "/templates/jewellery/prefooter/showrooms.webp",
    tagline: "Portfolio",
    heading: "Creative portfolio with strong visuals",
    subheading: "Projects, skills, and about sections wrapped in a clean layout.",
    buttons: { primary: "View Projects", secondary: "About" },
    sections: [block(`${source.slug}-projects`, "gallery", { title: "Projects", columns: 3 }), block(`${source.slug}-skills`, "features", { title: "Skills", items: [] }), block(`${source.slug}-contact`, "contactForm", { title: "Contact" })],
  });
}

function buildHealthcareDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/medicare/assets/img/health/showcase-5.webp",
    heroImage: "/templates/sites/medicare/assets/img/health/showcase-5.webp",
    tagline: "Healthcare",
    heading: "Healthcare provider with patient-first storytelling",
    subheading: "Services, doctors, FAQ, and appointment booking.",
    buttons: { primary: "Schedule a Visit", secondary: "View Programs" },
    sections: [block(`${source.slug}-services`, "features", { title: "Services", items: [] }), block(`${source.slug}-doctors`, "team", { title: "Doctors", members: [] }), block(`${source.slug}-appointment`, "contactForm", { title: "Appointment" })],
  });
}

function buildClinicDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/jewellery/prefooter/showrooms.webp",
    heroImage: "/templates/jewellery/prefooter/about-us.webp",
    tagline: "Clinic",
    heading: "Clinic and appointment booking template",
    subheading: "Doctors, services, FAQ, and clear appointment actions.",
    buttons: { primary: "Book Appointment", secondary: "View Departments" },
    sections: [block(`${source.slug}-departments`, "features", { title: "Departments", items: [] }), block(`${source.slug}-doctors`, "team", { title: "Doctors", members: [] }), block(`${source.slug}-contact`, "contactForm", { title: "Contact" })],
  });
}

function buildTravelDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/sites/travely/assets/img/travel/showcase-7.webp",
    heroImage: "/templates/sites/travely/assets/img/travel/showcase-7.webp",
    tagline: "Travel",
    heading: "Travel agency with destination-led storytelling",
    subheading: "Destinations, experiences, testimonials, and bookings.",
    buttons: { primary: "Explore Destinations", secondary: "Plan Your Trip" },
    sections: [block(`${source.slug}-destinations`, "gallery", { title: "Destinations", columns: 3 }), block(`${source.slug}-experiences`, "features", { title: "Experiences", items: [] }), block(`${source.slug}-contact`, "contactForm", { title: "Book a Trip" })],
  });
}

function buildEducationDesign(source: PackageSource): PackageDesign {
  return simpleTemplate(source, {
    previewImage: "/templates/melody-education/hero.jpg",
    heroImage: "/templates/melody-education/hero.jpg",
    tagline: "Education",
    heading: "Academy and course landing page",
    subheading: "Courses, instructors, FAQ, and contact flow for education brands.",
    buttons: { primary: "Browse Courses", secondary: "Learn More" },
    sections: [block(`${source.slug}-courses`, "features", { title: "Courses", items: [] }), block(`${source.slug}-instructors`, "team", { title: "Instructors", members: [] }), block(`${source.slug}-faq`, "faq", { title: "FAQ", items: [] })],
  });
}

export function getPackageDesign(source: PackageSource): PackageDesign {
  switch (source.slug) {
    case "accessories":
      return buildJewelleryDesign(source);
    case "fashion":
      return buildFashionDesign(source);
    case "food-grocery":
      return buildGroceryDesign(source);
    case "beauty":
      return buildBeautyDesign(source);
    case "health":
      return buildHealthDesign(source);
    case "arts-handmade":
      return buildHandmadeDesign(source);
    case "electronics":
      return buildElectronicsDesign(source);
    case "children":
      return buildKidsDesign(source);
    case "interior-design":
      return buildLuxuryCommerce(source, {
    heroImage: "/templates/sites/landing-gadget/hero.jpg",
        categoryImages: [
          { title: "Living Room", image: "/templates/jewellery/prefooter/showrooms.webp", href: "/collections" },
          { title: "Dining", image: "/templates/jewellery/prefooter/collections.webp", href: "/collections" },
          { title: "Bedroom", image: "/templates/jewellery/prefooter/about-us.webp", href: "/collections" },
          { title: "Decor", image: "/templates/jewellery/prefooter/packages.webp", href: "/collections" },
        ],
        products: [
          product("Designer Chair", "designer-chair", 280, "/templates/jewellery/prefooter/showrooms.webp", { compareAtPrice: 340, isFeatured: true }),
          product("Marble Lamp", "marble-lamp", 120, "/templates/jewellery/prefooter/about-us.webp", { compareAtPrice: 150 }),
          product("Accent Table", "accent-table", 190, "/templates/jewellery/prefooter/collections.webp", { compareAtPrice: 230 }),
        ],
        gallery: [
          { src: "/templates/jewellery/prefooter/showrooms.webp", alt: "Showroom" },
          { src: "/templates/jewellery/prefooter/about-us.webp", alt: "About" },
          { src: "/templates/jewellery/prefooter/packages.webp", alt: "Packages" },
        ],
        brandLogos: ["Arca", "Forma", "Loom", "Studio"],
        previewImage: "/templates/jewellery/prefooter/showrooms.webp",
        headline: "Interior design with showroom-led merchandising",
        subheading: "Elegant products, lifestyle imagery, and a premium editorial structure.",
      });
    case "beverage":
      return buildBeverageDesign(source);
    case "bakery":
      return buildBakeryDesign(source);
    case "digital-services":
      return buildLuxuryCommerce(source, {
        heroImage: "/templates/sites/nutrio/assets/images/homepage/coffee.jpg",
        categoryImages: [
          { title: "Delivery", image: "/templates/sites/nutrio/assets/images/homepage/coffee.jpg", href: "/collections" },
          { title: "Services", image: "/templates/sites/nutrio/assets/images/homepage/dinner.jpg", href: "/collections" },
          { title: "Subscriptions", image: "/templates/sites/nutrio/assets/images/homepage/dessert.jpg", href: "/collections" },
          { title: "Support", image: "/templates/sites/nutrio/assets/images/homepage/breakfast.jpg", href: "/collections" },
        ],
        products: [
          product("Delivery App", "delivery-app", 48, "/templates/sites/nutrio/assets/images/homepage/coffee.jpg", { isFeatured: true }),
          product("Service Bundle", "service-bundle", 72, "/templates/sites/nutrio/assets/images/homepage/dinner.jpg", {}),
        ],
        gallery: [
          { src: "/templates/sites/nutrio/assets/images/homepage/coffee.jpg", alt: "Service 1" },
          { src: "/templates/sites/nutrio/assets/images/homepage/dinner.jpg", alt: "Service 2" },
          { src: "/templates/sites/nutrio/assets/images/homepage/breakfast.jpg", alt: "Service 3" },
        ],
        brandLogos: ["App", "Cloud", "Flow", "Pulse"],
        previewImage: "/templates/sites/nutrio/assets/images/homepage/coffee.jpg",
        headline: "Digital services with a productized launch layout",
        subheading: "A service-first template that still behaves like a complete native package.",
      });
    case "restaurant":
      return buildRestaurantDesign(source, "classic");
    case "modern-restaurant":
      return buildRestaurantDesign(source, "modern");
    case "landing-gadget":
      return buildImportedLandingGadgetDesign(source);
    case "aegis":
      return buildImportedAegisDesign(source);
    case "najaf-ai":
      return buildLandingNajafDesign(source);
    case "aurapod":
      return buildLandingAurapodDesign(source);
    case "arts-portfolio":
      return buildLandingArtsPortfolioDesign(source);
    case "developer-portfolio":
      return buildLandingDevPortfolioDesign(source);
    case "toybox":
      return buildLandingToyboxDesign(source);
    case "pixapage-saas":
      return buildLandingPixaPageDesign(source);
    case "traveler-startup":
      return buildLandingTravelerDesign(source);
    case "corporate":
      return buildCorporateDesign(source);
    case "lawyer":
      return buildLawyerDesign(source);
    case "real-estate":
      return buildRealEstateDesign(source);
    case "clarity":
      return buildClarityDesign(source);
    case "agency":
      return buildAgencyDesign(source);
    case "portfolio":
      return buildPortfolioDesign(source);
    case "healthcare":
      return buildHealthcareDesign(source);
    case "clinic":
      return buildClinicDesign(source);
    case "travel":
      return buildTravelDesign(source);
    case "education":
      return buildEducationDesign(source);
    default:
      throw new Error(`No package design implementation for ${source.slug}`);
  }
}
