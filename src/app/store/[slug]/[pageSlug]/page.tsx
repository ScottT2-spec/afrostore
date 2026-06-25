"use client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ShoppingBag } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { parsePageContent, type PageContentDocument } from "@/lib/page-content";

/* ─── TYPES ─────────────────────────────────────────────────── */

interface PageData {
  store: { id: string; name: string; slug: string; logo?: string };
  page: {
    id: string;
    title: string;
    slug: string;
    type: string;
    template?: string | null;
    content: unknown;
    metaTitle?: string;
    metaDescription?: string;
  };
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const pageSlug = params.pageSlug as string;

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/storefront/${slug}/pages/${pageSlug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          if (json.data.page.metaTitle) {
            document.title = json.data.page.metaTitle;
          } else {
            document.title = `${json.data.page.title} — ${json.data.store.name}`;
          }
        } else {
          setError(json.error || "Page not found");
        }
      } catch {
        setError("Failed to load page");
      }
      setLoading(false);
    })();
  }, [slug, pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 mb-6">{error || "This page doesn't exist."}</p>
          <Link
            href={`/store/${slug}`}
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const { store, page } = data;
  const parsedContent: PageContentDocument = parsePageContent(page.content);
  const blocks: BuilderBlock[] = parsedContent.blocks;

  return (
    <div className="min-h-screen bg-white" style={parsedContent.settings.backgroundColor ? { backgroundColor: parsedContent.settings.backgroundColor } : undefined}>
      {/* Minimal navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href={`/store/${slug}`} className="flex items-center gap-2">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-bold text-gray-900">{store.name}</span>
          </Link>
          <Link
            href={`/store/${slug}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Store
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative overflow-hidden rounded-2xl"
        style={parsedContent.settings.backgroundImage ? {
          backgroundImage: `url(${parsedContent.settings.backgroundImage})`,
          backgroundSize: parsedContent.settings.backgroundSize || "cover",
          backgroundPosition: parsedContent.settings.backgroundPosition || "center center",
          backgroundRepeat: parsedContent.settings.backgroundRepeat || "no-repeat",
          backgroundAttachment: parsedContent.settings.backgroundAttachment || "scroll",
        } : undefined}
      >
        {parsedContent.settings.backgroundImage && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: parsedContent.settings.overlayColor || "#000000",
              opacity: parsedContent.settings.overlayOpacity ?? 0.25,
            }}
          />
        )}
        {blocks.length === 0 ? (
          <div className="text-center py-20 relative z-10">
            <p className="text-gray-400">This page has no content yet.</p>
          </div>
        ) : (
          <div className="relative z-10">
            <RenderBlocks blocks={blocks} storeSlug={slug} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} {store.name}. Powered by <span className="font-semibold text-indigo-500">AfroStore</span></p>
      </footer>
    </div>
  );
}
