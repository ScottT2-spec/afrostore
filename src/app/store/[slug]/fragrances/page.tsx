"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { PerfumesHeader, PerfumesFooter } from "@/components/storefront/PerfumesStoreChrome";
import { safeSrc, onImgError } from "@/components/storefront/image-fallback";

const T = { titleFont: "'Cormorant Garamond', Georgia, serif", bodyFont: "'Inter', Arial, Helvetica, sans-serif", primary: "#242424", accent: "#8b6798", textColor: "#767676", containerWidth: "1320px" };

const COLLECTIONS = [
  { name: "Étheria", slug: "etheria", description: "A collection of light, almost weightless fragrances. Airy florals, sheer musks, and fresh morning dew evoke purity and clarity." },
  { name: "Celeste Aura", slug: "celeste-aura", description: "Elegant fragrances blending vibrant citrus, shimmering aldehydes, and refined light woods creating an aura of inner glow." },
  { name: "Opus Essence", slug: "opus-essence", description: "Rich, complex compositions. Deep florals, precious woods, and warm ambers create a multidimensional fragrance experience." },
  { name: "Velours Noir", slug: "velours-noir", description: "Dark, velvety fragrances with depth and mystery. Smoky oud, leather accords, and black vanilla." },
  { name: "Nocturne Essence", slug: "nocturne-essence", description: "Fragrances inspired by nightfall. Cool musks, aromatic herbs, and dark spices capture twilight elegance." },
  { name: "Elysian Bloom", slug: "elysian-bloom", description: "Fresh, green fragrances celebrating nature. Dewy petals, crisp leaves, and earthy vetiver." },
];

