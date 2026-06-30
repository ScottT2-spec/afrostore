"use client";

import { RenderBlocks } from "@/components/storefront/BlockRenderer";

export default function FeaturedProducts(props: Record<string, unknown>) {
  const { storeSlug, products, currency, addToCart, isWishlisted, toggleWishlist, addedToCart, ...sectionProps } = props;

  return (
    <RenderBlocks
      blocks={[{ id: "featured-products", type: "featured_products", props: sectionProps }]}
      storeSlug={typeof storeSlug === "string" ? storeSlug : undefined}
      products={Array.isArray(products) ? (products as any) : undefined}
      currency={typeof currency === "string" ? currency : undefined}
      addToCart={typeof addToCart === "function" ? (addToCart as any) : undefined}
      isWishlisted={typeof isWishlisted === "function" ? (isWishlisted as any) : undefined}
      toggleWishlist={typeof toggleWishlist === "function" ? (toggleWishlist as any) : undefined}
      addedToCart={typeof addedToCart === "string" ? addedToCart : undefined}
    />
  );
}
