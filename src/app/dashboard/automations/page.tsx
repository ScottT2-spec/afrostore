"use client";
import { ChevronDown, ChevronRight, Loader2, Plus } from "lucide-react";
import { Bot, Clock, CreditCard, FileText, Globe, Mail, MessageSquare, MousePointer, Pause, Pencil, Play, ShoppingBag, ShoppingCart, Smartphone, Tag, Timer, Trash2, Users, Zap } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface AutomationItem {
  id: string; name: string; description: string | null;
  trigger: { type: string; conditions?: Record<string, unknown> };
  actions: Array<{ type: string; config?: Record<string, unknown> }>;
  isActive: boolean; triggerCount: number; lastTriggeredAt: string | null;
  createdAt: string; _count?: { logs: number };
}

interface AutomationLog { id: string; status: string; triggerData: unknown; result: unknown; error: string | null; executedAt: string; }

const triggerLabels: Record<string, string> = {
  new_order: "New Order", new_lead: "New Lead", abandoned_cart: "Abandoned Cart",
  payment_success: "Payment Success", form_submission: "Form Submission",
  product_purchase: "Product Purchase", visitor_activity: "Visitor Activity", schedule: "Schedule",
};
const triggerIcons: Record<string, typeof Zap> = {
  new_order: ShoppingCart, new_lead: Users, abandoned_cart: ShoppingBag,
  payment_success: CreditCard, form_submission: FileText, product_purchase: ShoppingCart,
  visitor_activity: MousePointer, schedule: Clock,
};
const actionLabels: Record<string, string> = {
  send_email: "Send Email", send_sms: "Send SMS", send_whatsapp: "Send WhatsApp",
  create_task: "Create Task", assign_user: "Assign User", add_crm_tag: "Add CRM Tag",
  ai_response: "AI Response", webhook: "Webhook", delay: "Delay",
};
const actionIcons: Record<string, typeof Zap> = {
  send_email: Mail, send_sms: Smartphone, send_whatsapp: MessageSquare,
  create_task: FileText, assign_user: Users, add_crm_tag: Tag,
  ai_response: Bot, webhook: Globe, delay: Timer,
};

// Actions with a working backend today. The rest render a "coming soon"
// notice instead of fields, so the editor doesn't imply they'll do
// something they can't yet.
const IMPLEMENTED_ACTIONS = new Set(["send_email", "send_sms", "send_whatsapp", "add_crm_tag", "webhook", "create_task"]);

type FieldDef = { key: string; label: string; type: "text" | "textarea" | "url"; placeholder?: string; helper?: string; required?: boolean };

const actionFields: Record<string, FieldDef[]> = {
  send_email: [
    { key: "to", label: "Send to", type: "text", placeholder: "Leave blank to email the customer", helper: "Defaults to the customer's email from the order/lead." },
    { key: "subject", label: "Subject", type: "text", placeholder: "e.g. Thanks for your order, {{firstName}}!" },
    { key: "body", label: "Message", type: "textarea", placeholder: "Write the email body here…" },
  ],
  send_sms: [
    { key: "to", label: "Send to", type: "text", placeholder: "Leave blank to text the customer", helper: "Defaults to the customer's phone number." },
    { key: "message", label: "Message", type: "textarea", placeholder: "Keep it short — SMS has a character limit." },
  ],
  send_whatsapp: [
    { key: "to", label: "Send to", type: "text", placeholder: "Leave blank to message the customer", helper: "Defaults to the customer's phone number." },
    { key: "message", label: "Message", type: "textarea", placeholder: "Write your WhatsApp message here…" },
    { key: "mediaUrl", label: "Attach image/media URL (optional)", type: "url", placeholder: "https://…" },
  ],
  add_crm_tag: [
    { key: "tag", label: "Tag to add", type: "text", placeholder: "e.g. vip-customer", required: true },
  ],
  create_task: [
    { key: "title", label: "Task title", type: "text", placeholder: "e.g. Follow up with new lead" },
  ],
  webhook: [
    { key: "url", label: "Webhook URL", type: "url", placeholder: "https://your-service.com/webhook", required: true, helper: "We'll POST the trigger data as JSON to this URL." },
  ],
};

// Merge fields available to interpolate into text fields, per trigger type
// (matches the `data` shape each trigger passes into the engine).
const triggerVariables: Record<string, string[]> = {
  new_order: ["orderNumber", "email", "phone", "total", "currency"],
  payment_success: ["orderId", "email", "phone", "total", "currency", "method"],
  new_lead: ["email", "phone", "source"],
  form_submission: ["email", "phone", "source"],
  abandoned_cart: ["email", "phone", "total"],
  product_purchase: ["orderNumber", "email", "total"],
  visitor_activity: ["email"],
  schedule: [],
};

