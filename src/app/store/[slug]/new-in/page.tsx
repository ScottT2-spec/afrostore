"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";
import Link from "next/link";
import { RenderBlocks } from "@/components/storefront/BlockRenderer";
import { RETAIL_NEW_IN_BLOCKS } from "@/lib/templates/presets/retail-pages";

export default function NewInPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [storeData, setStoreData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/storefront/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setStoreData(json.data);
          // Filter products tagged as new-arrival or recently created
          const newProducts = (json.data.products || [])
            .filter((p: any) => p.tags?.includes("new-arrival") || p.tags?.includes("new"))
            .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 12);
          setProducts(newProducts);
        }
      } catch (error) {
        console.error("Failed to load store:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // Countdown timer for urgency
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7); // 7 days from now

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };


  // ─── RETAIL NEW_IN ───
  const isRetail = storeData?.templateSlug === "retail";
  if (isRetail) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <RenderBlocks blocks={RETAIL_NEW_IN_BLOCKS} storeSlug={slug} products={products || []} currency={currency} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CosmeticsHeader
        storeName={store?.name || "Store"}
        storeSlug={slug}
        logo={store?.logo}
        cartCount={0}
        wishlistCount={0}
      />

      {/* Hero Section with Countdown */}
      <div className="bg-gradient-to-r from-rose-100 to-pink-100 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block bg-pink-600 text-white text-sm font-semibold px-4 py-1 rounded-full mb-4">
            NEW ARRIVALS
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Just Arrived</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Be the first to discover our latest additions. Limited quantities available.
          </p>
          
          {/* Countdown Timer */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg p-4 min-w-[80px] shadow-md">
                <div className="text-3xl font-bold text-pink-600">{String(item.value).padStart(2, "0")}</div>
                <div className="text-xs text-gray-500 uppercase">{item.label}</div>
              </div>
            ))}
          </div>

          <Link href={`/store/${slug}/shop?sort=newest`} className="inline-block bg-pink-600 text-white px-8 py-3 font-semibold rounded hover:bg-pink-700 transition-colors">
            Shop All New Arrivals
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group">
                <Link href={`/store/${slug}/product/${product.slug}`}>
                  <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-4">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded">
                      NEW
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">{formatCurrency(product.compareAtPrice)}</span>
                    )}
                  </div>
                  {product.inStock ? (
                    <span className="text-sm text-green-600">In Stock</span>
                  ) : (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No new arrivals at the moment.</p>
            <Link href={`/store/${slug}/shop`} className="inline-block mt-4 text-pink-600 font-semibold hover:text-pink-700">
              Browse all products →
            </Link>
          </div>
        )}
      </main>

      {/* Newsletter Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter and be the first to know about new arrivals and exclusive offers.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button className="bg-pink-600 text-white px-6 py-3 rounded font-semibold hover:bg-pink-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

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
