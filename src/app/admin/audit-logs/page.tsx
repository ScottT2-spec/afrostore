"use client";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Search, Shield } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";

interface AuditLog {
  id: string;
  siteId: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  createdAt: string;
  site: { name: string; slug: string };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);
    if (entityFilter) params.set("entity", entityFilter);
    if (actionFilter) params.set("action", actionFilter);
    const res = await api.get<{ logs: AuditLog[]; total: number; pages: number }>(`/api/admin/audit-logs?${params}`);
    if (res.success && res.data) {
      setLogs(res.data.logs);
      setTotalPages(res.data.pages);
    }
    setLoading(false);
  }, [search, entityFilter, actionFilter, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-display">Audit Logs</h1>
        <p className="text-sm text-surface-500 mt-1">Track all actions across the platform</p>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white">
        <div className="p-4 border-b border-surface-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search by entity, action, or user ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">All Entities</option>
            <option value="product">Product</option>
            <option value="order">Order</option>
            <option value="customer">Customer</option>
            <option value="site">Site</option>
            <option value="page">Page</option>
            <option value="blog">Blog</option>
            <option value="coupon">Coupon</option>
            <option value="category">Category</option>
            <option value="settings">Settings</option>
          </select>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="publish">Publish</option>
            <option value="archive">Archive</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-accent-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-surface-400">
            <Shield className="h-8 w-8 mb-2" />
            <p className="text-sm">No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Date</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Site</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">User ID</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Action</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Entity</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Entity ID</th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {logs.map((log) => (
                    <>
                      <tr
                        key={log.id}
                        className="hover:bg-surface-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      >
                        <td className="px-6 py-3.5 text-sm text-surface-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <div>
                            <p className="text-sm font-medium text-surface-900">{log.site.name}</p>
                            <p className="text-[10px] text-surface-400">{log.site.slug}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-surface-500 font-mono text-xs">
                          {log.userId ? log.userId.slice(0, 12) + "…" : "—"}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                            log.action === "create" ? "bg-green-100 text-green-700" :
                            log.action === "delete" ? "bg-red-100 text-red-700" :
                            log.action === "update" ? "bg-blue-100 text-blue-700" :
                            "bg-surface-100 text-surface-700"
                          }`}>
                            {log.action.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-accent-100 text-accent-700">
                            {log.entity}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-surface-500 font-mono text-xs">
                          {log.entityId ? log.entityId.slice(0, 12) + "…" : "—"}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <button className="text-xs text-accent-600 hover:text-accent-800 font-medium">
                            {expandedId === log.id ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>
                      {expandedId === log.id && (
                        <tr key={`${log.id}-details`}>
                          <td colSpan={7} className="px-6 py-4 bg-surface-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-2">Before</p>
                                <pre className="text-xs bg-white rounded-xl border border-surface-200 p-3 overflow-x-auto max-h-48 text-surface-700">
                                  {log.before ? JSON.stringify(log.before, null, 2) : "—"}
                                </pre>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-2">After</p>
                                <pre className="text-xs bg-white rounded-xl border border-surface-200 p-3 overflow-x-auto max-h-48 text-surface-700">
                                  {log.after ? JSON.stringify(log.after, null, 2) : "—"}
                                </pre>
                              </div>
                            </div>
                            {log.ip && (
                              <p className="text-[10px] text-surface-400 mt-2">IP: {log.ip}</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-surface-100">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-surface-500">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
