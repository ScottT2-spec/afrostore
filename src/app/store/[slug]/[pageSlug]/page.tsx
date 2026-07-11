"use client";
import { ArrowRight, ChevronRight, Loader2, X } from "lucide-react";
import { Heart, Menu, MessageCircle, Phone, Search, ShoppingBag, ShoppingCart } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks, type BuilderBlock, type StoreProduct } from "@/components/storefront/BlockRenderer";
import { FashionFooter } from "@/components/storefront/FashionStoreChrome";
import { TShirtsPrintsFooter, TShirtsPrintsHeader } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { parsePageContent, getLinkedPageHref } from "@/lib/page-content";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { useWishlist } from "@/hooks/useWishlist";
import { applyPageCustomization, buildPageBackgroundStyle, buildThemeDataWithCustomization, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { VegetableAboutPage, VegetableContactPage, VegetableMenuPage, VegetableRecipePage, VegetableReservationPage } from "@/components/storefront/VegetableTemplatePages";
import { VegetableFooter, VegetableHeader } from "@/components/storefront/VegetableStoreChrome";
import { KidsFontLoader, KidsFooterFull, KidsHeader } from "@/components/storefront/KidsTemplateBlocks";
import { PerfumesFontLoader, PerfumesFooter, PerfumesHeader } from "@/components/storefront/PerfumesTemplateBlocks";
import { HealthFontLoader, HealthHeader, HealthFooterFull } from "@/components/storefront/HealthTemplateBlocks";

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

  useEffect(() => {
    (async () => {
      try {
      const res = await fetch(`/api/storefront/${slug}/pages/${pageSlug}`);
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
  const parsedContent = parsePageContent(resolvedPage.content);
  const resolvedPageSettings = getResolvedPageSettings(resolvedPage, parsedContent.settings, draftCustomization);
  const blocks: BuilderBlock[] = parsedContent.blocks;
  const visiblePages = filterVisiblePages(data.pages, draftCustomization);
  const customizedPages = visiblePages.map((item) => applyPageCustomization(item, draftCustomization));

  // Navigation pages — exclude current page type HOME (we link to store root for that)
  const navPageOrder: Record<string, number> = { ABOUT: 0, FAQ: 1, CONTACT: 2, POLICY: 3, CUSTOM: 4, LANDING: 5 };
  const navPages = customizedPages
    .filter((p) => p.type !== "HOME")
    .sort((a, b) => (navPageOrder[a.type] ?? 99) - (navPageOrder[b.type] ?? 99));

  const isKidsTemplate = data.templateSlug === "kids" || slug === "kids" || data.store.slug === "kids" || data.store.name?.toLowerCase().includes("kids");
  const isTShirtsPrintsTemplate = data.templateSlug === "t-shirts-prints" || slug === "t-shirts-prints" || data.store.slug === "t-shirts-prints" || data.store.name?.toLowerCase().includes("t-shirts");
  const tshirtsSocialLinks = [
    ...(socialLinks?.facebook ? [{ label: "Facebook", href: socialLinks.facebook }] : []),
    ...(socialLinks?.twitter ? [{ label: "X (Twitter)", href: socialLinks.twitter }] : []),
    ...(socialLinks?.instagram ? [{ label: "Instagram", href: socialLinks.instagram }] : []),
    ...((socialLinks as any)?.youtube ? [{ label: "Youtube", href: (socialLinks as any).youtube }] : []),
  ];

  if (isTShirtsPrintsTemplate) {
    if (pageSlug === "about-us") {
      return (
        <ThemeProvider theme={resolvedTheme}>
          <div className="min-h-screen bg-white text-[#1d1d1d]" style={{ fontFamily: "'Manrope', Arial, sans-serif" }}>
            <TShirtsPrintsHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
            <main>
              <section className="px-4 py-16">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7c7c7c]">About us</p>
                    <h1 className="mt-4 text-4xl font-bold leading-tight text-[#111] sm:text-5xl">Welcome to Print Studio</h1>
                    <p className="mt-6 text-base leading-8 text-[#666]">
                      Your go-to destination for high-quality custom prints! Since 2016, we’ve been transforming t-shirts, sweatshirts, and mugs into unique works of art whether for businesses, special events, or personal expressions.
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      {[
                        ["Premium Quality", "We use top-grade materials long-lasting inks."],
                        ["Eco-Friendly", "Our sustainable printing methods reduce waste."],
                        ["Fast & Reliable", "Custom mug or bulk orders for an event!"],
                        ["Customization", "You can bring any idea to life with ease."],
                      ].map(([title, text]) => (
                        <div key={title} className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_16px_40px_rgba(17,17,17,0.04)]">
                          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#111]">{title}</p>
                          <p className="mt-3 text-sm leading-7 text-[#666]">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <img src="https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-right-custom-design.jpg" alt="Print studio" className="h-full w-full rounded-[28px] object-cover shadow-[0_20px_50px_rgba(17,17,17,0.08)]" />
                    <div className="grid gap-4">
                      <img src="https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/06/ps-top-image-bg-1-min.jpg" alt="Printing tools" className="h-full w-full rounded-[28px] object-cover shadow-[0_20px_50px_rgba(17,17,17,0.08)]" />
                      <div className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_16px_40px_rgba(17,17,17,0.04)]">
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#111]">You can create custom design</p>
                        <p className="mt-3 text-sm leading-7 text-[#666]">
                          The price of a T-shirt with an individual design depends on the circulation, the number of images on one product, their size, and the printing method. brand, material and order urgency.
                        </p>
                        <Link href={`/store/${slug}/shop`} className="mt-5 inline-flex rounded-full bg-[#111] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333]">
                          Create design
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="border-y border-[#ececec] px-4 py-16">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7c7c7c]">We are open for your questions</p>
                    <h2 className="mt-4 text-4xl font-bold leading-tight text-[#111] sm:text-5xl">We Are Open for Your Questions!</h2>
                    <p className="mt-4 text-base leading-8 text-[#666]">Feel free to communicate with us</p>
                    <button type="button" className="mt-6 inline-flex rounded-full border border-[#111] px-5 py-2.5 text-sm font-semibold text-[#111] transition hover:bg-[#111] hover:text-white">
                      Ask a Question
                    </button>
                  </div>
                  <div className="rounded-[34px] border border-[#ececec] bg-white p-8 shadow-[0_30px_70px_rgba(17,17,17,0.05)] sm:p-10">
                    <h3 className="text-3xl font-bold text-[#111]">Send Us a Message</h3>
                    <form className="mt-6 grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input className="rounded-2xl border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Your Name" />
                        <input className="rounded-2xl border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Your Email" />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input className="rounded-2xl border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Phone Number" />
                        <input className="rounded-2xl border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Company" />
                      </div>
                      <textarea className="min-h-[180px] rounded-[24px] border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Your Message" />
                      <button type="button" className="inline-flex items-center justify-center rounded-full bg-[#111] px-6 py-3 text-sm font-semibold text-white">
                        Ask a Question
                      </button>
                    </form>
                  </div>
                </div>
              </section>
              <section className="px-4 py-16">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div className="rounded-[34px] border border-[#ececec] bg-white p-8 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
                    <h2 className="text-3xl font-bold text-[#111]">Contact Information</h2>
                    <div className="mt-6 space-y-4 text-sm leading-7 text-[#666]">
                      <p><span className="font-semibold text-[#111]">Address:</span> 1060 Cudahy Pl, San Diego</p>
                      <p><span className="font-semibold text-[#111]">Call Us:</span> (686) 492-1041</p>
                      <p><span className="font-semibold text-[#111]">Email:</span> xtemos.studio@gmail.com</p>
                    </div>
                    <p className="mt-6 text-sm leading-7 text-[#666]">
                      Do you have questions about how we can help your company? Send us an email and we’ll get in touch shortly.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {tshirtsSocialLinks.map((social) => (
                        <a key={social.label} href={social.href} target="_blank" rel="noreferrer noopener" className="rounded-full border border-[#ececec] px-4 py-2 text-sm font-semibold text-[#111] transition hover:border-[#111]">
                          {social.label}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[34px] border border-[#ececec] bg-[#fffdf8] p-8 shadow-[0_20px_50px_rgba(17,17,17,0.04)]">
                    <h2 className="text-3xl font-bold text-[#111]">Why Choose Our Studio?</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {[
                        ["Premium Quality", "We use top-grade materials long-lasting inks."],
                        ["Eco-Friendly", "Our sustainable printing methods reduce waste."],
                        ["Fast & Reliable", "Custom mug or bulk orders for an event!"],
                        ["Customization", "You can bring any idea to life with ease."],
                      ].map(([title, text]) => (
                        <div key={title} className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)]">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#111]">{title}</p>
                          <p className="mt-2 text-sm leading-7 text-[#666]">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </main>
            <TShirtsPrintsFooter
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              socialLinks={tshirtsSocialLinks.map((social) => ({
                platform: social.label,
                url: social.href,
              }))}
            />
          </div>
        </ThemeProvider>
      );
    }

    if (pageSlug === "contact-us") {
      return (
        <ThemeProvider theme={resolvedTheme}>
          <div className="min-h-screen bg-white text-[#1d1d1d]" style={{ fontFamily: "'Manrope', Arial, sans-serif" }}>
            <TShirtsPrintsHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
            <main>
              <section className="border-b border-[#ececec] px-4 py-16">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7c7c7c]">Contact us</p>
                    <h1 className="mt-4 text-4xl font-bold leading-tight text-[#111] sm:text-5xl">Ready to start something together? Get in touch.</h1>
                    <div className="mt-6 space-y-3 text-sm leading-7 text-[#666]">
                      <p><span className="font-semibold text-[#111]">Email:</span> xtemos.studio@gmail.com</p>
                      <p><span className="font-semibold text-[#111]">Call Us:</span> (686) 492-1041</p>
                      <p><span className="font-semibold text-[#111]">Address:</span> 1060 Cudahy Pl, San Diego</p>
                      <p><span className="font-semibold text-[#111]">Working Hours:</span> Mon - Fri 10:00am - 10:00pm</p>
                    </div>
                  </div>
                  <div className="rounded-[32px] border border-[#ececec] bg-white p-8 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
                    <form className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input className="rounded-2xl border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Your Name" />
                        <input className="rounded-2xl border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Your Email" />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input className="rounded-2xl border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Phone Number" />
                        <input className="rounded-2xl border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Company" />
                      </div>
                      <textarea className="min-h-[180px] rounded-[24px] border border-[#ececec] bg-[#fbfbfb] px-4 py-3 text-sm outline-none" placeholder="Your Message" />
                      <button type="button" className="inline-flex items-center justify-center rounded-full bg-[#111] px-6 py-3 text-sm font-semibold text-white">
                        Ask a Question
                      </button>
                    </form>
                  </div>
                </div>
              </section>
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
        </ThemeProvider>
      );
    }
  }

  if (isKidsTemplate) {
    if (pageSlug === "about-us") {
      return (
        <ThemeProvider theme={resolvedTheme}>
          <div className="min-h-screen bg-[#fffdf7] text-[#242424]">
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
              <section className="relative overflow-hidden bg-gradient-to-br from-[#fff5f1] via-white to-[#f8fbff]">
                <div className="mx-auto grid max-w-[1222px] gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-24">
                  <div className="flex flex-col justify-center">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#f5857c]">About Us</p>
                    <h1 className="max-w-xl text-4xl font-bold leading-tight text-[#242424] md:text-6xl">We create organic clothes for babies</h1>
                    <p className="mt-6 max-w-xl text-[16px] leading-8 text-[#767676]">
                      Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarks grove right at the coast of the Semantics, a large language ocean. Far far away, behind the word mountains, far from the countries Vokalia, there live the blind texts.
                    </p>
                    <p className="mt-4 max-w-xl text-[16px] leading-8 text-[#767676]">
                      Separated they live in Bookmarks grove right at the coast of the Semantics.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <img src="https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&h=1000&fit=crop" alt="Kids collection" className="h-full w-full rounded-[28px] object-cover shadow-lg" />
                    <div className="grid gap-4">
                      <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=480&fit=crop" alt="Kids knitwear" className="h-full w-full rounded-[28px] object-cover shadow-lg" />
                      <div className="rounded-[28px] bg-white p-6 shadow-lg">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f5857c]">Meet our team</p>
                        <p className="mt-3 text-sm leading-7 text-[#767676]">
                          Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure show.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mx-auto max-w-[1222px] px-4 py-16 md:px-6">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { title: "Darlene Robertson", text: "Director" },
                    { title: "Kathryn Murphy", text: "Marketing manager" },
                    { title: "Jenny Wilson", text: "Product designer" },
                    { title: "Kristin Watson", text: "CEO" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                      <h2 className="text-xl font-bold text-[#242424]">{item.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-[#767676]">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[#faf8f5]">
                <div className="mx-auto grid max-w-[1222px] gap-10 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f5857c]">How we work</p>
                    <h2 className="mt-4 text-3xl font-bold text-[#242424] md:text-4xl">How we work</h2>
                  </div>
                  <div className="space-y-5 text-[16px] leading-8 text-[#767676]">
                    <p>
                      If that’s what you think how bout the other way around? How can you evaluate content without design? No typography, no colors, no layout, no styles, all those things that convey the important signals that go beyond the mere textual, hierarchies of information, weight, emphasis, oblique stresses, priorities, all those subtle cues that also have visual and emotional.
                    </p>
                    <p>
                      Accept that it’s sometimes okay to focus just on the content or just on the design. Rigid proponents of content strategy may shun the use of dummy copy but then designers might want to ask them to provide style sheets with the copy decks they supply that are in tune with the design direction they require. Using dummy content or fake information in the Web design.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mx-auto max-w-[1222px] px-4 py-16 md:px-6">
                <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f5857c]">What we do</p>
                    <h2 className="mt-4 text-3xl font-bold text-[#242424] md:text-4xl">What we do</h2>
                    <p className="mt-4 text-[16px] leading-8 text-[#767676]">
                      Accept that it’s sometimes okay to focus just on the content or just on the design. Rigid proponents of content strategy may shun the use of dummy copy but then designers might want to ask them to provide style sheets with the copy decks they supply that are in tune with the design direction they require. Using dummy content or fake information in the Web design.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[#242424]">Some of your questions answered here</h3>
                    <p className="text-sm leading-7 text-[#767676]">We get a lot of questions about our course. You can get any answers.</p>
                    <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                      {[
                        ["Why choose organic cotton fabrics and certified factories?", "A seemingly elegant design can quickly begin to bloat with unexpected content or break under the weight of actual activity. Fake data can ensure a nice looking layout but it doesn’t reflect what a living, breathing application must endure. Real data does."],
                        ["How is your product packaged?", "Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure that you can show different text, different data using the same template. When it’s about controlling hundreds of articles, product pages for web shops."],
                        ["What’s the best size to buy for a baby shower gift?", "If the copy becomes distracting in the design then you are doing something wrong or they are discussing copy changes. It might be a bit annoying but you could tell them that that discussion would be best suited for another time. At worst the discussion is at least working towards the final goal of your site where questions about lorem ipsum don’t."],
                      ].map(([q, a]) => (
                        <div key={q} className="rounded-[22px] border border-[#efe6da] bg-[#fffdf8] p-5">
                          <h4 className="font-semibold text-[#242424]">{q}</h4>
                          <p className="mt-2 text-sm leading-7 text-[#767676]">{a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </main>
            <KidsFooterFull
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              templateSlug="kids"
              description={store.description || "Playful kidswear, gifts, and accessories with a premium WoodMart-inspired finish."}
            />
          </div>
        </ThemeProvider>
      );
    }

    if (pageSlug === "contact-us") {
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
              <section className="bg-gradient-to-br from-[#fff7df] via-[#fffdf4] to-[#ffeef1] px-4 py-16">
                <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div>
                    <h1 className="max-w-xl font-serif text-4xl leading-tight text-[#3b3344] sm:text-5xl">
                      913 Wyandotte St, Kansas City, MO 64105, United States
                    </h1>
                    <div className="mt-6 rounded-[32px] bg-white p-6 shadow-[0_18px_40px_rgba(59,51,68,0.06)]">
                      <Link href="#map" className="mt-3 inline-flex text-sm font-semibold text-[#f5857c]">
                        Show on a map
                      </Link>
                      <div className="mt-6 space-y-2 text-sm text-[#6d6277]">
                        <p>Call Us: (064) 332-1233</p>
                        <p>Hours: 9:00am - 5:00pm</p>
                        <p>Monday - Friday</p>
                      </div>
                      <div className="mt-6 flex gap-3 text-[#3b3344]">
                        {[
                          { label: "f", href: (socialLinks?.facebook || "#") as string },
                          { label: "𝕏", href: (socialLinks?.twitter || "#") as string },
                          { label: "📷", href: (socialLinks?.instagram || "#") as string },
                          { label: "▶", href: (socialLinks as any)?.youtube || "#" },
                        ].map((item) => (
                          <Link key={item.label} href={item.href} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_12px_28px_rgba(59,51,68,0.06)]">
                            <span className="text-sm font-bold">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[34px] bg-white p-6 shadow-[0_30px_70px_rgba(59,51,68,0.08)] sm:p-8">
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Get in touch</p>
                      <h2 className="mt-2 font-serif text-3xl text-[#3b3344]">Get in touch</h2>
                    </div>
                    <form className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="Your name" />
                        <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="Email address" />
                      </div>
                      <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="Subject" />
                      <textarea className="min-h-[160px] rounded-[24px] border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="How can we help?" />
                      <button type="button" className="inline-flex items-center justify-center rounded-full bg-[#f5857c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef7067]">
                        Send message
                      </button>
                    </form>
                  </div>
                </div>
              </section>

              <section id="map" className="px-4 py-16">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[34px] border border-[#efe6da] bg-white p-6 shadow-[0_20px_50px_rgba(59,51,68,0.05)] sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Opening hours</p>
                    <h2 className="mt-2 font-serif text-3xl text-[#3b3344]">Monday - Friday</h2>
                    <div className="mt-6 space-y-4 text-sm text-[#6d6277]">
                      <div className="flex items-center justify-between border-b border-dashed border-[#efe6da] pb-3">
                        <span>Hours</span>
                        <span className="font-semibold text-[#3b3344]">9:00am - 5:00pm</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-dashed border-[#efe6da] pb-3">
                        <span>Support</span>
                        <span className="font-semibold text-[#3b3344]">(064) 332-1233</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-dashed border-[#efe6da] pb-3">
                        <span>Address</span>
                        <span className="font-semibold text-[#3b3344]">Kansas City, MO</span>
                      </div>
                    </div>
                    <div className="mt-8 rounded-[28px] bg-[#fff7df] p-5">
                      <p className="text-sm leading-7 text-[#6d6277]">
                        Based on WoodMart theme 2025 WooCommerce Themes.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link href={`/store/${slug}/blog`} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#3b3344] transition hover:text-[#f5857c]">
                          Visit the blog
                        </Link>
                        <Link href={`/store/${slug}/shop`} className="rounded-full border border-[#f5857c] px-5 py-2 text-sm font-semibold text-[#f5857c] transition hover:bg-[#fff0ee]">
                          Shop the collection
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[34px] border border-[#efe6da] bg-white shadow-[0_20px_50px_rgba(59,51,68,0.05)]">
                    <iframe
                      title="Kids store map"
                      src="https://www.google.com/maps?q=913%20Wyandotte%20St%2C%20Kansas%20City%2C%20MO%2064105&output=embed"
                      className="h-[520px] w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </section>
            </main>
            <KidsFooterFull
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              templateSlug="kids"
              description={store.description || "Playful kidswear, gifts, and accessories with a bright, premium WoodMart-inspired finish."}
            />
          </div>
        </ThemeProvider>
      );
    }

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
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
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
            description={store.description || "Playful kidswear, gifts, and accessories with a premium WoodMart-inspired finish."}
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
      switch (pageSlug) {
        case "fragrances":
          return (
            <main>
              <section className="bg-[#f6f0eb] px-4 py-16">
                <div className="mx-auto max-w-6xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">Fragrances</p>
                  <h1 className="mt-4 font-serif text-4xl text-[#241f24] sm:text-5xl">Fragrances</h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-[#6f6573]">
                    Explore the collection structure exactly as presented in the reference storefront.
                  </p>
                </div>
              </section>
              <section className="px-4 pb-12">
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                  <article className="rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                    <h2 className="font-serif text-2xl text-[#241f24]">Collections for Her</h2>
                    <div className="mt-4 grid gap-3">
                      {herCollections.map((collection) => (
                        <Link key={collection.slug} href={`/store/${slug}/shop?category=${collection.slug}`} className="rounded-2xl border border-[#eee4de] bg-[#fcfaf8] px-4 py-3 text-sm font-semibold text-[#241f24]">
                          {collection.name}
                        </Link>
                      ))}
                    </div>
                  </article>
                  <article className="rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                    <h2 className="font-serif text-2xl text-[#241f24]">Collections for Him</h2>
                    <div className="mt-4 grid gap-3">
                      {himCollections.map((collection) => (
                        <Link key={collection.slug} href={`/store/${slug}/shop?category=${collection.slug}`} className="rounded-2xl border border-[#eee4de] bg-[#fcfaf8] px-4 py-3 text-sm font-semibold text-[#241f24]">
                          {collection.name}
                        </Link>
                      ))}
                    </div>
                  </article>
                  <article className="rounded-[32px] bg-[#1a1a1a] px-6 py-8 text-white shadow-[0_20px_50px_rgba(47,34,46,0.08)]">
                    <h2 className="font-serif text-3xl">Opus Essence</h2>
                    <p className="mt-3 text-sm leading-7 text-white/85">
                      A collection of delicate, weightless fragrances that capture the essence of air and light. Soft florals, sheer musks, and dewy accords.
                    </p>
                    <Link href={`/store/${slug}/shop?category=opus-essence`} className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#111]">
                      View Collection
                    </Link>
                  </article>
                </div>
              </section>
              <section className="px-4 pb-16">
                <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {perfumeCollections.map((collection) => {
                    const categoryProducts = products.filter((product) => product.category?.slug === collection.slug).slice(0, 3);
                    const collectionDescription = categoryProducts[0]?.description || "";
                    return (
                      <article key={collection.slug} className="rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">Collection</p>
                        <h3 className="mt-3 font-serif text-3xl text-[#241f24]">{collection.name}</h3>
                        <p className="mt-4 text-sm leading-7 text-[#6f6573]">{collectionDescription}</p>
                        <div className="mt-6 grid gap-3">
                          {categoryProducts.map((product) => (
                            <Link key={product.id} href={`/store/${slug}/product/${product.slug}`} className="flex items-center justify-between rounded-2xl border border-[#eee4de] bg-[#fcfaf8] px-4 py-3 text-sm font-medium text-[#241f24]">
                              <span>{product.name}</span>
                              <span>{formatCurrency(Number(product.price), currency)}</span>
                            </Link>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </main>
          );
        case "journal":
          return (
            <main className="px-4 py-16">
              <div className="mx-auto max-w-6xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">Journal</p>
                <h1 className="mt-4 font-serif text-4xl text-[#241f24] sm:text-5xl">Journal</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[#6f6573]">
                  Stories, rituals, and editorial notes from the Perfumes collection.
                </p>
                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {blogs.map((blog) => (
                    <article key={blog.id} className="overflow-hidden rounded-[30px] bg-white shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                      <div className="aspect-[4/3] overflow-hidden bg-[#efe7ea]">
                        {blog.coverImage ? <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-[#8b6798]">{blog.category || "Journal"}</p>
                        <h2 className="mt-3 font-serif text-2xl text-[#241f24]">{blog.title}</h2>
                        <p className="mt-3 text-sm leading-7 text-[#6f6573]">{blog.excerpt || ""}</p>
                        <Link href={`/store/${slug}/blog/${blog.slug}`} className="mt-4 inline-flex text-sm font-semibold text-[#8b6798]">
                          Read article
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </main>
          );
        case "about-us":
          return (
            <main className="px-4 py-16">
              <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">About Us</p>
                  <h1 className="mt-4 font-serif text-4xl leading-tight text-[#241f24] sm:text-5xl">Our approach to fragrance is emotional, not decorative.</h1>
                  <p className="mt-6 text-base leading-8 text-[#6f6573]">
                    Perfume is memory, identity, and atmosphere captured in a bottle. We build collections that feel editorial, tactile, and deeply personal.
                  </p>
                  <p className="mt-4 text-base leading-8 text-[#6f6573]">
                    Every scent collection is designed to remain editable for merchants while preserving the structure from the reference site.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <img src="https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-collection-opus-essence.jpg" alt="Perfumes collection" className="h-full w-full rounded-[28px] object-cover" />
                  <div className="grid gap-4">
                    <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6798]">Collections</p>
                      <p className="mt-3 text-sm leading-7 text-[#6f6573]">Étheria, Celeste Aura, Opus Essence, Velours Noir, Nocturne Essence, and Elysian Bloom.</p>
                    </div>
                    <div className="rounded-[28px] bg-[#1a1a1a] p-6 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Contact</p>
                      <p className="mt-3 text-sm leading-7 text-white/80">Use Contact Us or FAQ for direct help and store support.</p>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          );
        case "contact-us":
          return (
            <main className="px-4 py-16">
              <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">Contact Us</p>
                  <h1 className="mt-4 font-serif text-4xl text-[#241f24]">Get in touch</h1>
                  <p className="mt-4 text-base leading-8 text-[#6f6573]">
                    Reach out for product guidance, store support, or collection inquiries.
                  </p>
                  <div className="mt-8 space-y-3 text-sm text-[#6f6573]">
                    <p>Call Us: (064) 332-1233</p>
                    <p>Hours: 9:00am - 5:00pm</p>
                    <p>Monday - Friday</p>
                  </div>
                </div>
                <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                  <form className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none" placeholder="Your name" />
                      <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none" placeholder="Email address" />
                    </div>
                    <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none" placeholder="Subject" />
                    <textarea className="min-h-[180px] rounded-[24px] border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none" placeholder="How can we help?" />
                    <button type="button" className="inline-flex items-center justify-center rounded-full bg-[#8b6798] px-6 py-3 text-sm font-semibold text-white">
                      Send message
                    </button>
                  </form>
                </div>
              </div>
            </main>
          );
        default:
          return (
            <main className="px-4 py-16">
              <div className="mx-auto max-w-4xl">
                <h1 className="font-serif text-4xl text-[#241f24]">{resolvedPage.title}</h1>
                <RenderBlocks blocks={blocks} storeSlug={slug} products={products} currency={currency} addToCart={(p) => addToCart(p as unknown as StoreProduct)} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} addedToCart={addedToCart} />
              </div>
            </main>
          );
      }
    })();

    return (
      <ThemeProvider theme={resolvedTheme}>
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
      </ThemeProvider>
    );
  }

  // ─── HEALTH / PILLS PAGES ───
  const isHealthTemplate =
    data.templateSlug === "pills" ||
    slug === "pills" ||
    data.store.slug === "pills" ||
    data.store.name?.toLowerCase().includes("pill") ||
    data.store.name?.toLowerCase().includes("supplement") ||
    data.store.name?.toLowerCase().includes("health");

  if (isHealthTemplate) {
    if (pageSlug === "about-us") {
      return (
        <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
          <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
          <main>
            <section style={{ background: "linear-gradient(135deg, #f0f5f2 0%, #fff 50%, #f7f7f7 100%)" }}>
              <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px 80px", textAlign: "center" }}>
                <h1 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "48px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>About Us</h1>
                <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "28px", fontWeight: 600, color: "#333", maxWidth: "700px", margin: "0 auto 20px" }}>
                  Our Company&apos;s Goal Is to Make You Healthy
                </h2>
                <p style={{ fontSize: "16px", lineHeight: "1.8", color: "#777", maxWidth: "720px", margin: "0 auto 30px" }}>
                  The best vitamins and supplements are often backed by scientific research and manufactured by reputable companies. They can play a valuable role in filling nutritional gaps and supporting optimal health when used as part.
                </p>
              </div>
            </section>
            <section style={{ maxWidth: "1222px", margin: "-40px auto 0", padding: "0 15px 60px", position: "relative", zIndex: 1 }}>
              <div style={{ borderRadius: "15px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}>
                <img src="https://woodmart.xtemos.com/pills/wp-content/uploads/sites/15/2023/09/w-pas-video-placehollder.jpg" alt="About video" style={{ width: "100%", display: "block" }} />
              </div>
            </section>
            <section style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px" }}>
              <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "32px", fontWeight: 700, color: "#333", textAlign: "center", marginBottom: "48px" }}>Company Values</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px" }}>
                {[
                  { title: "Focus on the Consumer", text: "Anyway, you still use Lorem Ipsum and rightly so, as it will always have a place in the web workers toolbox, as things happen, not always the way you like it, not always in the preferred order." },
                  { title: "Maintain the Highest Standards", text: "No typography, no colors, no layout, no styles, all those things that convey the important signals that go beyond the mere textual, hierarchies of information, weight, emphasis." },
                  { title: "Continuous Improvement", text: "That's not so bad, there's dummy copy to the rescue. But worse, what if the fish doesn't fit in the can, the foot's too big for the boot? Or too small?" },
                  { title: "Consumer Confidence", text: "The best vitamins and supplements are often backed by scientific research and manufactured by reputable companies. They can play a valuable role in filling nutritional gaps." },
                ].map((v) => (
                  <div key={v.title} style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>{v.title}</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>{v.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
          <HealthFooterFull storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description || "Your trusted source for vitamins, supplements, and wellness products."} contact={{ address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", phone: "(956) 238-7908", email: "hello@store.com" }} />
        </div>
      );
    }

    if (pageSlug === "contact-us") {
      return (
        <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
          <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
          <main>
            <section style={{ background: "linear-gradient(135deg, #f0f5f2 0%, #fff 50%, #f7f7f7 100%)" }}>
              <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px 80px", textAlign: "center" }}>
                <h1 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "48px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>Contact Us</h1>
                <p style={{ fontSize: "16px", lineHeight: "1.8", color: "#777", maxWidth: "720px", margin: "0 auto" }}>
                  Have questions about our products? We&apos;re here to help you find the right supplements for your wellness journey.
                </p>
              </div>
            </section>
            <section style={{ maxWidth: "1222px", margin: "0 auto", padding: "0 15px 60px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
                <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "40px" }}>
                  <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "24px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>Get in Touch</h2>
                  <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <input style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", background: "#fff" }} placeholder="Your name" />
                    <input style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", background: "#fff" }} placeholder="Email address" />
                    <input style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", background: "#fff" }} placeholder="Subject" />
                    <textarea style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", background: "#fff", minHeight: "140px", resize: "vertical" }} placeholder="How can we help?" />
                    <button type="button" style={{ padding: "14px 28px", borderRadius: "10px", background: "#6dab3c", color: "#fff", fontWeight: 600, fontSize: "14px", border: "none", cursor: "pointer" }}>Send Message</button>
                  </form>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>Address</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>1901 Thornridge Cir. Shiloh, Hawaii 81063</p>
                  </div>
                  <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>Phone</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>(956) 238-7908</p>
                  </div>
                  <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>Email</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>hello@store.com</p>
                  </div>
                  <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>Hours</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>Monday - Friday: 9:00am - 5:00pm</p>
                  </div>
                </div>
              </div>
            </section>
          </main>
          <HealthFooterFull storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description || "Your trusted source for vitamins, supplements, and wellness products."} contact={{ address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", phone: "(956) 238-7908", email: "hello@store.com" }} />
        </div>
      );
    }

    // Generic Health page (catch-all)
    return (
      <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
        <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
          <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.35em", color: "#6dab3c", marginBottom: "12px" }}>Page</p>
            <h1 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "40px", fontWeight: 700, color: "#333", marginBottom: "32px" }}>{resolvedPage.title}</h1>
            <RenderBlocks blocks={blocks} storeSlug={slug} products={products} currency={currency} addToCart={(p) => addToCart(p as unknown as StoreProduct)} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} addedToCart={addedToCart} />
          </div>
        </main>
        <HealthFooterFull storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description || "Your trusted source for vitamins, supplements, and wellness products."} contact={{ address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", phone: "(956) 238-7908", email: "hello@store.com" }} />
      </div>
    );
  }

  if (data.templateSlug === "vegetables") {
    const vegetableNavItems = [
      { label: "Home", href: `/store/${slug}` },
      { label: "Menu", href: `/store/${slug}/menu` },
      { label: "Recipe", href: `/store/${slug}/recipe` },
      { label: "About", href: `/store/${slug}/about` },
      { label: "Contact", href: `/store/${slug}/contact` },
    ];
    const vegetableSocialLinks = [
      ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
      ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
      ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
      ...(socialLinks?.tiktok ? [{ platform: "tiktok", url: socialLinks.tiktok }] : []),
    ];

    const pageBody = (() => {
      switch (pageSlug) {
        case "menu":
          return <VegetableMenuPage storeName={store.name} storeSlug={slug} currency={currency} socialLinks={vegetableSocialLinks} />;
        case "recipe":
          return <VegetableRecipePage storeName={store.name} storeSlug={slug} currency={currency} socialLinks={vegetableSocialLinks} />;
        case "about":
          return <VegetableAboutPage storeName={store.name} storeSlug={slug} currency={currency} socialLinks={vegetableSocialLinks} />;
        case "contact":
          return (
            <VegetableContactPage
              storeName={store.name}
              storeSlug={slug}
              currency={currency}
              socialLinks={vegetableSocialLinks}
              storeAddress={store.description || `${store.name} restaurant`}
              storePhone={settings.whatsappNumber || socialLinks.whatsapp || undefined}
            />
          );
        case "reservation":
          return <VegetableReservationPage storeName={store.name} storeSlug={slug} currency={currency} socialLinks={vegetableSocialLinks} />;
        default:
          return (
            <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
              <h1 className="font-serif text-4xl text-[#243226]">{page.title}</h1>
              <p className="mt-4 text-sm leading-7 text-[#5d6658]">This page is available in the Vegetable template.</p>
            </div>
          );
      }
    })();

    return (
      <ThemeProvider theme={resolvedTheme}>
        <div className="min-h-screen bg-[#fffdf7] text-[#243226]">
          <VegetableHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            navItems={vegetableNavItems}
            reservationHref={`/store/${slug}/reservation`}
          />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            {pageBody}
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
