"use client";

import { FashionStoreContext } from "./FashionTemplateBlocks";
import { HealthStoreContext } from "./HealthTemplateBlocks";
import { KidsStoreContext } from "./KidsTemplateBlocks";
import type { ReactNode } from "react";

interface BlogPageClientProps {
  children: ReactNode;
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
  currency: string;
  socialLinks: Array<{ platform: string; url: string }>;
  template?: string | null;
}

export function BlogPageClient({ children, storeSlug, blogs, currency,socialLinks, template }: BlogPageClientProps) {
  const storeContextValue = {
    products: [],
    blogs,
    currency,
    storeSlug,
    socialLinks,
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
