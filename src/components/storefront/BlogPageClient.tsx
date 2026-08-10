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
  const { isWishlisted, toggleWishlist } = useWishlist(storeId);

  const addToCart = (productId: string, quantity: number = 1) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return;
    const cartKey = `cart_${storeId}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existing = cart.find((item: any) => item.productId === productId && !item.variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId,
        variantId: null,
        name: product.name,
        variant: null,
        price: product.price,
        image: product.images?.[0]?.url || product.image,
        quantity,
      });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
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

