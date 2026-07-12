"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";
import Link from "next/link";
import { RenderBlocks } from "@/components/storefront/BlockRenderer";
import { RETAIL_BESTSELLER_BLOCKS } from "@/lib/templates/presets/retail-pages";

export default function BestsellerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [storeData, setStoreData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/storefront/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setStoreData(json.data);
          const bestsellerProducts = (json.data.products || []).filter((p: any) => 
            p.isFeatured || p.tags?.includes("bestseller") || p.reviewCount > 10
          ).slice(0, 12);
          setProducts(bestsellerProducts);
        }
      } catch (error) {
        console.error("Failed to load store:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
  const isRetail = storeData?.templateSlug === "retail";

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // ─── RETAIL BESTSELLER ───
  if (isRetail) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <RenderBlocks blocks={RETAIL_BESTSELLER_BLOCKS} storeSlug={slug} products={products} currency={currency} />
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

      <div className="bg-gradient-to-r from-pink-100 to-rose-100 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Bestsellers</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most loved products. These customer favorites have earned their place in our collection.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group">
                <Link href={`/store/${slug}/product/${product.slug}`}>
                  <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-4">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200"><span className="text-gray-400">No Image</span></div>
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded">Bestseller</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">{formatCurrency(product.compareAtPrice)}</span>
                    )}
                  </div>
                  {product.reviewCount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span className="text-yellow-400">★</span>
                      <span>{product.reviewCount} reviews</span>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No bestseller products found.</p>
            <Link href={`/store/${slug}/shop`} className="inline-block mt-4 text-pink-600 font-semibold hover:text-pink-700">Browse all products →</Link>
          </div>
        )}
      </main>

      <CosmeticsFooter
        storeName={store?.name || "Store"}
        storeSlug={slug}
        description={store?.description}
        contactInfo={{ address: store?.address, phone: store?.phone, email: store?.email }}
        socialLinks={[
          ...(storeData?.socialLinks?.facebook ? [{ platform: "facebook", url: storeData.socialLinks.facebook }] : []),
          ...(storeData?.socialLinks?.instagram ? [{ platform: "instagram", url: storeData.socialLinks.instagram }] : []),
          ...(storeData?.socialLinks?.twitter ? [{ platform: "twitter", url: storeData.socialLinks.twitter }] : []),
        ]}
      />
    </div>
  );
}
