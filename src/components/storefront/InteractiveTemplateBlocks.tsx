"use client";

import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { TemplateStoreContextProvider } from "@/components/storefront/TemplateStoreContextProvider";
import { useWishlist } from "@/hooks/useWishlist";

interface Props {
  templateSlug: string | null;
  blocks: TemplateBlock[];
  products?: any[];
  blogs?: any[];
  categories?: Array<{ id: string; name: string; slug: string; description?: string | null; image?: string | null }>;
  currency?: string;
  storeId: string;
  storeSlug: string;
  socialLinks?: Array<{ platform: string; url: string }>;
}

/**
 * Drop-in replacement for a bare <RenderTemplateBlocks /> call inside a
 * Server Component page (about, contact, blog, projects, etc). Server
 * Components can't call hooks or hold client-side state, so a product
 * grid's wishlist heart / add-to-cart there would otherwise silently
 * no-op — this small client island supplies the real, working functions
 * via the same context every other storefront page uses, without having
 * to convert the whole page to a Client Component.
 */
export default function InteractiveTemplateBlocks({
  templateSlug,
  blocks,
  products = [],
  blogs = [],
  categories,
  currency = "NGN",
  storeId,
  storeSlug,
  socialLinks,
}: Props) {
  const { isWishlisted, toggleWishlist } = useWishlist(storeId, storeSlug);

  const addToCart = (productId: string, quantity: number = 1) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return;
    // Must use the same key AND item shape as every other storefront page
    // (shop, homepage, product, cart, checkout) — afrostore_cart_${storeSlug}
    // with a nested `product` object. This previously wrote to a different
    // key (`cart_${storeId}`) with a flat shape — the exact same bug that
    // was already found and fixed on the product detail page — so anything
    // added here (any product-grid block on a Server Component page: about,
    // contact, projects, etc) silently never appeared in the cart icon,
    // cart page, or checkout.
    const cartKey = `afrostore_cart_${storeSlug}`;
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
    localStorage.setItem("afrostore_cart_active_slug", storeSlug);
  };

  return (
    <TemplateStoreContextProvider
      templateSlug={templateSlug}
      products={products}
      blogs={blogs}
      categories={categories}
      currency={currency}
      storeSlug={storeSlug}
      socialLinks={socialLinks}
      addToCart={addToCart}
      toggleWishlist={toggleWishlist}
      isWishlisted={isWishlisted}
    >
      <RenderTemplateBlocks blocks={blocks} />
    </TemplateStoreContextProvider>
  );
}
