"use client";
import { ArrowRight, LayoutTemplate } from "lucide-react";
import { Sparkles } from "@/components/icons/FilledIcons";

import { useRouter, useSearchParams } from "next/navigation";

export default function CreateSiteChoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspace = searchParams.get("workspace");
  const suffix = workspace ? `?workspace=${workspace}` : "";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-surface-900 font-display">How do you want to build?</h1>
        <p className="text-surface-500 mt-2">Pick whichever fits — you can always ask the AI to change things later either way.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <button
          onClick={() => router.push(`/dashboard/ai-business${suffix}`)}
          className="group text-left rounded-2xl border-2 border-surface-200 bg-white p-8 hover:border-brand-500 hover:shadow-lg transition-all"
        >
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-lg font-bold text-surface-900 mb-1.5">AI Business</h2>
          <p className="text-sm text-surface-500 mb-4">Describe your business — the AI writes the copy, picks images, and builds every page for you in minutes.</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:gap-2.5 transition-all">
            Get started <ArrowRight className="h-4 w-4" />
          </span>
        </button>

        <button
          onClick={() => router.push(`/dashboard/new-site${suffix}`)}
          className="group text-left rounded-2xl border-2 border-surface-200 bg-white p-8 hover:border-brand-500 hover:shadow-lg transition-all"
        >
          <div className="h-14 w-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <LayoutTemplate className="h-7 w-7 text-surface-700" />
          </div>
          <h2 className="text-lg font-bold text-surface-900 mb-1.5">Build with a Template</h2>
          <p className="text-sm text-surface-500 mb-4">Pick a ready-made design for your industry and customize it yourself, section by section.</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:gap-2.5 transition-all">
            Browse templates <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
