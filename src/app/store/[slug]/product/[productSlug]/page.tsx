"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Star,
  Heart,
  ShoppingCart,
  MessageCircle,
  Truck,
  Shield,
  CreditCard,
  Minus,
  Plus,
  ChevronRight,
  Loader2,
  Share2,
  Check,
  ImageIcon,
} from "lucide-react";

interface ProductImage { id: string; url: string; alt?: string }
interface Variant { id: string; name: string; price: number; stock: number; inStock: boolean; options: Record<string, string> | null }
interface Review { id: string; name: string; rating: number; title?: string; body?: string; isVerified: boolean; createdAt: string }

interface ProductData {
  store: { id: string; name: string; slug: string; currency: string; logo?: string; whatsapp?: string };
  product: {
    id: string; name: string; slug: string; description?: string;
    price: number; compareAtPrice?: number; currency: string;
    inStock: boolean; stock?: number; isFeatured: boolean;
    tags: string[]; images: ProductImage[]; variants: Variant[];
    category?: { id: string; name: string; slug: string };
    metaTitle?: string; metaDescription?: string;
  };
  reviews: {
    items: Review[];
    stats: { averageRating: number; totalCount: number; ratingDistribution: { rating: number; count: number }[] };
  };
  relatedProducts: { id: string; name: string; slug: string; price: number; compareAtPrice?: number; currency: string; inStock: boolean; images: ProductImage[] }[];
}

