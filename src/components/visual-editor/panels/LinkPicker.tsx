"use client";
import { useEffect, useState } from "react";
import { useEditorStore } from "@/lib/visual-editor/store";

interface SitePage {
  slug: string;
  title: string;
  type?: string;
}

const BUILT_IN_PAGES: SitePage[] = [
  { slug: "", title: "Home" },
  { slug: "shop", title: "Shop" },
  { slug: "about", title: "About" },
  { slug: "contact", title: "Contact" },
  { slug: "cart", title: "Cart" },
  { slug: "wishlist", title: "Wishlist" },
  { slug: "blog", title: "Blog" },
];

interface LinkPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Lets someone pick an internal page from a real list (Home, Shop, About,
 * plus any custom pages on this site) OR type a custom/external URL —
 * instead of only ever being able to type a raw href by hand.
 */
export default function LinkPicker({ value, onChange, className = "" }: LinkPickerProps) {
  const siteId = useEditorStore((s) => s.siteId);
  const [pages, setPages] = useState<SitePage[]>(BUILT_IN_PAGES);
  const [mode, setMode] = useState<"page" | "custom">("custom");

  useEffect(() => {
    if (!siteId) return;
    fetch(`/api/sites/${siteId}/pages?limit=100`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data?.pages)) {
          const custom: SitePage[] = json.data.pages
            .filter((p: any) => p.slug && !BUILT_IN_PAGES.some((b) => b.slug === p.slug))
            .map((p: any) => ({ slug: p.slug, title: p.title || p.slug }));
          setPages([...BUILT_IN_PAGES, ...custom]);
        }
      })
      .catch(() => {});
  }, [siteId]);

  // Detect whether the current value matches one of our known internal
  // pages (accounting for the /store/{slug}/ prefix real links use) —
  // decides whether to default to the dropdown or the custom-URL box.
  useEffect(() => {
    if (!value) { setMode("page"); return; }
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("mailto:") || value.startsWith("tel:")) {
      setMode("custom");
      return;
    }
    const cleaned = value.replace(/^\/store\/[^/]+\/?/, "").replace(/^\//, "");
    const isKnownPage = pages.some((p) => p.slug === cleaned) || cleaned === "" || value === "#";
    setMode(isKnownPage && value !== "#" ? "page" : "custom");
  }, [value, pages]);

  const currentSlug = value.replace(/^\/store\/[^/]+\/?/, "").replace(/^\//, "");

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 text-xs">
        <button
          type="button"
          onClick={() => { setMode("page"); onChange(""); }}
          className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${mode === "page" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
        >
          A page on this site
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${mode === "custom" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
        >
          Custom / external URL
        </button>
      </div>

      {mode === "page" ? (
        <select
          value={currentSlug}
          onChange={(e) => onChange(e.target.value ? `/${e.target.value}` : "/")}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {pages.map((p) => (
            <option key={p.slug} value={p.slug}>{p.title}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com or mailto:hello@store.com"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      <p className="text-[11px] text-gray-400 dark:text-gray-500">
        {mode === "page" ? "Picks a page on this store — resolves correctly once your site is live." : "Use a full https:// link for an external site, or mailto:/tel: for contact links."}
      </p>
    </div>
  );
}