export default function AutomationsPage() {
  const { currentStore } = useSite();
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("new_order");
  const [actions, setActions] = useState<Array<{ type: string; config: Record<string, string> }>>([{ type: "send_email", config: {} }]);

  const fetchAutomations = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ automations: AutomationItem[] }>(`/api/sites/${currentStore.id}/automations`);
    if (res.success && res.data) setAutomations(res.data.automations || []);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const resetForm = () => { setName(""); setDescription(""); setTriggerType("new_order"); setActions([{ type: "send_email", config: {} }]); setEditingId(null); };
  const openCreate = () => { resetForm(); setShowEditor(true); };

  const openEdit = (a: AutomationItem) => {
    setName(a.name); setDescription(a.description || ""); setTriggerType(a.trigger.type);
    setActions(a.actions.map((act) => ({ type: act.type, config: Object.fromEntries(Object.entries(act.config || {}).map(([k, v]) => [k, String(v ?? "")])) })));
    setEditingId(a.id); setShowEditor(true);
  };

  const saveAutomation = async () => {
    if (!currentStore || !name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      trigger: { type: triggerType },
      actions: actions.map((a) => ({
        type: a.type,
        config: Object.fromEntries(Object.entries(a.config).filter(([, v]) => v.trim() !== "")),
      })),
    };
    if (editingId) await api.patch(`/api/sites/${currentStore.id}/automations/${editingId}`, payload);
    else await api.post(`/api/sites/${currentStore.id}/automations`, payload);
    setShowEditor(false); resetForm(); setSaving(false); fetchAutomations();
  };

  const deleteAutomation = async (id: string) => {
    if (!currentStore || !confirm("Delete this automation?")) return;
    setDeleteId(id); await api.delete(`/api/sites/${currentStore.id}/automations/${id}`);
    setAutomations((p) => p.filter((a) => a.id !== id)); setDeleteId(null);
  };

  const toggleActive = async (a: AutomationItem) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/automations/${a.id}`, { isActive: !a.isActive });
    setAutomations((p) => p.map((x) => (x.id === a.id ? { ...x, isActive: !x.isActive } : x)));
  };

  const viewLogs = async (id: string) => {
    if (!currentStore) return;
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id); setLogsLoading(true);
    const res = await api.get<AutomationItem & { logs: AutomationLog[] }>(`/api/sites/${currentStore.id}/automations/${id}`);
    if (res.success && res.data) setLogs((res.data as any).logs || []);
    setLogsLoading(false);
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Automations</h1>
          <p className="text-sm text-surface-500 mt-1">Automate workflows triggered by orders, leads, and more</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> New Automation</button>
      </div>

      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">{editingId ? "Edit" : "New"} Automation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-field py-2.5 w-full" autoFocus /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Description</label><input value={description} onChange={(e) => setDescription(e.target.value)} className="input-field py-2.5 w-full" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">When this happens (Trigger)</label>
            <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)} className="input-field py-2.5 w-full">
              {Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Do these actions</label>
            <div className="space-y-3">
              {actions.map((act, idx) => {
                const ActionIcon = actionIcons[act.type] || Zap;
                const fields = actionFields[act.type] || [];
                const implemented = IMPLEMENTED_ACTIONS.has(act.type);
                return (
                  <div key={idx} className="rounded-xl border border-surface-200 bg-surface-50/60 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-3.5 py-3 bg-white border-b border-surface-100">
                      <span className="h-6 w-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                      <ActionIcon className="h-4 w-4 text-surface-400 flex-shrink-0" />
                      <select
                        value={act.type}
                        onChange={(e) => { const a = [...actions]; a[idx] = { type: e.target.value, config: {} }; setActions(a); }}
                        className="input-field py-2 text-sm flex-1"
                      >
                        {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      {actions.length > 1 && (
                        <button onClick={() => setActions((a) => a.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg text-surface-400 hover:text-accent-600 hover:bg-accent-50 flex-shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {!implemented ? (
                      <div className="px-3.5 py-3 flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Coming soon</span>
                        <p className="text-xs text-surface-500">This action can be selected but isn't wired up to actually run yet.</p>
                      </div>
                    ) : (
                      <div className="px-3.5 py-3.5 space-y-3">
                        {fields.map((f) => (
                          <div key={f.key}>
                            <label className="block text-xs font-medium text-surface-600 mb-1">
                              {f.label}{f.required && <span className="text-accent-600"> *</span>}
                            </label>
                            {f.type === "textarea" ? (
                              <textarea
                                value={act.config[f.key] || ""}
                                onChange={(e) => { const a = [...actions]; a[idx] = { ...act, config: { ...act.config, [f.key]: e.target.value } }; setActions(a); }}
                                placeholder={f.placeholder}
                                rows={3}
                                className="input-field py-2 text-sm w-full resize-none"
                              />
                            ) : (
                              <input
                                type={f.type === "url" ? "url" : "text"}
                                value={act.config[f.key] || ""}
                                onChange={(e) => { const a = [...actions]; a[idx] = { ...act, config: { ...act.config, [f.key]: e.target.value } }; setActions(a); }}
                                placeholder={f.placeholder}
                                className="input-field py-2 text-sm w-full"
                              />
                            )}
                            {f.helper && <p className="text-[11px] text-surface-400 mt-1">{f.helper}</p>}
                          </div>
                        ))}

                        {(act.type === "send_email" || act.type === "send_sms" || act.type === "send_whatsapp") && (triggerVariables[triggerType]?.length ?? 0) > 0 && (
                          <div className="pt-1">
                            <p className="text-[11px] font-medium text-surface-400 mb-1.5">Insert a variable into your message:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {triggerVariables[triggerType].map((v) => (
                                <code key={v} className="text-[11px] px-2 py-1 rounded-md bg-surface-100 text-surface-600 font-mono">{`{{${v}}}`}</code>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setActions((a) => [...a, { type: "send_email", config: {} }])} className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-3">
              <Plus className="h-3.5 w-3.5 inline" /> Add Action
            </button>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveAutomation} disabled={saving || !name.trim()} className="btn-primary text-sm py-2.5 px-6">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}</button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : automations.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Zap className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No automations yet</h3>
          <p className="text-sm text-surface-500 mb-5">Automate repetitive tasks like emails, SMS, and CRM updates.</p>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Create First Automation</button>
        </div>
      ) : !showEditor && (
        <div className="space-y-3">
          {automations.map((a) => {
            const TriggerIcon = triggerIcons[a.trigger.type] || Zap;
            return (
              <div key={a.id} className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 group">
                  <button onClick={() => viewLogs(a.id)} className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 hover:bg-amber-100">
                    {expandedId === a.id ? <ChevronDown className="h-5 w-5 text-amber-600" /> : <ChevronRight className="h-5 w-5 text-amber-600" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-surface-900">{a.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.isActive ? "bg-green-50 text-green-700" : "bg-surface-100 text-surface-500"}`}>{a.isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-400 mt-0.5">
                      <span className="flex items-center gap-1"><TriggerIcon className="h-3 w-3" /> {triggerLabels[a.trigger.type]}</span>
                      <span>→</span>
                      {a.actions.map((act, i) => {
                        const AI = actionIcons[act.type] || Zap;
                        const notReady = !IMPLEMENTED_ACTIONS.has(act.type);
                        return (
                          <span key={i} className={`flex items-center gap-1 ${notReady ? "text-amber-600" : ""}`}>
                            <AI className="h-3 w-3" /> {actionLabels[act.type]}{notReady && <span className="text-[9px] font-semibold">(soon)</span>}
                          </span>
                        );
                      })}
                      <span className="ml-2">· {a.triggerCount} runs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleActive(a)} className={`p-2 rounded-lg transition-colors ${a.isActive ? "hover:bg-amber-50 text-green-600" : "hover:bg-green-50 text-surface-400"}`}>
                      {a.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteAutomation(a.id)} disabled={deleteId === a.id} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600">
                      {deleteId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {expandedId === a.id && (
                  <div className="border-t border-surface-100 bg-surface-50 px-5 py-4">
                    {logsLoading ? <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-brand-600" /></div>
                    : logs.length === 0 ? <p className="text-sm text-surface-500 text-center py-3">No execution logs yet.</p>
                    : (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Recent Executions</h4>
                        {logs.map((log) => (
                          <div key={log.id} className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 ${log.status === "success" ? "bg-green-50" : log.status === "failed" ? "bg-red-50" : "bg-surface-100"}`}>
                            <span className={`text-xs font-semibold ${log.status === "success" ? "text-green-700" : log.status === "failed" ? "text-red-700" : "text-surface-500"}`}>{log.status}</span>
                            <span className="flex-1 text-xs text-surface-600">{log.error || "Completed"}</span>
                            <span className="text-xs text-surface-400">{new Date(log.executedAt).toLocaleString()}</span>
                          </div>
                        ))}
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
