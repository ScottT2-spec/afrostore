"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Search, Users, Shield, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  storesCount: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, page: page.toString(), limit: "20" });
    const res = await api.get<{ users: User[]; total: number; pages: number }>(`/api/admin/users?${params}`);
    if (res.success && res.data) {
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    const res = await api.patch(`/api/admin/users/${userId}`, { role: newRole });
    if (res.success) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    }
    setUpdatingId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">User Management</h1>
          <p className="text-sm text-surface-500 mt-1">Manage all platform users</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-surface-400" />
          <span className="text-sm font-semibold text-surface-700">{users.length} users</span>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white">
        <div className="p-4 border-b border-surface-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">User</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Email</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Role</th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Stores</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Joined</th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <span className="text-sm font-medium text-surface-900">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-surface-500">{u.email}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${u.role === "ADMIN" || u.role === "SUPER_ADMIN" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center text-sm font-semibold text-surface-900">{u.storesCount}</td>
                      <td className="px-6 py-3.5 text-sm text-surface-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3.5 text-center">
                        {updatingId === u.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600 mx-auto" />
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => updateRole(u.id, e.target.value)}
                            className="text-xs rounded-lg border border-surface-200 px-2 py-1 focus:outline-none focus:border-red-500"
                          >
                            <option value="MERCHANT">MERCHANT</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        )}
                      </td>
                    </tr>
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
