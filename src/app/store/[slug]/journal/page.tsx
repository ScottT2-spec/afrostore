"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { PerfumesHeader, PerfumesFooter } from "@/components/storefront/PerfumesStoreChrome";

const T = { titleFont: "'Cormorant Garamond', Georgia, serif", bodyFont: "'Inter', Arial, Helvetica, sans-serif", primary: "#242424", textColor: "#767676", containerWidth: "1320px" };

export default function JournalPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(`/api/storefront/${slug}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, [slug]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.bodyFont }}>Loading...</div>;
  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.bodyFont }}>Store not found</div>;

  const { store, blogs = [] } = data;
  const socialLinksArray = Object.entries(data.socialLinks || {}).filter(([, url]) => url).map(([platform, url]) => ({ platform, url: url as string }));
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  const placeholders = Array.from({ length: 6 }, (_, i) => `https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-blog-${i + 1}-588x598.jpg`);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
    .pj-page { min-height: 100vh; background: #fff; }
    .pj-hero { max-width: ${T.containerWidth}; margin: 0 auto; padding: 80px 15px 50px; }
    .pj-title { font-family: ${T.titleFont}; font-size: 52px; font-weight: 400; color: ${T.primary}; margin: 0; letter-spacing: -1px; }
    .pj-grid { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
    .pj-card { position: relative; overflow: hidden; }
    .pj-card-img { width: 100%; aspect-ratio: 1 / 1.02; object-fit: cover; display: block; transition: transform 0.5s ease; }
    .pj-card:hover .pj-card-img { transform: scale(1.03); }
    .pj-card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 30px 25px; background: linear-gradient(transparent, rgba(0,0,0,0.6)); }
    .pj-card-date { font-family: ${T.bodyFont}; font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .pj-card-title { font-family: ${T.titleFont}; font-size: 24px; font-weight: 500; color: #fff; margin: 0; }
    .pj-card-title a { color: #fff; text-decoration: none; }
    .pj-empty { text-align: center; padding: 60px 20px; font-family: ${T.bodyFont}; color: ${T.textColor}; }
    @media (max-width: 1024px) { .pj-grid { grid-template-columns: repeat(2, 1fr); } .pj-title { font-size: 40px; } }
    @media (max-width: 767px) { .pj-grid { grid-template-columns: 1fr; } .pj-title { font-size: 32px; } .pj-hero { padding: 50px 15px 30px; } }
  `;

  return (
    <div className="pj-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PerfumesHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
      <div className="pj-hero"><h1 className="pj-title">Journal</h1></div>
      {blogs.length === 0 ? (<div className="pj-empty">No journal entries yet.</div>) : (
        <div className="pj-grid">
          {blogs.map((post: any, i: number) => (
            <div key={post.id} className="pj-card">
              <img src={post.coverImage || placeholders[i % 6]} alt={post.title} className="pj-card-img" loading="lazy" />
              <div className="pj-card-overlay">
                <div className="pj-card-date">{formatDate(post.publishedAt || post.createdAt)}</div>
                <h3 className="pj-card-title"><Link href={resolveStoreLink(`/blog/${post.slug}`, slug)}>{post.title}</Link></h3>
              </div>
            </div>
          ))}
        </div>
      )}
      <PerfumesFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description} socialLinks={socialLinksArray} />
    </div>
  );
}