function formatPrice(amount: number, currency: string) {
  const symbols: Record<string, string> = { NGN: "₦", GHS: "₵", KES: "KSh", USD: "$", GBP: "£", EUR: "€" };
  return `${symbols[currency] || currency + " "}${Number(amount).toLocaleString()}`;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-surface-200"} style={{ width: size, height: size }} />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    fetch(`/api/storefront/${slug}/products/${productSlug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.error || "Product not found");
        setLoading(false);
      })
      .catch(() => { setError("Failed to load product"); setLoading(false); });
  }, [slug, productSlug]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-surface-400" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <ShoppingBag className="h-12 w-12 text-surface-300" />
      <p className="text-surface-500">{error || "Product not found"}</p>
      <Link href={`/store/${slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← Back to store
      </Link>
    </div>
  );

  const { store, product, reviews, relatedProducts } = data;
  const currency = product.currency || store.currency;
  const images = product.images.length > 0 ? product.images : [{ id: "placeholder", url: "", alt: "No image" }];
  const activeVariant = product.variants.find((v) => v.id === selectedVariant);
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const isInStock = activeVariant ? activeVariant.inStock : product.inStock;
  const discount = product.compareAtPrice && product.compareAtPrice > displayPrice
    ? Math.round(((Number(product.compareAtPrice) - displayPrice) / Number(product.compareAtPrice)) * 100)
    : 0;

  const handleAddToCart = () => {
    // Store in localStorage cart
    const cart = JSON.parse(localStorage.getItem(`cart_${store.id}`) || "[]");
    const existing = cart.find((item: any) => item.productId === product.id && item.variantId === (selectedVariant || null));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        variantId: selectedVariant || null,
        name: product.name,
        variant: activeVariant?.name || null,
        price: displayPrice,
        image: images[0]?.url,
        quantity,
      });
    }
    localStorage.setItem(`cart_${store.id}`, JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const whatsappOrder = () => {
    if (!store.whatsapp) return;
    const text = `Hi! I'd like to order:\n\n*${product.name}*${activeVariant ? ` (${activeVariant.name})` : ""}\nQuantity: ${quantity}\nPrice: ${formatPrice(displayPrice * quantity, currency)}\n\nFrom: ${store.name}`;
    window.open(`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`} className="flex items-center gap-2.5">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-display font-bold text-surface-900">{store.name}</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={share} className="p-2 rounded-xl text-surface-500 hover:bg-surface-50">
              <Share2 className="h-5 w-5" />
            </button>
            <Link href={`/store/${slug}`} className="p-2 rounded-xl text-surface-500 hover:bg-surface-50 relative">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-surface-400 mb-6">
          <Link href={`/store/${slug}`} className="hover:text-surface-600">{store.name}</Link>
          <ChevronRight className="h-3 w-3" />
          {product.category && (
            <>
              <span className="hover:text-surface-600">{product.category.name}</span>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-surface-700 font-medium">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-50 border border-surface-100">
              {images[selectedImage]?.url ? (
                <img src={images[selectedImage].url} alt={images[selectedImage].alt || product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-surface-200" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImage ? "border-brand-600 ring-2 ring-brand-100" : "border-surface-200 hover:border-surface-300"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              {product.category && (
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">{product.category.name}</span>
              )}
              <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 font-display mt-1">{product.name}</h1>

              {reviews.stats.totalCount > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Stars rating={reviews.stats.averageRating} />
                  <span className="text-sm text-surface-500">({reviews.stats.totalCount} review{reviews.stats.totalCount !== 1 ? "s" : ""})</span>
                </div>
              )}

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-surface-900">{formatPrice(displayPrice, currency)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-surface-400 line-through">{formatPrice(Number(product.compareAtPrice), currency)}</span>
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">-{discount}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${isInStock ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`text-sm font-medium ${isInStock ? "text-green-700" : "text-red-700"}`}>
                {isInStock ? (product.stock !== undefined ? `In Stock (${product.stock} available)` : "In Stock") : "Out of Stock"}
              </span>
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Options</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id === selectedVariant ? null : v.id)}
                      disabled={!v.inStock}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        v.id === selectedVariant
                          ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100"
                          : v.inStock
                          ? "border-surface-200 text-surface-700 hover:border-surface-300"
                          : "border-surface-100 text-surface-300 cursor-not-allowed"
                      }`}
                    >
                      {v.name}
                      {v.price !== Number(product.price) && ` · ${formatPrice(v.price, currency)}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Quantity</label>
              <div className="inline-flex items-center rounded-xl border border-surface-200">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 text-surface-500 hover:text-surface-700">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 py-2 text-sm font-bold text-surface-900 min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 text-surface-500 hover:text-surface-700">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-surface-900 text-white py-3.5 px-6 text-sm font-bold hover:bg-surface-800 disabled:bg-surface-200 disabled:text-surface-400 disabled:cursor-not-allowed transition-all"
              >
                {addedToCart ? <><Check className="h-4 w-4" /> Added to Cart</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
              </button>
              {store.whatsapp && (
                <button
                  onClick={whatsappOrder}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white py-3.5 px-6 text-sm font-bold hover:bg-green-700 transition-all"
                >
                  <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                </button>
              )}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`p-3.5 rounded-xl border transition-all ${wishlisted ? "border-red-200 bg-red-50 text-red-500" : "border-surface-200 text-surface-400 hover:text-red-500"}`}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500" : ""}`} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: "Fast Delivery", sub: "To your doorstep" },
                { icon: Shield, label: "Secure Payment", sub: "100% protected" },
                { icon: CreditCard, label: "Easy Payment", sub: "Card, transfer, mobile" },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-surface-50">
                  <badge.icon className="h-5 w-5 text-brand-600 mb-1.5" />
                  <span className="text-[10px] font-bold text-surface-800">{badge.label}</span>
                  <span className="text-[9px] text-surface-400">{badge.sub}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-4 border-t border-surface-100">
                <h3 className="text-sm font-bold text-surface-900 mb-2">Description</h3>
                <div className="text-sm text-surface-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-surface-50 text-[10px] font-medium text-surface-500">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews.stats.totalCount > 0 && (
          <section className="mt-16 pt-10 border-t border-surface-100">
            <h2 className="text-xl font-bold text-surface-900 font-display mb-6">Customer Reviews</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl bg-surface-50 p-6 text-center">
                  <div className="text-4xl font-bold text-surface-900">{reviews.stats.averageRating.toFixed(1)}</div>
                  <Stars rating={reviews.stats.averageRating} size={20} />
                  <p className="text-xs text-surface-500 mt-1">{reviews.stats.totalCount} review{reviews.stats.totalCount !== 1 ? "s" : ""}</p>
                  <div className="mt-4 space-y-1.5">
                    {[...reviews.stats.ratingDistribution].reverse().map((d) => (
                      <div key={d.rating} className="flex items-center gap-2">
                        <span className="text-[10px] text-surface-500 w-3">{d.rating}</span>
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2 rounded-full bg-surface-200 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${reviews.stats.totalCount > 0 ? (d.count / reviews.stats.totalCount) * 100 : 0}%` }} />
                        </div>
                        <span className="text-[10px] text-surface-400 w-4 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review List */}
              <div className="lg:col-span-2 space-y-4">
                {reviews.items.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-surface-100 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">
                          {review.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-surface-900">{review.name}</span>
                          {review.isVerified && <span className="ml-1.5 text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Verified</span>}
                        </div>
                      </div>
                      <span className="text-[10px] text-surface-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Stars rating={review.rating} size={14} />
                    {review.title && <p className="text-sm font-semibold text-surface-900 mt-2">{review.title}</p>}
                    {review.body && <p className="text-sm text-surface-600 mt-1 leading-relaxed">{review.body}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-surface-100">
            <h2 className="text-xl font-bold text-surface-900 font-display mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/store/${slug}/product/${p.slug}`} className="group rounded-2xl border border-surface-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-surface-50">
                    {p.images[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-8 w-8 text-surface-200" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-surface-900 truncate">{p.name}</h3>
                    <p className="text-sm font-bold text-surface-900 mt-1">{formatPrice(p.price, p.currency || currency)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-xs text-surface-400">© {new Date().getFullYear()} {store.name}. Powered by AfroStore.</p>
        </div>
      </footer>
    </div>
  );
}