export default function FragrancesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/storefront/${slug}`)
      .then((response) => response.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.success && json?.data) {
          setData(json.data);
        } else {
          setData(null);
        }
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const currencySymbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const formatPrice = (price: number, cur: string) => `${currencySymbols[cur] || cur}${price.toLocaleString()}`;

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.bodyFont }}>Loading...</div>;
  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.bodyFont }}>Store not found</div>;

  const { store, products = [] } = data;
  const currency = store.currency || "USD";
  const socialLinksArray = Object.entries(data.socialLinks || {}).filter(([, url]) => url).map(([platform, url]) => ({ platform, url: url as string }));

  const getCollectionProducts = (collSlug: string) => {
    const match = products.filter((p: any) => p.category?.slug?.toLowerCase() === collSlug || p.category?.name?.toLowerCase().replace(/\s+/g, "-") === collSlug);
    return match.length > 0 ? match.slice(0, 8) : [];
  };
  const hasMatched = COLLECTIONS.some(c => getCollectionProducts(c.slug).length > 0);
  const chunk = Math.ceil(products.length / COLLECTIONS.length);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
    .pfr-page { min-height: 100vh; background: #fff; }
    .pfr-hero { max-width: ${T.containerWidth}; margin: 0 auto; padding: 80px 15px 60px; }
    .pfr-hero-title { font-family: ${T.titleFont}; font-size: 52px; font-weight: 400; color: ${T.primary}; margin: 0; letter-spacing: -1px; }
    .pfr-section { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px 80px; }
    .pfr-collection-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 35px; gap: 40px; }
    .pfr-col-name { font-family: ${T.titleFont}; font-size: 36px; font-weight: 400; color: ${T.primary}; margin: 0; }
    .pfr-col-desc { font-family: ${T.bodyFont}; font-size: 14px; line-height: 1.7; color: ${T.textColor}; max-width: 500px; margin: 0; }
    .pfr-view-link { font-family: ${T.bodyFont}; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; color: ${T.primary}; text-decoration: none; border-bottom: 1px solid ${T.primary}; padding-bottom: 2px; white-space: nowrap; transition: color 0.2s; }
    .pfr-view-link:hover { color: ${T.accent}; border-color: ${T.accent}; }
    .pfr-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .pfr-card { position: relative; }
    .pfr-card-img-wrap { position: relative; overflow: hidden; margin-bottom: 15px; background: #f8f8f8; }
    .pfr-card-img { width: 100%; aspect-ratio: 430 / 491; object-fit: cover; display: block; transition: transform 0.5s ease; }
    .pfr-card:hover .pfr-card-img { transform: scale(1.03); }
    .pfr-card-actions { position: absolute; bottom: 10px; left: 10px; right: 10px; display: flex; gap: 6px; opacity: 0; transform: translateY(8px); transition: all 0.3s ease; }
    .pfr-card:hover .pfr-card-actions { opacity: 1; transform: translateY(0); }
    .pfr-card-btn { flex: 1; padding: 10px; background: #fff; border: none; cursor: pointer; font-family: ${T.bodyFont}; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: ${T.primary}; text-align: center; text-decoration: none; display: block; transition: background 0.2s; }
    .pfr-card-btn:hover { background: ${T.primary}; color: #fff; }
    .pfr-card-name { font-family: ${T.bodyFont}; font-size: 14px; font-weight: 500; color: ${T.primary}; margin: 0 0 6px; }
    .pfr-card-name a { color: inherit; text-decoration: none; }
    .pfr-card-name a:hover { color: ${T.accent}; }
    .pfr-card-price { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.textColor}; }
    .pfr-card-price-old { text-decoration: line-through; margin-right: 8px; color: #bbb; }
    .pfr-divider { max-width: ${T.containerWidth}; margin: 0 auto 60px; padding: 0 15px; border: none; border-top: 1px solid #eee; }
    .pfr-empty { text-align: center; padding: 40px; font-family: ${T.bodyFont}; color: ${T.textColor}; }
    @media (max-width: 1024px) { .pfr-grid { grid-template-columns: repeat(3, 1fr); } .pfr-hero-title { font-size: 40px; } .pfr-col-name { font-size: 28px; } .pfr-collection-header { flex-direction: column; gap: 15px; } }
    @media (max-width: 767px) { .pfr-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } .pfr-hero-title { font-size: 32px; } .pfr-hero { padding: 50px 15px 40px; } }
  `;

  return (
    <div className="pfr-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PerfumesHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
      <div className="pfr-hero"><h1 className="pfr-hero-title">Fragrances</h1></div>
      {products.length === 0 ? (<div className="pfr-empty">No fragrances available yet.</div>) : (
        COLLECTIONS.map((col, ci) => {
          const colProducts = hasMatched ? getCollectionProducts(col.slug) : products.slice(ci * chunk, (ci + 1) * chunk);
          if (colProducts.length === 0 && hasMatched) return null;
          return (
            <div key={col.slug}>
              {ci > 0 && <hr className="pfr-divider" />}
              <div className="pfr-section">
                <div className="pfr-collection-header">
                  <div><h2 className="pfr-col-name">{col.name}</h2><p className="pfr-col-desc">{col.description}</p></div>
                  <Link href={resolveStoreLink(`/shop?category=${col.slug}`, slug)} className="pfr-view-link">View Collection</Link>
                </div>
                <div className="pfr-grid">
                  {colProducts.map((p: any) => (
                    <div key={p.id} className="pfr-card">
                      <div className="pfr-card-img-wrap">
                        <Link href={resolveStoreLink(`/product/${p.slug}`, slug)}><img src={p.images?.[0]?.url || safeSrc(null, p.name)} alt={p.name} className="pfr-card-img" loading="lazy" onError={(e: any) => onImgError(e, p.name)} /></Link>
                        <div className="pfr-card-actions"><Link href={resolveStoreLink(`/product/${p.slug}`, slug)} className="pfr-card-btn">View</Link></div>
                      </div>
                      <h3 className="pfr-card-name"><Link href={resolveStoreLink(`/product/${p.slug}`, slug)}>{p.name}</Link></h3>
                      <div className="pfr-card-price">
                        {p.compareAtPrice && <span className="pfr-card-price-old">{formatPrice(p.compareAtPrice, currency)}</span>}
                        {formatPrice(p.price, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
      <PerfumesFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description} socialLinks={socialLinksArray} />
    </div>
  );
}
