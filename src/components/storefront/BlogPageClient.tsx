"use client";

import { FashionStoreContext } from "./FashionTemplateBlocks";
import { HealthStoreContext } from "./HealthTemplateBlocks";
import { KidsStoreContext } from "./KidsTemplateBlocks";
import { useWishlist } from "@/hooks/useWishlist";
import type { ReactNode } from "react";

interface BlogPageClientProps {
  children: ReactNode;
  storeId: string;
  storeSlug: string;
  blogs: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    author: string | null;
    category: string | null;
    tags: string[];
    publishedAt: string | null;
    createdAt: string;
  }>;
  products?: any[];
  currency: string;
  socialLinks: Array<{ platform: string; url: string }>;
  template?: string | null;
}

export function BlogPageClient({ children, storeId, storeSlug, blogs, products = [], currency, socialLinks, template }: BlogPageClientProps) {
  const { isWishlisted, toggleWishlist } = useWishlist(storeId, storeSlug);

  const addToCart = (productId: string, quantity: number = 1) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return;
    // Must match the canonical key/shape used everywhere else —
    // prokip_cart_${storeSlug} with a nested `product` object. This
    // previously wrote to `cart_${storeId}` with a flat shape (the same
    // bug already fixed once on the product detail page), so anything
    // added to cart from a blog page's product blocks silently never
    // appeared in the cart icon, cart page, or checkout.
    const cartKey = `prokip_cart_${storeSlug}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existing = cart.find((item: any) => item.productId === productId && !item.variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId,
        variantId: null,
        quantity,
        product,
      });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    localStorage.setItem("prokip_cart_active_slug", storeSlug);
  };

  const storeContextValue = {
    products,
    blogs,
    currency,
    storeSlug,
    socialLinks,
    addToCart,
    toggleWishlist,
    isWishlisted,
  };

  // Use the appropriate context based on template
  if (template === "health" || template === "pills") {
    return (
      <HealthStoreContext.Provider value={storeContextValue}>
        {children}
      </HealthStoreContext.Provider>
    );
  }

  if (template === "kids" || template === "kids-world") {
    return (
      <KidsStoreContext.Provider value={storeContextValue}>
        {children}
      </KidsStoreContext.Provider>
    );
  }

  // Default to FashionStoreContext for other templates
  return (
    <FashionStoreContext.Provider value={storeContextValue}>
      {children}
    </FashionStoreContext.Provider>
  );
}

