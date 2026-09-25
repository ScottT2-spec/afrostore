"use client";

import { useEffect } from "react";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Storefront page render error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-surface-50">
      <p className="text-lg font-semibold text-surface-900">This page hit a snag loading.</p>
      <p className="text-sm text-surface-500 max-w-sm">
        The rest of the site is fine — just this page. Try again, or head back to the homepage.
      </p>
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Try again
        </button>
        <a
          href="./"
          className="px-4 py-2 rounded-lg border border-surface-200 text-sm font-semibold text-surface-700 hover:bg-surface-100 transition-colors"
        >
          Go to homepage
        </a>
      </div>
    </div>
  );
}
