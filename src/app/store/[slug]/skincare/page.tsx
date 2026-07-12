"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";
import Link from "next/link";
import { RenderBlocks } from "@/components/storefront/BlockRenderer";
import { RETAIL_SKINCARE_BLOCKS } from "@/lib/templates/presets/retail-pages";

export default function SkincarePage() {
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
          // Filter products in skincare category or tagged as skincare
          const skincareProducts = (json.data.products || []).filter((p: any) => 
            p.category?.name?.toLowerCase().includes("skincare") || 
            p.tags?.includes("skincare") ||
            p.tags?.includes("face") ||
            p.tags?.includes("moisturizer") ||
            p.tags?.includes("serum")
          );
          setProducts(skincareProducts);
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

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const benefits = [
    { title: "Natural Ingredients", description: "Formulated with organic and natural ingredients for gentle care" },
    { title: "Dermatologist Tested", description: "All products are tested and approved by skincare experts" },
    { title: "Cruelty Free", description: "We never test on animals, committed to ethical beauty" },
    { title: "Fast Results", description: "Visible improvements in skin texture and tone within weeks" },
  ];


  // ─── RETAIL SKINCARE ───
  const isRetail = storeData?.templateSlug === "retail";
  if (isRetail) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <RenderBlocks blocks={RETAIL_SKINCARE_BLOCKS} storeSlug={slug} products={products || []} currency={currency} />
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Premium Skincare Collection</h1>
              <p className="text-lg text-gray-600 mb-8">
                Discover our curated selection of skincare products designed to nourish, protect, and rejuvenate your skin. From cleansers to serums, find everything you need for your daily routine.
              </p>
              <Link href={`/store/${slug}/shop?category=skincare`} className="inline-block bg-pink-600 text-white px-8 py-3 font-semibold rounded hover:bg-pink-700 transition-colors">
                Shop Skincare
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-200 to-rose-200 rounded-2xl aspect-square flex items-center justify-center">
                <span className="text-6xl">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Our Skincare?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Skincare Products</h2>
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
            <p className="text-gray-500 text-lg">No skincare products found.</p>
            <Link href={`/store/${slug}/shop`} className="inline-block mt-4 text-pink-600 font-semibold hover:text-pink-700">
              Browse all products →
            </Link>
          </div>
        )}
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
