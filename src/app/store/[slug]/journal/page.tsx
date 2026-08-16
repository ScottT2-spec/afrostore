"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PerfumesHeader, PerfumesFooter } from "@/components/storefront/PerfumesStoreChrome";
import { RenderTemplateBlocks } from "@/components/storefront/TemplateBlockRenderer";
import { PerfumesStoreContext } from "@/components/storefront/PerfumesTemplateBlocks";
import { PERFUMES_JOURNAL_PAGE_BLOCKS } from "@/lib/templates/presets/perfumes-page-presets";
import { resolveLivePageContent } from "@/lib/templates/bespoke-page-content";
import { useWishlist } from "@/hooks/useWishlist";

export default function PerfumesJournalPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/storefront/${slug}`).then(r => r.json()),
      fetch(`/api/storefront/${slug}/pages/journal`).then(r => r.json().catch(() => ({ success: false })))
    ])
      .then(([storeRes, pageRes]) => {
        if (!cancelled) {
          if (storeRes?.success && storeRes?.data) setData(storeRes.data);
          if (pageRes?.success && pageRes?.data) setPageData(pageRes.data.page);
          else if (!cancelled) setPageData(null);
        }
      })
      .catch(() => { if (!cancelled) { setData(null); setPageData(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', Arial, sans-serif" }}>Loading...</div>;
  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', Arial, sans-serif" }}>Store not found</div>;

  const { store } = data;
  const socialLinksArray = Object.entries(data.socialLinks || {}).filter(([, url]) => url).map(([p, u]) => ({ platform: p, url: u as string }));

  const { isWishlisted, toggleWishlist } = useWishlist(store.id, slug);

  const addToCart = (productId: string, quantity: number = 1) => {
    const product = (data.products || []).find((p: any) => p.id === productId);
    if (!product) return;
    // Canonical key/shape — afrostore_cart_${slug} with a nested `product`
    // object, matching shop/product/cart/checkout. Previously wrote to
    // `cart_${store.id}` with a flat shape, so items added here silently
    // never showed up in the cart.
    const cartKey = `afrostore_cart_${slug}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existing = cart.find((item: any) => item.productId === productId && !item.variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId,
        variantId: null,
        quantity,
        product,
      });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    localStorage.setItem("afrostore_cart_active_slug", slug);
  };

  const ctxValue = {
    products: data.products || [],
    blogs: data.blogs || [],
    currency: store.currency || "USD",
    storeSlug: slug,
    socialLinks: socialLinksArray,
    addToCart,
    toggleWishlist,
    isWishlisted,
  };

  const resolvedPage = pageData?.content
    ? resolveLivePageContent("perfumes", "journal", pageData.content)
    : null;
  const pageNodeCss = resolvedPage?.css || "";
  const blocks = resolvedPage?.blocks.length ? resolvedPage.blocks : PERFUMES_JOURNAL_PAGE_BLOCKS;

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <PerfumesHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
      <PerfumesStoreContext.Provider value={ctxValue}>
        {pageNodeCss && <style data-live-node-styles dangerouslySetInnerHTML={{ __html: pageNodeCss }} />}
        <RenderTemplateBlocks blocks={blocks} />
      </PerfumesStoreContext.Provider>
      <PerfumesFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description} socialLinks={socialLinksArray} />
    </div>
  );
}
