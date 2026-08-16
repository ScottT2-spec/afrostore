"use client";
import { ArrowRight, ChevronRight, Loader2, X } from "lucide-react";
import { Heart, Menu, MessageCircle, Phone, Search, ShoppingBag, ShoppingCart } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks, type BuilderBlock, type StoreProduct } from "@/components/storefront/BlockRenderer";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { FashionHeader, FashionFooter } from "@/components/storefront/FashionStoreChrome";
import { FashionFontLoader, FashionStoreContext } from "@/components/storefront/FashionTemplateBlocks";
import { ElectronicsFontLoader, ElectronicsFooter, ElectronicsStoreContext } from "@/components/storefront/ElectronicsTemplateBlocks";
import { InteriorFontLoader, InteriorHeader, InteriorFooter, InteriorStoreContext } from "@/components/storefront/InteriorDesignTemplateBlocks";
import { AccessoriesFontLoader, AccessoriesStoreContext } from "@/components/storefront/AccessoriesTemplateBlocks";
import { TShirtsPrintsFooter, TShirtsPrintsHeader } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { TShirtsPrintsFontLoader } from "@/components/storefront/TShirtsPrintsTemplateBlocks";
import { getLinkedPageHref } from "@/lib/page-content";
import { resolveLivePageContent } from "@/lib/templates/bespoke-page-content";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { useWishlist } from "@/hooks/useWishlist";
import { useABTestVariant, applyABTestOverrides } from "@/hooks/useABTestVariant";
import { applyPageCustomization, buildPageBackgroundStyle, buildThemeDataWithCustomization, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { VegetableAboutPage, VegetableContactPage, VegetableMenuPage, VegetableRecipePage, VegetableReservationPage } from "@/components/storefront/VegetableTemplatePages";
import { VegetableFooter, VegetableHeader } from "@/components/storefront/VegetableStoreChrome";
import { GroceryStoreContext } from "@/components/storefront/GroceryTemplateBlocks";
import { KidsFontLoader, KidsFooterFull, KidsHeader } from "@/components/storefront/KidsTemplateBlocks";
import { ToysFontLoader, ToysFooter, ToysStoreContext } from "@/components/storefront/ToysTemplateBlocks";
import { PerfumesFontLoader, PerfumesFooter, PerfumesHeader, PerfumesStoreContext } from "@/components/storefront/PerfumesTemplateBlocks";
import { HealthFontLoader, HealthHeader, HealthFooterFull, HealthStoreContext } from "@/components/storefront/HealthTemplateBlocks";
import { CosmeticsFontLoader, CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";
import { RetailHeader, RetailFooter } from "@/components/storefront/RetailTemplateBlocks";
import { RETAIL_PROJECT_DETAIL_BLOCKS } from "@/lib/templates/presets/retail-pages";

/* ─── TYPES ─────────────────────────────────────────────────── */

interface PageData {
  store: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    currency: string;
    country: string;
    businessType: string;
  };
  page: {
    id: string;
    title: string;
    slug: string;
    type: string;
    content: unknown;
    metaTitle?: string;
    metaDescription?: string;
  };
  settings: {
    whatsappOrdering?: boolean;
    whatsappNumber?: string;
  };
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  products: StoreProduct[];
  blogs?: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    author?: string | null;
    category?: string | null;
    tags: string[];
    publishedAt?: string | null;
    createdAt: string;
  }>;
  categories: Array<{ id: string; name: string; slug: string; _count: { products: number } }>;
  deliveryZones: Array<{ id: string; name: string; fee: number; freeAbove?: number }>;
  pages: Array<{ id: string; title: string; slug: string; type: string }>;
  templateSlug: string | null;
  theme: ThemeData | null;
  customization?: SiteCustomizationDocument | null;
}

