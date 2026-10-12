"use client";
import { ArrowLeft, Loader2 } from "lucide-react";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";

interface HistoryVersion {
  id: string;
  source: "ai" | "manual" | "restore";
  label: string | null;
  createdAt: string;
  isOriginal: boolean;
  pageCount: number;
}

interface HistoryResponse {
  site: { id: string; name: string; slug: string };
  versions: HistoryVersion[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function versionTitle(v: HistoryVersion) {
  if (v.isOriginal) return "Original site";
  if (v.source === "restore") return "Restored an earlier version";
  if (v.label && !v.label.startsWith("Restored from ")) return v.label;
  return v.source === "ai" ? "AI change" : "Your change";
}

export default function SiteHistoryPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [selected, setSelected] = useState<HistoryVersion | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await api.get<HistoryResponse>(`/api/sites/${siteId}/history`);
    if (res.success && res.data) setData(res.data);
    else setError(res.error || "Could not load site history");
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  async function restore() {
    if (!selected) return;
    setRestoring(true);
    setError("");
    const res = await api.post(`/api/sites/${siteId}/history/${selected.id}/restore`, {});
    setRestoring(false);
    setConfirming(false);
    if (res.success) {
      setNotice(`Your site is back to the version from ${formatDate(selected.createdAt)}.`);
      setSelected(null);
      await load();
    } else {
      setError(res.error || "Could not restore this version");
    }
  }

  // ── Preview-only screen, Restore at the top right ──
  if (selected && data) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => {
                setSelected(null);
                setConfirming(false);
              }}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{versionTitle(selected)}</p>
              <p className="truncate text-xs text-gray-500">{formatDate(selected.createdAt)} · preview only</p>
            </div>
          </div>
          <button
            onClick={() => setConfirming(true)}
            disabled={restoring}
            className="flex-shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Restore
          </button>
        </div>

        {error && <p className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <iframe
          key={selected.id}
          title="Site preview"
          src={`/store/${data.site.slug}?historyPreview=${encodeURIComponent(selected.id)}`}
          className="w-full flex-1 border-0"
        />

        {confirming && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Restore this version?</h2>
              <p className="mt-2 text-sm text-gray-600">
                Your whole site goes back to how it looked on {formatDate(selected.createdAt)}. Your current version is
                saved in the history first, so you can switch back.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  disabled={restoring}
                  className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={restore}
                  disabled={restoring}
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {restoring && <Loader2 className="h-4 w-4 animate-spin" />}
                  Restore
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── History list ──
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link href="/dashboard/workspaces" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Workspaces
      </Link>
      <h1 className="text-xl font-bold text-gray-900">Site history</h1>
      <p className="mt-1 text-sm text-gray-500">
        {data ? `Every saved version of ${data.site.name}. Pick one to preview it, then restore it if you like.` : "Every saved version of your site."}
      </p>

      {notice && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : data && data.versions.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No history yet. Versions appear here after the first change you make to this site.
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {data?.versions.map((v, i) => (
            <li key={v.id}>
              <button
                onClick={() => {
                  setNotice("");
                  setSelected(v);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {versionTitle(v)}
                    {i === 0 && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">Latest</span>}
                    {v.isOriginal && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">AI generated</span>}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(v.createdAt)}</p>
                </div>
                <span className="flex-shrink-0 text-xs font-medium text-brand-700">Preview</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
