"use client";
import { Loader2, Plus, X } from "lucide-react";
import { Activity, BarChart3, CheckCircle2, Eye, MousePointerClick, Pause, Pencil, Play, Trash2, Trophy, ChevronDown, ChevronUp } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { parsePageContent } from "@/lib/page-content";

interface Variant {
  id: string;
  name: string;
  content?: { blockOverrides?: Record<string, Record<string, unknown>> } | null;
  weight: number;
}
interface ABTestItem {
  id: string; name: string; status: string; pageId: string | null;
  page: { id: string; title: string; slug: string } | null;
  variants: Variant[]; winnerVariantId: string | null;
  startsAt: string | null; endsAt: string | null; createdAt: string;
}
interface VariantResult extends Variant { views: number; conversions: number; conversionRate: number; }
interface TestStats {
  testId: string; status: string; winnerVariantId: string | null;
  totalViews: number; totalConversions: number; leadingVariantId: string | null;
  variants: VariantResult[];
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-surface-100 text-surface-500", RUNNING: "bg-green-50 text-green-700",
  PAUSED: "bg-amber-50 text-amber-700", COMPLETED: "bg-blue-50 text-blue-700",
};

export default function ABTestsPage() {
  const { currentStore } = useSite();
  const [tests, setTests] = useState<ABTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [pageId, setPageId] = useState<string>("");
  const [variants, setVariants] = useState<Array<{ id: string; name: string; weight: number; content?: { blockOverrides?: Record<string, Record<string, unknown>> } }>>([
    { id: "a", name: "Variant A", weight: 50 }, { id: "b", name: "Variant B", weight: 50 },
  ]);

  const [sitePages, setSitePages] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [pageBlocks, setPageBlocks] = useState<Array<{ id: string; type: string }>>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  // Per-variant "add an override" draft: which block + which field/value.
  const [overrideDraft, setOverrideDraft] = useState<Record<string, { blockId: string; field: string; value: string }>>({});

  const fetchSitePages = useCallback(async () => {
    if (!currentStore) return;
    const res = await api.get<{ pages: Array<{ id: string; title: string; slug: string }> }>(`/api/sites/${currentStore.id}/pages?limit=100`);
    if (res.success && res.data) setSitePages(res.data.pages || []);
  }, [currentStore]);

  useEffect(() => { fetchSitePages(); }, [fetchSitePages]);

  const loadPageBlocks = useCallback(async (targetPageId: string) => {
    if (!currentStore || !targetPageId) { setPageBlocks([]); return; }
    setLoadingBlocks(true);
    const res = await api.get<{ content: unknown }>(`/api/sites/${currentStore.id}/pages/${targetPageId}`);
    if (res.success && res.data) {
      try {
        const parsed = parsePageContent((res.data as any).content);
        const blocks = (parsed.blocks || []).filter((b: any) => b?.id).map((b: any) => ({ id: b.id as string, type: (b.type as string) || "block" }));
        setPageBlocks(blocks);
      } catch {
        setPageBlocks([]);
      }
    } else {
      setPageBlocks([]);
    }
    setLoadingBlocks(false);
  }, [currentStore]);

  useEffect(() => {
    if (pageId) loadPageBlocks(pageId);
    else setPageBlocks([]);
  }, [pageId, loadPageBlocks]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, TestStats>>({});
  const [statsLoading, setStatsLoading] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<Record<string, string>>({});
  const [decidingWinner, setDecidingWinner] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ tests: ABTestItem[] }>(`/api/sites/${currentStore.id}/ab-tests`);
    if (res.success && res.data) setTests(res.data.tests || []);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const resetForm = () => {
    setName(""); setPageId(""); setPageBlocks([]); setOverrideDraft({});
    setVariants([{ id: "a", name: "Variant A", weight: 50 }, { id: "b", name: "Variant B", weight: 50 }]);
    setEditingId(null);
  };

  const openEdit = (t: ABTestItem) => {
    setName(t.name);
    setPageId(t.pageId || "");
    setVariants(t.variants.map((v) => ({ id: v.id, name: v.name, weight: v.weight, content: v.content || undefined })));
    setEditingId(t.id); setShowEditor(true);
  };

  const saveTest = async () => {
    if (!currentStore || !name.trim() || !pageId || variants.length < 2) return;
    setSaving(true);
    const payload = { name: name.trim(), pageId: pageId || null, variants };
    if (editingId) await api.patch(`/api/sites/${currentStore.id}/ab-tests/${editingId}`, payload);
    else await api.post(`/api/sites/${currentStore.id}/ab-tests`, payload);
    setShowEditor(false); resetForm(); setSaving(false); fetchTests();
  };

  const deleteTest = async (id: string) => {
    if (!currentStore || !confirm("Delete this A/B test?")) return;
    setDeleteId(id); await api.delete(`/api/sites/${currentStore.id}/ab-tests/${id}`);
    setTests((p) => p.filter((t) => t.id !== id)); setDeleteId(null);
  };

  const changeStatus = async (id: string, status: string) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/ab-tests/${id}`, { status });
    fetchTests();
  };

  const addVariant = () => {
    const letter = String.fromCharCode(97 + variants.length);
    setVariants((v) => [...v, { id: letter, name: `Variant ${letter.toUpperCase()}`, weight: Math.floor(100 / (variants.length + 1)) }]);
  };

  const loadStats = useCallback(async (testId: string) => {
    if (!currentStore) return;
    setStatsLoading(testId);
    setStatsError((prev) => { const next = { ...prev }; delete next[testId]; return next; });
    const res = await api.get<TestStats>(`/api/sites/${currentStore.id}/ab-tests/${testId}/stats`);
    if (res.success && res.data) {
      setStats((prev) => ({ ...prev, [testId]: res.data as TestStats }));
    } else {
      setStatsError((prev) => ({ ...prev, [testId]: res.error || "Couldn't load results" }));
    }
    setStatsLoading(null);
  }, [currentStore]);

  const toggleResults = (testId: string) => {
    if (expandedId === testId) { setExpandedId(null); return; }
    setExpandedId(testId);
    loadStats(testId);
  };

  const declareWinner = async (testId: string, variantId: string) => {
    if (!currentStore) return;
    setDecidingWinner(variantId);
    await api.patch(`/api/sites/${currentStore.id}/ab-tests/${testId}`, { winnerVariantId: variantId, status: "COMPLETED" });
    await Promise.all([fetchTests(), loadStats(testId)]);
    setDecidingWinner(null);
  };

  const setOverrideDraftField = (variantId: string, field: "blockId" | "field" | "value", value: string) => {
    setOverrideDraft((prev) => {
      const current = prev[variantId] || { blockId: "", field: "", value: "" };
      return { ...prev, [variantId]: { ...current, [field]: value } };
    });
  };

  const addOverride = (variantId: string) => {
    const draft = overrideDraft[variantId];
    if (!draft?.blockId || !draft.field.trim()) return;
    setVariants((prev) => prev.map((v) => {
      if (v.id !== variantId) return v;
      const blockOverrides = { ...(v.content?.blockOverrides || {}) };
      blockOverrides[draft.blockId] = { ...(blockOverrides[draft.blockId] || {}), [draft.field.trim()]: draft.value };
      return { ...v, content: { blockOverrides } };
    }));
    setOverrideDraft((prev) => ({ ...prev, [variantId]: { blockId: draft.blockId, field: "", value: "" } }));
  };

  const removeOverride = (variantId: string, blockId: string, field: string) => {
    setVariants((prev) => prev.map((v) => {
      if (v.id !== variantId) return v;
      const blockOverrides = { ...(v.content?.blockOverrides || {}) };
      if (blockOverrides[blockId]) {
        const fields = { ...blockOverrides[blockId] };
        delete fields[field];
        if (Object.keys(fields).length === 0) delete blockOverrides[blockId];
        else blockOverrides[blockId] = fields;
      }
      return { ...v, content: { blockOverrides } };
    }));
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">A/B Testing</h1><p className="text-sm text-surface-500 mt-1">Split test pages and content to optimize conversions</p></div>
        <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> New Test</button>
      </div>

      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">{editingId ? "Edit" : "New"} A/B Test</h3>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Test Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-field py-2.5 w-full" placeholder="Homepage Hero Test" autoFocus /></div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Page *</label>
            <select value={pageId} onChange={(e) => setPageId(e.target.value)} className="input-field py-2.5 w-full">
              <option value="">Select a page…</option>
              {sitePages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <p className="text-xs text-surface-400 mt-1">A test only runs on the page it's linked to — visitors are split when they land here.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Variants</label>
            {variants.map((v, idx) => {
              const overrides = v.content?.blockOverrides || {};
              const overrideEntries = Object.entries(overrides).flatMap(([blockId, fields]) =>
                Object.entries(fields).map(([field, value]) => ({ blockId, field, value }))
              );
              const draft = overrideDraft[v.id] || { blockId: "", field: "", value: "" };
              return (
                <div key={v.id} className="rounded-xl border border-surface-200 p-3 mb-2 space-y-2">
                  <div className="flex items-center gap-3">
                    <input value={v.name} onChange={(e) => { const vs = [...variants]; vs[idx] = { ...vs[idx], name: e.target.value }; setVariants(vs); }} className="input-field py-2 text-sm flex-1" placeholder="Variant name" />
                    <div className="flex items-center gap-1">
                      <input type="number" value={v.weight} min={0} max={100} onChange={(e) => { const vs = [...variants]; vs[idx] = { ...vs[idx], weight: parseInt(e.target.value) || 0 }; setVariants(vs); }} className="input-field py-2 text-sm w-20 text-center" />
                      <span className="text-xs text-surface-400">%</span>
                    </div>
                    {variants.length > 2 && <button onClick={() => setVariants((v) => v.filter((_, i) => i !== idx))} className="text-surface-400 hover:text-accent-600"><Trash2 className="h-4 w-4" /></button>}
                  </div>

                  {idx === 0 ? (
                    <p className="text-[11px] text-surface-400">Control — shows the page exactly as it is now, no changes needed.</p>
                  ) : !pageId ? (
                    <p className="text-[11px] text-surface-400">Select a page above to change what this variant shows.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {overrideEntries.length > 0 && (
                        <div className="space-y-1">
                          {overrideEntries.map(({ blockId, field, value }) => {
                            const block = pageBlocks.find((b) => b.id === blockId);
                            return (
                              <div key={`${blockId}-${field}`} className="flex items-center gap-2 text-xs bg-surface-50 rounded-lg px-2 py-1.5">
                                <span className="font-medium text-surface-700">{block?.type || "block"}</span>
                                <span className="text-surface-400">·</span>
                                <span className="text-surface-600">{field} = "{String(value)}"</span>
                                <button onClick={() => removeOverride(v.id, blockId, field)} className="ml-auto text-surface-400 hover:text-accent-600"><X className="h-3 w-3" /></button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={draft.blockId}
                          onChange={(e) => setOverrideDraftField(v.id, "blockId", e.target.value)}
                          className="input-field py-1.5 text-xs flex-1"
                          disabled={loadingBlocks}
                        >
                          <option value="">{loadingBlocks ? "Loading blocks…" : "Choose a block…"}</option>
                          {pageBlocks.map((b) => <option key={b.id} value={b.id}>{b.type}</option>)}
                        </select>
                        <input
                          value={draft.field}
                          onChange={(e) => setOverrideDraftField(v.id, "field", e.target.value)}
                          placeholder="field (e.g. heading)"
                          className="input-field py-1.5 text-xs w-32"
                        />
                        <input
                          value={draft.value}
                          onChange={(e) => setOverrideDraftField(v.id, "value", e.target.value)}
                          placeholder="new value"
                          className="input-field py-1.5 text-xs w-32"
                        />
                        <button onClick={() => addOverride(v.id)} disabled={!draft.blockId || !draft.field.trim()} className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-40 whitespace-nowrap">Add</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={addVariant} className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-1"><Plus className="h-3.5 w-3.5 inline" /> Add Variant</button>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveTest} disabled={saving || !name.trim() || !pageId || variants.length < 2} className="btn-primary text-sm py-2.5 px-6">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}</button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : tests.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Activity className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No A/B tests yet</h3>
          <p className="text-sm text-surface-500 mb-5">Create split tests to find what converts best.</p>
          <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Create First Test</button>
        </div>
      ) : !showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {tests.map((t) => {
            const winner = t.winnerVariantId ? t.variants.find((v) => v.id === t.winnerVariantId) : null;
            const isExpanded = expandedId === t.id;
            const testStats = stats[t.id];
            const maxRate = testStats ? Math.max(0.0001, ...testStats.variants.map((v) => v.conversionRate)) : 0;
            return (
              <div key={t.id}>
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0"><Activity className="h-5 w-5 text-indigo-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-surface-900">{t.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[t.status] || "bg-surface-100 text-surface-500"}`}>{t.status}</span>
                      {winner && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex items-center gap-0.5"><Trophy className="h-3 w-3" /> {winner.name}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-400 mt-0.5">
                      <span>{t.variants.length} variants</span>
                      {t.page && <span>· Page: {t.page.title}</span>}
                      <span>· {t.variants.map((v) => `${v.name} (${v.weight}%)`).join(" vs ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleResults(t.id)} className="p-2 rounded-lg hover:bg-indigo-50 text-surface-400 hover:text-indigo-600" title="View results">
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    {t.status === "DRAFT" && <button onClick={() => changeStatus(t.id, "RUNNING")} className="p-2 rounded-lg hover:bg-green-50 text-surface-400 hover:text-green-600" title="Start"><Play className="h-4 w-4" /></button>}
                    {t.status === "RUNNING" && <button onClick={() => changeStatus(t.id, "PAUSED")} className="p-2 rounded-lg hover:bg-amber-50 text-surface-400 hover:text-amber-600" title="Pause"><Pause className="h-4 w-4" /></button>}
                    {t.status === "PAUSED" && <button onClick={() => changeStatus(t.id, "RUNNING")} className="p-2 rounded-lg hover:bg-green-50 text-surface-400 hover:text-green-600" title="Resume"><Play className="h-4 w-4" /></button>}
                    <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteTest(t.id)} disabled={deleteId === t.id} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600" title="Delete">
                      {deleteId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                    <button onClick={() => toggleResults(t.id)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 bg-surface-50/50">
                    {statsLoading === t.id ? (
                      <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-brand-600" /></div>
                    ) : statsError[t.id] ? (
                      <div className="flex items-center justify-between py-4 px-1">
                        <p className="text-xs text-accent-600">Couldn't load results: {statsError[t.id]}</p>
                        <button onClick={() => loadStats(t.id)} className="text-xs font-medium text-brand-600 hover:text-brand-700">Retry</button>
                      </div>
                    ) : !testStats ? (
                      <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-brand-600" /></div>
                    ) : testStats.totalViews === 0 ? (
                      <p className="text-xs text-surface-400 py-4">
                        No traffic recorded yet. {t.status === "RUNNING" ? "This test is live — results will appear once visitors reach the page." : "Start the test to begin collecting results."}
                      </p>
                    ) : (
                      <div className="space-y-3 pt-2">
                        {testStats.variants.map((v) => {
                          const isLeader = testStats.leadingVariantId === v.id && testStats.totalViews > 0;
                          const isWinner = testStats.winnerVariantId === v.id;
                          return (
                            <div key={v.id} className="rounded-xl border border-surface-200 bg-white p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-surface-900">
                                  {v.name}
                                  {isWinner && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 flex items-center gap-0.5"><Trophy className="h-3 w-3" /> Winner</span>}
                                  {!isWinner && isLeader && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">Leading</span>}
                                </div>
                                {!testStats.winnerVariantId && t.status !== "DRAFT" && (
                                  <button
                                    onClick={() => declareWinner(t.id, v.id)}
                                    disabled={decidingWinner === v.id}
                                    className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 disabled:opacity-50"
                                  >
                                    {decidingWinner === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Declare winner
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-surface-500 mb-2">
                                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {v.views} views</span>
                                <span className="flex items-center gap-1"><MousePointerClick className="h-3.5 w-3.5" /> {v.conversions} conversions</span>
                                <span className="font-semibold text-surface-700">{(v.conversionRate * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-surface-100 overflow-hidden">
                                <div className={`h-full rounded-full ${isLeader ? "bg-green-500" : "bg-surface-300"}`} style={{ width: `${Math.max(2, (v.conversionRate / maxRate) * 100)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-[11px] text-surface-400 pt-1">{testStats.totalViews} total views · {testStats.totalConversions} total conversions</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