/* ─── HELPERS ───────────────────────────────────────────────── */

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const pageSlug = params.pageSlug as string;

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftCustomization, setDraftCustomization] = useState<SiteCustomizationDocument | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  // Cart state
  const cartKey = `afrostore_cart_${slug}`;
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number; product: StoreProduct }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch { /* ignore */ }
    return [];
  });

  const { isWishlisted, toggleWishlist, wishlistCount } = useWishlist(data?.store?.id || "");

  // A/B testing: if this page has a running test, assign this visitor a
  // variant and record a view (same mechanism as the homepage). Assignment
  // is reused across visits via localStorage.
  const abTestAssignment = useABTestVariant(slug, data?.page?.id);

  useEffect(() => {
    (async () => {
      try {
      const res = await fetch(`/api/storefront/${slug}/pages/${pageSlug}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setDraftCustomization(normalizeSiteCustomization(json.data.customization || null));
        const title = json.data.page.metaTitle || `${json.data.page.title} — ${json.data.store.name}`;
        document.title = title;
      } else {
          setError(json.error || "Page not found");
        }
      } catch {
        setError("Failed to load page");
      }
      setLoading(false);
    })();
  }, [slug, pageSlug]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || event.data.type !== "afro-site-customization-preview") return;
      setDraftCustomization(normalizeSiteCustomization(event.data.customization || null));
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Persist cart
  useEffect(() => {
    if (data) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      localStorage.setItem("afrostore_cart_active_slug", slug);
      localStorage.setItem("afrostore_siteId", data.store.id);
    }
  }, [cart, data, cartKey, slug]);

  const resolvedTheme = useMemo(() => buildThemeDataWithCustomization(data?.theme || null, draftCustomization), [data?.theme, draftCustomization]);

  const addToCart = useCallback((product: StoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, quantity: 1, product }];
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1500);
  }, []);

  // Template-context product-grid blocks call addToCart with just a productId
  // (they don't have the full product object) — adapt to the id-based signature.
  const addToCartById = useCallback((productId: string) => {
    const product = (data?.products || []).find((p: any) => p.id === productId);
    if (product) addToCart(product as unknown as StoreProduct);
  }, [data, addToCart]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Page not found</h1>
          <p className="text-surface-500 mb-6">{error || "This page doesn't exist."}</p>
          <Link
            href={`/store/${slug}`}
            className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700"
          >
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const { store, page, settings, socialLinks, products, categories, blogs = [] } = data;
  const currency = store.currency || "NGN";
  const whatsappNumber = settings?.whatsappNumber || socialLinks?.whatsapp;
  const resolvedPage = applyPageCustomization(page, draftCustomization);
  const resolvedContent = resolveLivePageContent(
    data.templateSlug,
    pageSlug,
    resolvedPage.content,
    {
      pageSlug,
      pageTitle: resolvedPage.title,
      pageType: resolvedPage.type,
      templateSlug: data.templateSlug,
    },
  );
  const pageNodeStyles = resolvedContent.css ? <style data-live-node-styles dangerouslySetInnerHTML={{ __html: resolvedContent.css }} /> : null;
  const resolvedPageSettings = getResolvedPageSettings(resolvedPage, resolvedContent.settings, draftCustomization);
  // Filter out chrome blocks (header/footer) from editable content - they're rendered via conditional rendering based on template
  const CHROME_BLOCK_TYPES = new Set([
    'perfumesHeader', 'perfumesFooter',
    'handmadeBagsHeader', 'handmadeBagsFooter',
    'cosmeticsHeader', 'cosmeticsFooter',
    'kidsHeader', 'kidsFooter', 'kidsFooterFull',
    'tShirtsPrintsHeader', 'tShirtsPrintsFooter',
    'fashionFooter', 'bakeryFooter', 'interiorFooter',
    'groceryFooter', 'healthFooterFull', 'healthFooter',
    'electronicsFooter', 'makeupFooter',
    'toysFooter',
  ]);
  // Use parsed blocks if available; only fall back to template-specific page presets if original content was truly empty
  const parsedBlocks = applyABTestOverrides(
    resolvedContent.blocks.filter((block) => !CHROME_BLOCK_TYPES.has(block.type)),
    abTestAssignment.content
  );
  const hasOriginalBlocks = resolvedContent.blocks.length > 0;
  const blocks: BuilderBlock[] = parsedBlocks;
  const visiblePages = filterVisiblePages(data.pages, draftCustomization);
  const customizedPages = visiblePages.map((item) => applyPageCustomization(item, draftCustomization));

  // Navigation pages — exclude current page type HOME (we link to store root for that)
  const navPageOrder: Record<string, number> = { ABOUT: 0, FAQ: 1, CONTACT: 2, POLICY: 3, CUSTOM: 4, LANDING: 5 };
  const navPages = customizedPages
    .filter((p) => p.type !== "HOME")
    .sort((a, b) => (navPageOrder[a.type] ?? 99) - (navPageOrder[b.type] ?? 99));

  const isToysTemplate = data.templateSlug === "toys" || slug === "toys" || data.store.slug === "toys";
  const isKidsTemplate = !isToysTemplate && (data.templateSlug === "kids" || slug === "kids" || data.store.slug === "kids" || data.store.name?.toLowerCase().includes("kids"));
  const isTShirtsPrintsTemplate = data.templateSlug === "t-shirts-prints" || slug === "t-shirts-prints" || data.store.slug === "t-shirts-prints" || data.store.name?.toLowerCase().includes("t-shirts");
  const isFashionTemplate = data.templateSlug === "fashion" || data.templateSlug === "fashion-colored" || data.templateSlug === "handmade-bags" || data.templateSlug === "sweets-bakery";
  const isAccessoriesTemplate = data.templateSlug === "electronics-accessories";
  const isElectronicsTemplate = data.templateSlug === "electronics" || data.templateSlug === "hardware" || data.templateSlug === "tools";
  const isDecorTemplate = data.templateSlug === "decor" || data.templateSlug === "retail" || data.templateSlug === "interior" || data.templateSlug === "interior-design" || data.templateSlug === "home-decor";
  const tshirtsSocialLinks = [
    ...(socialLinks?.facebook ? [{ label: "Facebook", href: socialLinks.facebook }] : []),
    ...(socialLinks?.twitter ? [{ label: "X (Twitter)", href: socialLinks.twitter }] : []),
    ...(socialLinks?.instagram ? [{ label: "Instagram", href: socialLinks.instagram }] : []),
    ...((socialLinks as any)?.youtube ? [{ label: "Youtube", href: (socialLinks as any).youtube }] : []),
  ];

  if (isFashionTemplate) {
    const fashionCtx = {
      products: (products || []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, price: p.price ?? 0, compareAtPrice: p.compareAtPrice,
        currency: currency, inStock: p.inStock ?? true, isFeatured: p.isFeatured ?? false, tags: p.tags ?? [],
        images: p.images ?? [], category: p.category, variants: p.variants,
      })),
      blogs: (blogs || []).map((b: any) => ({
        id: b.id, title: b.title, slug: b.slug, excerpt: b.excerpt, coverImage: b.coverImage,
        author: b.author, category: b.category, tags: b.tags ?? [], publishedAt: b.publishedAt, createdAt: b.createdAt,
      })),
      currency,
      storeSlug: slug,
      addToCart: addToCartById, toggleWishlist, isWishlisted,
    };
    return (
      <ThemeProvider theme={resolvedTheme}>
        <FashionStoreContext.Provider value={fashionCtx}>
          <FashionFontLoader />
          <FashionHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            isLanding={false}
          />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks as TemplateBlock[]} />
          </main>
          <FashionFooter
            storeName={store.name}
            storeSlug={slug}
            description={store.description}
          />
        </FashionStoreContext.Provider>
      </ThemeProvider>
    );
  }

  if (isAccessoriesTemplate) {
    const accCtx = {
      products: (products || []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, price: p.price ?? 0, compareAtPrice: p.compareAtPrice,
        currency: currency, inStock: p.inStock ?? true, isFeatured: p.isFeatured ?? false, tags: p.tags ?? [],
        image: p.image ?? p.images?.[0]?.url ?? "",
        images: p.images ?? [], category: p.category,
      })),
      currency,
      storeSlug: slug,
      addToCart: addToCartById, toggleWishlist, isWishlisted,
    };
    return (
      <ThemeProvider theme={resolvedTheme}>
        <AccessoriesStoreContext.Provider value={accCtx}>
          <AccessoriesFontLoader />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks as TemplateBlock[]} />
          </main>
        </AccessoriesStoreContext.Provider>
      </ThemeProvider>
    );
  }

  if (isElectronicsTemplate) {
    const elecCtx = {
      products: (products || []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, price: p.price ?? 0, compareAtPrice: p.compareAtPrice,
        currency: currency, inStock: p.inStock ?? true, isFeatured: p.isFeatured ?? false, tags: p.tags ?? [],
        image: p.image ?? p.images?.[0]?.url ?? "",
        images: p.images ?? [], category: p.category,
      })),
      blogs: (blogs || []).map((b: any) => ({
        id: b.id, title: b.title, slug: b.slug, excerpt: b.excerpt, coverImage: b.coverImage,
        author: b.author, category: b.category, tags: b.tags ?? [], publishedAt: b.publishedAt, createdAt: b.createdAt,
      })),
      currency,
      storeSlug: slug,
      addToCart: addToCartById, toggleWishlist, isWishlisted,
    };
    return (
      <ThemeProvider theme={resolvedTheme}>
        <ElectronicsStoreContext.Provider value={elecCtx}>
          <ElectronicsFontLoader />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks as TemplateBlock[]} />
          </main>
          <ElectronicsFooter storeSlug={slug} />
        </ElectronicsStoreContext.Provider>
      </ThemeProvider>
    );
  }

  if (isDecorTemplate) {
    const decorCtx = {
      products: (products || []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, price: p.price ?? 0, compareAtPrice: p.compareAtPrice,
        currency: currency, inStock: p.inStock ?? true, isFeatured: p.isFeatured ?? false, tags: p.tags ?? [],
        image: p.image ?? p.images?.[0]?.url ?? "",
        images: p.images ?? [], category: p.category,
      })),
      currency,
      storeSlug: slug,
      addToCart: addToCartById, toggleWishlist, isWishlisted,
    };
    return (
      <ThemeProvider theme={resolvedTheme}>
        <InteriorStoreContext.Provider value={decorCtx}>
          <InteriorFontLoader />
          <InteriorHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
          />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks as TemplateBlock[]} />
          </main>
          <InteriorFooter storeSlug={slug} />
        </InteriorStoreContext.Provider>
      </ThemeProvider>
    );
  }

  if (isTShirtsPrintsTemplate) {
    // Product-grid blocks used by this template read FashionStoreContext
    // (there's no dedicated T-Shirts product-grid component — TShirtsPrintsStoreContext
    // only carries storeSlug/storeName for decorative blocks, not cart data).
    // The homepage already treats t-shirts-prints as part of the Fashion family for
    // this reason; this branch previously provided no context at all, so Add to
    // Cart / Wishlist on any product-grid block placed on a custom page silently
    // did nothing.
    const tshirtsCtx = {
      products: (products || []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, price: p.price ?? 0, compareAtPrice: p.compareAtPrice,
        currency: currency, inStock: p.inStock ?? true, isFeatured: p.isFeatured ?? false, tags: p.tags ?? [],
        images: p.images ?? [], category: p.category, variants: p.variants,
      })),
      blogs: (blogs || []).map((b: any) => ({
        id: b.id, title: b.title, slug: b.slug, excerpt: b.excerpt, coverImage: b.coverImage,
        author: b.author, category: b.category, tags: b.tags ?? [], publishedAt: b.publishedAt, createdAt: b.createdAt,
      })),
      currency,
      storeSlug: slug,
      addToCart: addToCartById, toggleWishlist, isWishlisted,
    };
    return (
      <ThemeProvider theme={resolvedTheme}>
        <FashionStoreContext.Provider value={tshirtsCtx}>
        <div className="min-h-screen bg-white text-[#1d1d1d]" style={{ fontFamily: "'Manrope', Arial, sans-serif" }}>
          <TShirtsPrintsFontLoader />
          <TShirtsPrintsHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks} />
          </main>
          <TShirtsPrintsFooter
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            socialLinks={[
              ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
              ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
              ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
              ...((socialLinks as any)?.youtube ? [{ platform: "youtube", url: (socialLinks as any).youtube }] : []),
            ]}
          />
        </div>
        </FashionStoreContext.Provider>
      </ThemeProvider>
    );
  }

  if (isToysTemplate) {
    const toysCtx = {
      products: (products || []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, price: p.price ?? 0, compareAtPrice: p.compareAtPrice,
        currency, inStock: p.inStock ?? true, isFeatured: p.isFeatured ?? false, tags: p.tags ?? [],
        image: p.image ?? p.images?.[0]?.url ?? "",
        images: p.images ?? [], category: p.category,
      })),
      currency,
      storeSlug: slug,
      addToCart: addToCartById, toggleWishlist, isWishlisted,
    };
    return (
      <ThemeProvider theme={resolvedTheme}>
        <ToysStoreContext.Provider value={toysCtx}>
          <ToysFontLoader />
          <FashionHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            isLanding={false}
          />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks as TemplateBlock[]} />
          </main>
          <ToysFooter
            logoUrl={store.logo || undefined}
            storeSlug={slug}
            description={store.description ?? undefined}
          />
        </ToysStoreContext.Provider>
      </ThemeProvider>
    );
  }

  if (isKidsTemplate) {
    return (
      <ThemeProvider theme={resolvedTheme}>
        <div className="min-h-screen bg-[#fffef8] text-[#3b3344]">
          <KidsFontLoader />
          <KidsHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            templateSlug="kids"
            cartCount={cartCount}
            wishlistCount={wishlistCount}
          />
          <main>
            {pageNodeStyles}
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Page</p>
                <h1 className="mt-3 font-serif text-4xl text-[#3b3344]">{resolvedPage.title}</h1>
              </div>
              <RenderBlocks blocks={blocks} storeSlug={slug} products={products} currency={currency} addToCart={(p) => addToCart(p as unknown as StoreProduct)} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} addedToCart={addedToCart} />
            </div>
          </main>
          <KidsFooterFull
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            templateSlug="kids"
            description={store.description || "Playful kidswear, gifts, and accessories with a premium Prokip LTD-inspired finish."}
          />
        </div>
      </ThemeProvider>
    );
  }

  const isPerfumesTemplate = data.templateSlug === "perfumes" || slug === "perfumes" || data.store.slug === "perfumes" || data.store.name?.toLowerCase().includes("perfumes");

  if (isPerfumesTemplate) {
    const perfumeCollectionSlugs = ["etheria", "celeste-aura", "opus-essence", "velours-noir", "nocturne-essence", "elysian-bloom"];
    const fallbackCollections = [
      { name: "Étheria", slug: "etheria" },
      { name: "Celeste Aura", slug: "celeste-aura" },
      { name: "Opus Essence", slug: "opus-essence" },
      { name: "Velours Noir", slug: "velours-noir" },
      { name: "Nocturne Essence", slug: "nocturne-essence" },
      { name: "Elysian Bloom", slug: "elysian-bloom" },
    ];
    const perfumeCollections = categories.filter((category) => perfumeCollectionSlugs.includes(category.slug));
    const renderedCollections = perfumeCollections.length > 0 ? perfumeCollections : fallbackCollections;
    const herCollections = renderedCollections.filter((category) => ["etheria", "celeste-aura", "opus-essence"].includes(category.slug));
    const himCollections = renderedCollections.filter((category) => ["velours-noir", "nocturne-essence", "elysian-bloom"].includes(category.slug));
    const pageBody = (() => {
      // All perfumes pages now use block-based rendering from the database
      // This ensures editor changes are reflected on the live site
      return (
        <main className="px-4 py-16">
          <div className="mx-auto max-w-4xl">
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks} />
          </div>
        </main>
      );
    })();

    return (
      <ThemeProvider theme={resolvedTheme}>
        <PerfumesStoreContext.Provider value={{ products, blogs, categories, currency, storeSlug: slug, addToCart: addToCartById, toggleWishlist, isWishlisted }}>
        <div className="min-h-screen bg-[#f6f0eb] text-[#241f24]">
          <PerfumesFontLoader />
          <PerfumesHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            categories={categories}
            cartCount={cartCount}
            wishlistCount={wishlistCount}
          />
          {pageBody}
          <PerfumesFooter
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            description={store.description || "Discover a curated collection of modern fragrances designed to hold memory, emotion, and identity in every bottle."}
          />
        </div>
        </PerfumesStoreContext.Provider>
      </ThemeProvider>
    );
  }

  // ─── COSMETICS PAGES ───
  const isCosmeticsTemplate =
    data.templateSlug === "cosmetics" ||
    slug === "cosmetics" ||
    data.store.slug === "cosmetics" ||
    data.store.name?.toLowerCase().includes("cosmetics");

  if (isCosmeticsTemplate) {
    return (
      <ThemeProvider theme={resolvedTheme}>
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Lato', Arial, sans-serif" }}>
          <CosmeticsFontLoader />
          <CosmeticsHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            cartCount={0}
            wishlistCount={0}
          />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderBlocks
              blocks={blocks}
              storeSlug={slug}
              products={products}
              currency={currency}
              addToCart={(p) => addToCart(p as unknown as StoreProduct)}
              isWishlisted={isWishlisted}
              toggleWishlist={toggleWishlist}
              addedToCart={addedToCart}
            />
          </main>
          <CosmeticsFooter
            storeName={store.name}
            storeSlug={slug}
            description={store.description}
            contactInfo={{
              address: (store as any).address,
              phone: (store as any).phone,
              email: (store as any).email,
            }}
            socialLinks={[
              ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
              ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
              ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
            ]}
          />
        </div>
      </ThemeProvider>
    );
  }

  // ─── HEALTH / PILLS PAGES ───
  const isHealthTemplate =
    data.templateSlug === "health" ||
    data.templateSlug === "pills" ||
    slug === "health" ||
    slug === "pills" ||
    data.store.slug === "health" ||
    data.store.slug === "pills" ||
    data.store.name?.toLowerCase().includes("pill") ||
    data.store.name?.toLowerCase().includes("supplement") ||
    data.store.name?.toLowerCase().includes("health");

  if (isHealthTemplate) {
    // Use block-based rendering for all Health pages to enable editor persistence
    return (
      <ThemeProvider theme={resolvedTheme}>
        <HealthStoreContext.Provider value={{ storeSlug: slug, addToCart: addToCartById, toggleWishlist, isWishlisted }}>
        <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
          <HealthFontLoader />
          <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks} />
          </main>
          <HealthFooterFull
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            description={store.description || "Your trusted source for vitamins, supplements, and wellness products."}
            contact={{
              address: (store as any).address || "123 Wellness Ave, Portland, OR 97201",
              phone: (store as any).phone || "(503) 555-0123",
              email: (store as any).email || "hello@store.com"
            }}
            socialLinks={[
              ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
              ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
              ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
            ]}
          />
        </div>
        </HealthStoreContext.Provider>
      </ThemeProvider>
    );
  }

  // ─── RETAIL / DECOR PAGES ───
  const isRetailTemplate =
    data.templateSlug === "retail" ||
    data.templateSlug === "decor" ||
    slug === "retail" ||
    slug === "decor" ||
    data.store.slug === "retail" ||
    data.store.slug === "decor" ||
    data.store.name?.toLowerCase().includes("retail") ||
    data.store.name?.toLowerCase().includes("decor");

  if (isRetailTemplate) {
    // For project detail pages (project-xxx), use RETAIL_PROJECT_DETAIL_BLOCKS as fallback
    let retailBlocks = blocks;
    if (pageSlug.startsWith("project-") && RETAIL_PROJECT_DETAIL_BLOCKS[pageSlug]) {
      // If page has no content or empty content, use the preset blocks
      if (!hasOriginalBlocks) {
        retailBlocks = RETAIL_PROJECT_DETAIL_BLOCKS[pageSlug] as unknown as BuilderBlock[];
      }
    }

    return (
      <ThemeProvider theme={resolvedTheme}>
        <div className="min-h-screen bg-white">
          <RetailHeader storeName={store.name} storeSlug={slug} logo={store.logo} isLanding={false} />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderBlocks
              blocks={retailBlocks}
              storeSlug={slug}
              products={products}
              currency={currency}
              addToCart={(p) => addToCart(p as unknown as StoreProduct)}
              isWishlisted={isWishlisted}
              toggleWishlist={toggleWishlist}
              addedToCart={addedToCart}
            />
          </main>
          <RetailFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description ?? undefined} />
        </div>
      </ThemeProvider>
    );
  }

  if (data.templateSlug === "vegetables") {
    const vegetableNavItems = [
      { label: "Home", href: `/store/${slug}` },
      { label: "Shop", href: `/store/${slug}/shop` },
      { label: "Recipes", href: `/store/${slug}/recipe` },
      { label: "About", href: `/store/${slug}/about` },
      { label: "Contact", href: `/store/${slug}/contact` },
    ];
    const vegetableSocialLinks = [
      ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
      ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
      ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
      ...(socialLinks?.tiktok ? [{ platform: "tiktok", url: socialLinks.tiktok }] : []),
    ];

    // Use block-based rendering for all vegetables pages to enable editor persistence
    return (
      <ThemeProvider theme={resolvedTheme}>
        <GroceryStoreContext.Provider value={{ storeSlug: slug, products: products as any, addToCart: addToCartById, toggleWishlist, isWishlisted }}>
        <div className="min-h-screen bg-[#fffdf7] text-[#243226]">
          <VegetableHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            navItems={vegetableNavItems}
            reservationHref={`/store/${slug}/shop`}
          />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageNodeStyles}
            <RenderTemplateBlocks blocks={blocks} />
          </main>
          <VegetableFooter
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            description={store.description}
            navItems={vegetableNavItems}
            socialLinks={vegetableSocialLinks}
          />
        </div>
        </GroceryStoreContext.Provider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={resolvedTheme}>
    <div className="min-h-screen bg-white">
      {/* Announcement Bar — same as store homepage */}
      <div className="bg-brand-600 text-white text-center py-2 text-xs font-medium">
        <div className="flex items-center justify-center gap-2">
          Welcome to {store.name}
        </div>
      </div>

      {/* Store Nav — identical to store homepage */}
      <header className="sticky top-0 z-40 bg-white border-b border-surface-200 shadow-sm themed-header">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden p-2 -ml-2 text-surface-600">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href={`/store/${slug}`} className="flex items-center gap-2">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-9 w-9 rounded-xl object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="font-display text-lg font-bold text-surface-900">{store.name}</span>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            <Link href={`/store/${slug}`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Home</Link>
            <Link href={`/store/${slug}/shop`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Shop</Link>
            <Link href={`/store/${slug}/reviews`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Reviews</Link>
            {navPages.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={getLinkedPageHref(p as { slug: string; template?: string | null }, slug)}
                className={`text-sm font-medium transition-colors ${p.slug === pageSlug ? "text-brand-700 font-bold" : "text-surface-600 hover:text-surface-900"}`}
              >
                {p.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href={`/store/${slug}/wishlist`} className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg hidden sm:flex">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{wishlistCount}</span>
              )}
            </Link>
            <Link href={`/store/${slug}/cart`} className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="sm:hidden bg-white border-b border-surface-200 px-4 py-4 space-y-2">
          <Link href={`/store/${slug}`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Home</Link>
          <Link href={`/store/${slug}/shop`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Shop</Link>
          <Link href={`/store/${slug}/reviews`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Reviews</Link>
          {navPages.map((p) => (
            <Link
              key={p.id}
              href={getLinkedPageHref(p as { slug: string; template?: string | null }, slug)}
              onClick={() => setMobileMenu(false)}
              className={`block text-sm font-medium py-2 ${p.slug === pageSlug ? "text-brand-700 font-bold" : "text-surface-600"}`}
            >
              {p.title}
            </Link>
          ))}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-surface-400">
          <Link href={`/store/${slug}`} className="hover:text-surface-600 transition-colors">{store.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-surface-700 font-medium">{resolvedPage.title}</span>
        </nav>
      </div>

      {/* Page content — full width like homepage, blocks define their own max-width */}
      <main
        className="relative overflow-hidden"
        style={buildPageBackgroundStyle(resolvedPageSettings)}
      >
        {resolvedPageSettings.backgroundImage && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: String(resolvedPageSettings.overlayColor || "#000000"),
              opacity: Number(resolvedPageSettings.overlayOpacity ?? 0.25),
            }}
          />
        )}
        {resolvedPageSettings.backgroundColor && (
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: String(resolvedPageSettings.backgroundColor) }} />
        )}
        {blocks.length === 0 ? (
          <div className="text-center py-20 relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-surface-900 mb-2">{page.title}</h1>
            <p className="text-surface-400">This page has no content yet.</p>
          </div>
        ) : (
          <div className="relative z-10">
            <RenderBlocks
              blocks={blocks}
              storeSlug={slug}
              products={products}
              currency={currency}
              addToCart={addToCart}
              isWishlisted={isWishlisted}
              toggleWishlist={toggleWishlist}
              addedToCart={addedToCart}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <FashionFooter
        storeName={store.name}
        storeSlug={slug}
        logo={store.logo}
        navPages={navPages}
        description={store.description}
        socialLinks={[
          ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
          ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
          ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
        ]}
        contactInfo={{
          phone: whatsappNumber || undefined,
          email: undefined,
        }}
      />

      {/* Floating WhatsApp */}
      {settings?.whatsappOrdering && whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </div>
    </ThemeProvider>
  );
}
