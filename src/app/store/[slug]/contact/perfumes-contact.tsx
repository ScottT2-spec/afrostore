"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PerfumesHeader, PerfumesFooter } from "@/components/storefront/PerfumesStoreChrome";

const T = { titleFont: "'Cormorant Garamond', Georgia, serif", bodyFont: "'Inter', Arial, Helvetica, sans-serif", primary: "#242424", accent: "#8b6798", textColor: "#767676", containerWidth: "1320px" };

const STORES = [
  { name: "Paris Store", phone: "+33 1 23 45 67 89", address: "1 Bd Saint-Germain, 75005 Paris" },
  { name: "Brussels Store", phone: "+33 1 23 45 67 89", address: "Rue du Grand Cerf 2, 1000 Bruxelles, Belgium" },
  { name: "London Store", phone: "+33 1 23 45 67 89", address: "229-247 Regent St., London W1B 2EG, United Kingdom" },
];

export default function PerfumesContactPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { fetch(`/api/storefront/${slug}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, [slug]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.bodyFont }}>Loading...</div>;
  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.bodyFont }}>Store not found</div>;

  const { store } = data;
  const socialLinksArray = Object.entries(data.socialLinks || {}).filter(([, url]) => url).map(([p, u]) => ({ platform: p, url: u as string }));

  const socialIcons: Record<string, string> = { facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪" };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
    .pc-page { min-height: 100vh; background: #fff; }
    .pc-hero { max-width: ${T.containerWidth}; margin: 0 auto; padding: 80px 15px 60px; text-align: center; }
    .pc-title { font-family: ${T.titleFont}; font-size: 52px; font-weight: 400; color: ${T.primary}; margin: 0 0 50px; letter-spacing: -1px; }
    .pc-info-grid { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px 60px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
    .pc-info-card { text-align: center; }
    .pc-info-label { font-family: ${T.titleFont}; font-size: 22px; font-weight: 500; color: ${T.primary}; margin: 0 0 15px; }
    .pc-info-value { font-family: ${T.bodyFont}; font-size: 14px; line-height: 1.7; color: ${T.textColor}; margin: 0; }
    .pc-social-row { display: flex; justify-content: center; gap: 12px; margin-top: 10px; }
    .pc-social-icon { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; color: ${T.textColor}; text-decoration: none; font-size: 14px; transition: all 0.2s; }
    .pc-social-icon:hover { border-color: ${T.primary}; color: ${T.primary}; }
    .pc-form-section { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: flex-start; }
    .pc-form-title { font-family: ${T.titleFont}; font-size: 36px; font-weight: 400; color: ${T.primary}; margin: 0 0 10px; }
    .pc-form-desc { font-family: ${T.bodyFont}; font-size: 14px; line-height: 1.7; color: ${T.textColor}; margin: 0 0 30px; }
    .pc-form { display: flex; flex-direction: column; gap: 18px; }
    .pc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .pc-input { width: 100%; padding: 14px 18px; border: 1px solid #ddd; font-family: ${T.bodyFont}; font-size: 14px; outline: none; color: ${T.primary}; transition: border-color 0.2s; background: #fff; }
    .pc-input:focus { border-color: ${T.primary}; }
    .pc-textarea { width: 100%; padding: 14px 18px; border: 1px solid #ddd; font-family: ${T.bodyFont}; font-size: 14px; outline: none; color: ${T.primary}; min-height: 140px; resize: vertical; transition: border-color 0.2s; }
    .pc-textarea:focus { border-color: ${T.primary}; }
    .pc-submit { padding: 14px 40px; background: ${T.primary}; color: #fff; border: none; font-family: ${T.bodyFont}; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer; transition: background 0.2s; align-self: flex-start; }
    .pc-submit:hover { background: ${T.accent}; }
    .pc-stores { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px 80px; }
    .pc-stores-title { font-family: ${T.titleFont}; font-size: 36px; font-weight: 400; color: ${T.primary}; margin: 0 0 40px; text-align: center; }
    .pc-stores-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
    .pc-store-card { text-align: center; padding: 35px 25px; border: 1px solid #eee; }
    .pc-store-name { font-family: ${T.titleFont}; font-size: 24px; font-weight: 500; color: ${T.primary}; margin: 0 0 18px; }
    .pc-store-detail { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.textColor}; margin: 0 0 8px; line-height: 1.6; }
    .pc-store-detail strong { color: ${T.primary}; }
    .pc-success { font-family: ${T.bodyFont}; font-size: 15px; color: #16a34a; font-weight: 500; }
    @media (max-width: 1024px) { .pc-info-grid { grid-template-columns: repeat(2, 1fr); } .pc-form-section { grid-template-columns: 1fr; } .pc-stores-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .pc-info-grid { grid-template-columns: 1fr; } .pc-stores-grid { grid-template-columns: 1fr; } .pc-title { font-size: 36px; } .pc-form-row { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="pc-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PerfumesHeader storeName={store.name} storeSlug={slug} logo={store.logo} />

      <div className="pc-hero"><h1 className="pc-title">Contact Us</h1></div>

      {/* Info Cards */}
      <div className="pc-info-grid">
        <div className="pc-info-card">
          <h3 className="pc-info-label">Our Address</h3>
          <p className="pc-info-value">123 Perfume Lane, Paris, France</p>
        </div>
        <div className="pc-info-card">
          <h3 className="pc-info-label">Phone Number</h3>
          <p className="pc-info-value">+33 1 23 45 67 89</p>
        </div>
        <div className="pc-info-card">
          <h3 className="pc-info-label">Business Hours</h3>
          <p className="pc-info-value">Monday – Friday: 9 AM – 6 PM<br />Saturday–Sunday: Closed</p>
        </div>
        <div className="pc-info-card">
          <h3 className="pc-info-label">Follow Us</h3>
          <div className="pc-social-row">
            {socialLinksArray.length > 0 ? socialLinksArray.map((s, i) => (
              <a key={i} href={s.url} className="pc-social-icon" target="_blank" rel="noopener noreferrer">{socialIcons[s.platform] || s.platform[0]?.toUpperCase()}</a>
            )) : (<><a href="#" className="pc-social-icon">f</a><a href="#" className="pc-social-icon">𝕏</a><a href="#" className="pc-social-icon">📷</a><a href="#" className="pc-social-icon">▶</a></>)}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="pc-form-section">
        <div>
          <h2 className="pc-form-title">Get In Touch</h2>
          <p className="pc-form-desc">We&apos;d love to hear from you! Whether you have a question, need assistance, or simply want to learn more about our fragrances, reach out to us. Fill in the form below, and we&apos;ll get back to you as soon as possible.</p>
        </div>
        <div>
          {submitted ? (
            <p className="pc-success">Thank you for your message! We&apos;ll get back to you soon.</p>
          ) : (
            <form className="pc-form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
              <div className="pc-form-row">
                <input className="pc-input" placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                <input className="pc-input" placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
              </div>
              <input className="pc-input" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <textarea className="pc-textarea" placeholder="Your Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              <button type="submit" className="pc-submit">Send Message</button>
            </form>
          )}
        </div>
      </div>

      {/* Branded Stores */}
      <div className="pc-stores">
        <h2 className="pc-stores-title">Our Branded Stores</h2>
        <div className="pc-stores-grid">
          {STORES.map((s, i) => (
            <div key={i} className="pc-store-card">
              <h3 className="pc-store-name">{s.name}</h3>
              <p className="pc-store-detail"><strong>Call Us:</strong> {s.phone}</p>
              <p className="pc-store-detail"><strong>Address:</strong> {s.address}</p>
            </div>
          ))}
        </div>
      </div>

      <PerfumesFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description} socialLinks={socialLinksArray} />
    </div>
  );
}
