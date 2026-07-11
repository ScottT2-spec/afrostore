"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PerfumesHeader, PerfumesFooter } from "@/components/storefront/PerfumesStoreChrome";

const T = { titleFont: "'Cormorant Garamond', Georgia, serif", bodyFont: "'Inter', Arial, Helvetica, sans-serif", primary: "#242424", accent: "#8b6798", textColor: "#767676", containerWidth: "1320px" };
const IMG = "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11";

const FAQ_ITEMS = [
  { q: "What makes our fragrances unique?", a: "Each fragrance is meticulously crafted using the finest natural ingredients sourced from around the world. Our master perfumers combine traditional techniques with innovative approaches to create scents that are truly one of a kind." },
  { q: "Are your products cruelty-free?", a: "Yes, all our products are 100% cruelty-free. We never test on animals and we work only with suppliers who share our commitment to ethical practices." },
  { q: "How long do your fragrances last?", a: "Our Eau de Parfum formulations are designed to last 8-12 hours on skin. For best results, apply to pulse points and moisturized skin." },
  { q: "Do you offer sample sizes?", a: "Yes! We offer 2ml sample sizes for most of our fragrances so you can discover your perfect scent before committing to a full bottle." },
  { q: "How should I store my perfume?", a: "Store your fragrances in a cool, dry place away from direct sunlight and heat. Keep the bottle tightly closed when not in use to preserve the scent." },
];

const WHY_ITEMS = [
  { icon: `${IMG}/prf-infobox-1.svg`, title: "Natural Ingredients", desc: "We use responsibly sourced, high-quality natural ingredients for an authentic experience." },
  { icon: `${IMG}/prf-infobox-2.svg`, title: "Artisanal Craftsmanship", desc: "Each fragrance is carefully developed by expert perfumers with a deep passion for artistry." },
  { icon: `${IMG}/prf-infobox-3.svg`, title: "Sustainable & Ethical", desc: "We are committed to sustainability, using eco-friendly packaging and ingredients." },
  { icon: `${IMG}/prf-infobox-4.svg`, title: "Luxury Experience", desc: "From elegant bottles to exquisite scents, every fragrance is designed to offer a journey." },
];

