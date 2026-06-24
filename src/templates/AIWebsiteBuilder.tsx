"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Loader2, Sparkles } from "lucide-react";

export default function AIWebsiteBuilder({
  siteId,
  businessContext,
  onBuilt,
}: {
  siteId: string;
  businessContext: Record<string, unknown>;
  onBuilt?: (result: unknown) => void;
}) {
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");

  const build = async () => {
    setBuilding(true);
    setError("");
    const res = await api.post(`/api/stores/${siteId}/ai-build`, businessContext);
    setBuilding(false);
    if (res.success) onBuilt?.(res.data);
    else setError(res.error || "AI build failed");
  };

  return (
    <div className="rounded-xl border border-brand-100 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-surface-900">Build Website For Me</h3>
          <p className="mt-1 text-sm text-surface-500">AI selects the best template, generates pages, and applies starter branding.</p>
          {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
          <button onClick={build} disabled={building} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {building ? "Building..." : "Build Website For Me"}
          </button>
        </div>
      </div>
    </div>
  );
}
