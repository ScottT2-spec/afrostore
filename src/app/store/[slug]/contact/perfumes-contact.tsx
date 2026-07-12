"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PerfumesHeader, PerfumesFooter } from "@/components/storefront/PerfumesStoreChrome";
import { RenderTemplateBlocks } from "@/components/storefront/TemplateBlockRenderer";
import { PerfumesStoreContext } from "@/components/storefront/PerfumesTemplateBlocks";
import { PERFUMES_CONTACT_PRESET } from "@/lib/templates/presets/perfumes-contact-preset";

export default function PerfumesContactPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/storefront/${slug}`)
      .then((r) => r.json())
      .then((json) => { if (!cancelled && json?.success && json?.data) setData(json.data); else if (!cancelled) setData(null); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', Arial, sans-serif" }}>Loading...</div>;
  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', Arial, sans-serif" }}>Store not found</div>;

  const { store } = data;
  const socialLinksArray = Object.entries(data.socialLinks || {}).filter(([, url]) => url).map(([p, u]) => ({ platform: p, url: u as string }));

  const ctxValue = {
    products: data.products || [],
    blogs: data.blogs || [],
    currency: store.currency || "USD",
    storeSlug: slug,
    socialLinks: socialLinksArray,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <PerfumesHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
      <PerfumesStoreContext.Provider value={ctxValue}>
        <RenderTemplateBlocks blocks={PERFUMES_CONTACT_PRESET} />
      </PerfumesStoreContext.Provider>
      <PerfumesFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description} socialLinks={socialLinksArray} />
    </div>
  );
}