export default function PerfumesAboutPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => { fetch(`/api/storefront/${slug}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, [slug]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.bodyFont }}>Loading...</div>;
  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.bodyFont }}>Store not found</div>;

  const { store } = data;
  const socialLinksArray = Object.entries(data.socialLinks || {}).filter(([, url]) => url).map(([p, u]) => ({ platform: p, url: u as string }));

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
    .pa-page { min-height: 100vh; background: #fff; }
    .pa-welcome { max-width: ${T.containerWidth}; margin: 0 auto; padding: 80px 15px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .pa-welcome-title { font-family: ${T.titleFont}; font-size: 42px; font-weight: 400; color: ${T.primary}; margin: 0 0 25px; line-height: 1.2; }
    .pa-welcome-text { font-family: ${T.bodyFont}; font-size: 15px; line-height: 1.8; color: ${T.textColor}; margin: 0; }
    .pa-welcome-img { width: 100%; height: auto; display: block; }
    .pa-marquee-wrap { overflow: hidden; padding: 35px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 80px; }
    .pa-marquee { display: flex; gap: 60px; animation: pa-scroll 45s linear infinite; white-space: nowrap; }
    .pa-marquee-item { font-family: ${T.titleFont}; font-size: 28px; font-weight: 400; color: ${T.primary}; display: flex; align-items: center; gap: 30px; }
    .pa-marquee-sep { width: 8px; height: 8px; background: ${T.accent}; border-radius: 50%; flex-shrink: 0; }
    @keyframes pa-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .pa-story { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
    .pa-story-title { font-family: ${T.titleFont}; font-size: 42px; font-weight: 400; color: ${T.primary}; margin: 0 0 25px; }
    .pa-story-text { font-family: ${T.bodyFont}; font-size: 15px; line-height: 1.8; color: ${T.textColor}; margin: 0 0 30px; }
    .pa-faq { border-top: 1px solid #eee; }
    .pa-faq-item { border-bottom: 1px solid #eee; }
    .pa-faq-q { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; cursor: pointer; font-family: ${T.bodyFont}; font-size: 15px; font-weight: 500; color: ${T.primary}; }
    .pa-faq-q:hover { color: ${T.accent}; }
    .pa-faq-toggle { font-size: 20px; color: ${T.textColor}; transition: transform 0.3s; }
    .pa-faq-toggle.pa-open { transform: rotate(45deg); }
    .pa-faq-a { font-family: ${T.bodyFont}; font-size: 14px; line-height: 1.7; color: ${T.textColor}; padding: 0 0 18px; margin: 0; }
    .pa-why { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px 80px; }
    .pa-why-title { font-family: ${T.titleFont}; font-size: 42px; font-weight: 400; color: ${T.primary}; margin: 0 0 50px; text-align: center; }
    .pa-why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
    .pa-why-card { text-align: center; }
    .pa-why-icon { width: 60px; height: 60px; margin: 0 auto 20px; }
    .pa-why-card-title { font-family: ${T.titleFont}; font-size: 22px; font-weight: 500; color: ${T.primary}; margin: 0 0 12px; }
    .pa-why-card-desc { font-family: ${T.bodyFont}; font-size: 14px; line-height: 1.7; color: ${T.textColor}; margin: 0; }
    @media (max-width: 1024px) { .pa-welcome, .pa-story { grid-template-columns: 1fr; gap: 30px; } .pa-why-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .pa-why-grid { grid-template-columns: 1fr; } .pa-welcome-title, .pa-story-title, .pa-why-title { font-size: 32px; } }
  `;

  const marqueeItems = ["Ethereal", "Sensory", "Signature"];

  return (
    <div className="pa-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PerfumesHeader storeName={store.name} storeSlug={slug} logo={store.logo} />

      {/* Welcome Section */}
      <div className="pa-welcome">
        <div>
          <h1 className="pa-welcome-title">Welcome to {store.name} Fragrances</h1>
          <p className="pa-welcome-text">At {store.name} Fragrances, we believe that scent is more than just an aroma — it&apos;s an experience. Inspired by the richness of nature, we craft sophisticated fragrances that bring warmth, elegance, and personality to every moment. Our carefully curated collections blend the finest natural ingredients, creating timeless scents that leave a lasting impression.</p>
        </div>
        <img src={`${IMG}/prf-about-us-1.jpg`} alt="About us" className="pa-welcome-img" />
      </div>

      {/* Marquee */}
      <div className="pa-marquee-wrap">
        <div className="pa-marquee">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="pa-marquee-item"><span className="pa-marquee-sep" />{item}</span>
          ))}
        </div>
      </div>

      {/* Our Story + FAQ */}
      <div className="pa-story">
        <div>
          <h2 className="pa-story-title">Our Story</h2>
          <p className="pa-story-text">The journey of {store.name} Fragrances began in a small family workshop in Provence, France. Founded by master perfumer Louis Beaumont in 1987, our brand was born from a passion for nature&apos;s raw beauty and the art of perfumery. Inspired by the rich scents of wood, earth, and blooming florals, Louis spent years perfecting his craft, blending rare ingredients to create signature fragrances. What started as a modest venture quickly grew into an internationally recognized brand, known for its commitment to quality, sustainability, and innovation. Today, {store.name} Fragrances continues this legacy, offering exquisite scents that transport you to a world of timeless elegance.</p>
        </div>
        <div className="pa-faq">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="pa-faq-item">
              <div className="pa-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q}
                <span className={`pa-faq-toggle ${openFaq === i ? "pa-open" : ""}`}>+</span>
              </div>
              {openFaq === i && <p className="pa-faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="pa-why">
        <h2 className="pa-why-title">Why Choose {store.name}?</h2>
        <div className="pa-why-grid">
          {WHY_ITEMS.map((item, i) => (
            <div key={i} className="pa-why-card">
              <img src={item.icon} alt={item.title} className="pa-why-icon" />
              <h3 className="pa-why-card-title">{item.title}</h3>
              <p className="pa-why-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <PerfumesFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description} socialLinks={socialLinksArray} />
    </div>
  );
}
