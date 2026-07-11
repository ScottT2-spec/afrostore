"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";

export default function TermsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch(`/api/storefront/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setStoreData(json.data);
        }
      } catch (error) {
        console.error("Failed to load store:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const store = storeData?.store;
  const currency = store?.currency || "NGN";

  return (
    <div className="min-h-screen bg-white">
      <CosmeticsHeader
        storeName={store?.name || "Store"}
        storeSlug={slug}
        logo={store?.logo}
        cartCount={0}
        wishlistCount={0}
      />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none">
          <section id="introduction" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to {store?.name || "our store"}. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
            </p>
          </section>

          <section id="products" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Products and Services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We strive to provide accurate descriptions and images of our cosmetics and skincare products. However, we do not warrant that product descriptions, colors, or other content are accurate, complete, reliable, current, or error-free.
            </p>
            <p className="text-gray-600 leading-relaxed">
              All prices are listed in {currency} and are subject to change without notice. We reserve the right to discontinue any product at any time.
            </p>
          </section>

          <section id="orders" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Orders and Payment</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              By placing an order, you offer to purchase the products listed. We reserve the right to accept or decline your order at our discretion. All orders are subject to availability and confirmation of the order price.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Payment is due at the time of placing your order. We accept various payment methods as indicated on our website.
            </p>
          </section>

          <section id="shipping" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Shipping and Delivery</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Shipping times provided at checkout are estimates only. We are not liable for any delays in delivery.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Risk of loss and title for items purchased pass to you upon delivery to the shipping carrier.
            </p>
          </section>

          <section id="returns" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Returns and Refunds</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We accept returns within 14 days of delivery for unopened and unused products. Products must be returned in their original packaging.
            </p>
            <p className="text-gray-600 leading-relaxed">
              To initiate a return, please contact our customer service team. Refunds will be processed within 5-7 business days of receiving the returned item.
            </p>
          </section>

          <section id="privacy" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              Your use of our website is also subject to our Privacy Policy. Please review our Privacy Policy, which also governs the website and informs users of our data collection practices.
            </p>
          </section>

          <section id="cookies" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We may use cookies and similar technologies to remember preferences, improve site performance, and better understand how visitors use the store.
            </p>
          </section>

          <section id="contact" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us through our contact page or email us at support@{store?.subdomain || "store"}.com.
            </p>
          </section>

          <section id="changes">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website following the posting of changes constitutes your acceptance of such changes.
            </p>
          </section>
        </div>
      </main>

      <CosmeticsFooter
        storeName={store?.name || "Store"}
        storeSlug={slug}
        description={store?.description}
        contactInfo={{
          address: store?.address,
          phone: store?.phone,
          email: store?.email,
        }}
        socialLinks={[
          ...(storeData?.socialLinks?.facebook ? [{ platform: "facebook", url: storeData.socialLinks.facebook }] : []),
          ...(storeData?.socialLinks?.instagram ? [{ platform: "instagram", url: storeData.socialLinks.instagram }] : []),
          ...(storeData?.socialLinks?.twitter ? [{ platform: "twitter", url: storeData.socialLinks.twitter }] : []),
        ]}
      />
    </div>
  );
}
