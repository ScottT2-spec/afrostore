"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Editor crashed:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="text-center max-w-lg">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Editor crashed</h2>
        <p className="text-sm text-gray-700 mb-2 font-mono bg-white border border-gray-200 rounded-lg p-3 text-left break-words">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="rounded-xl bg-teal-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors mt-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
