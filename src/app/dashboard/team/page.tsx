"use client";
import { Loader2 } from "lucide-react";
import { Crown, Eye, Mail, Settings, Shield, Trash2, UserPlus } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  role: "OWNER" | "ADMIN" | "STAFF" | "VIEWER";
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string; avatar: string | null };
}

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType; desc: string }> = {
  OWNER: { label: "Owner", color: "bg-accent-100 text-accent-700", icon: Crown, desc: "Full access, billing, delete store" },
  ADMIN: { label: "Admin", color: "bg-brand-100 text-brand-700", icon: Shield, desc: "Manage products, orders, settings" },
  STAFF: { label: "Staff", color: "bg-green-100 text-green-700", icon: Settings, desc: "Manage products and orders" },
  VIEWER: { label: "Viewer", color: "bg-surface-100 text-surface-600", icon: Eye, desc: "View-only access" },
};

export default function TeamPage() {
  const { currentStore } = useSite();
  const { user } = useAuth();
  const router = useRouter();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("member");
  const [members, setMembers] = useState<Member[]>([]);
  const [myRole, setMyRole] = useState<"OWNER" | "ADMIN" | "STAFF" | "VIEWER" | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "STAFF" | "VIEWER">("STAFF");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Only admins and the owner can manage the team. This mirrors the backend
  // check in /api/sites/:siteId/members (which is the real enforcement) —
  // hiding these controls for everyone else isn't just cosmetic, it stops a
  // Staff/Viewer account from seeing controls that would just 403 anyway,
  // and from a Staff account being able to reach the invite form via the AI
  // assistant prefill (the AI chat route only requires STAFF minimum).
  const canManageTeam = myRole === "OWNER" || myRole === "ADMIN";

  const fetchMembers = useCallback(async () => {
    if (!currentStore || !user) return;
    setLoading(true);
    const res = await api.get<any>(`/api/sites/${currentStore.id}/members`);
    if (res.success && res.data) {
      const membersList = Array.isArray(res.data) ? res.data : res.data.members || [];
      setMembers(membersList);
      const ownerId = Array.isArray(res.data) ? null : res.data.owner?.id;
      if (user.id === ownerId) {
        setMyRole("OWNER");
      } else {
        const mine = membersList.find((m: Member) => m.user.id === user.id);
        setMyRole(mine?.role ?? null);
      }
    }
    setLoading(false);
  }, [currentStore, user]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // AI prefill — auto-open invite form (admins/owner only, see canManageTeam)
  useEffect(() => {
    if (prefillData && isFromAI && canManageTeam) {
      const d = prefillData as any;
      setInviteEmail(d.email || "");
      setInviteRole(d.role || "STAFF");
      setShowInvite(true);
    }
  }, [prefillData, isFromAI, canManageTeam]);

  const inviteMember = async () => {
    if (!currentStore || !inviteEmail.trim()) return;
    setSaving(true);
    setError("");
    const res = await api.post<any>(`/api/sites/${currentStore.id}/members`, { email: inviteEmail, role: inviteRole });
    if (res.success) {
      setInviteEmail("");
      setShowInvite(false);
      fetchMembers();
      if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
    } else {
      setError(res.error || "Failed to add member. Make sure they have an account.");
    }
    setSaving(false);
  };

  const updateRole = async (memberId: string, role: string) => {
    if (!currentStore) return;
    const res = await api.patch(`/api/sites/${currentStore.id}/members/${memberId}`, { role });
    if (res.success) {
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: role as Member["role"] } : m));
    } else {
      alert(res.error || "Failed to update role. Please try again.");
    }
  };

  const removeMember = async (memberId: string, name: string) => {
    if (!currentStore || !confirm(`Remove ${name} from the team?`)) return;
    const res = await api.delete(`/api/sites/${currentStore.id}/members/${memberId}`);
    if (res.success) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } else {
      alert(res.error || "Failed to remove member. Please try again.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {isFromAI && <AIPrefillBanner entityType="team member" onDiscard={() => { clearPrefill(); setShowInvite(false); setInviteEmail(""); }} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Team</h1>
          <p className="text-sm text-surface-500 mt-1">Manage who has access to your store</p>
        </div>
        {canManageTeam && (
          <button onClick={() => setShowInvite(true)} className="btn-primary text-sm py-2.5 px-4">
            <UserPlus className="h-4 w-4" /> Add Member
          </button>
        )}
      </div>

      {/* Invite form */}
      {showInvite && canManageTeam && (
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h3 className="text-sm font-bold text-surface-900 mb-3">Add Team Member</h3>
          <p className="text-xs text-surface-500 mb-3">The person must already have an AfroStore account.</p>
          {error && <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700 mb-3">{error}</div>}
          <div className="space-y-3">
            {/* Email input — full width */}
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1.5">Email address</label>
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g. teammate@example.com"
                type="email"
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && inviteMember()}
              />
            </div>
            {/* Role + actions */}
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">Role</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)} className="input-field py-3 w-40">
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex gap-2 ml-auto self-end">
                <button onClick={inviteMember} disabled={saving || !inviteEmail.trim()} className="btn-primary text-sm py-3 px-6">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Member"}
                </button>
                <button onClick={() => { setShowInvite(false); setError(""); }} className="btn-secondary text-sm py-3 px-4">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(roleConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="rounded-xl border border-surface-100 bg-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 text-surface-500" />
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
              </div>
              <p className="text-[10px] text-surface-400">{cfg.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Members list */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No team members</h3>
          <p className="text-sm text-surface-500 mb-5">Add team members to help manage your store.</p>
          {canManageTeam && (
            <button onClick={() => setShowInvite(true)} className="btn-primary text-sm py-2.5 px-5">
              <UserPlus className="h-4 w-4" /> Add First Member
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <div className="divide-y divide-surface-100">
            {members.map((member) => {
              const cfg = roleConfig[member.role] || roleConfig.VIEWER;
              const Icon = cfg.icon;
              const fullName = `${member.user.firstName} ${member.user.lastName}`;
              const isOwner = member.role === "OWNER";

              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 transition-colors group">
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0 overflow-hidden">
                    {member.user.avatar ? (
                      <img src={member.user.avatar} alt={fullName} className="h-full w-full object-cover" />
                    ) : (
                      member.user.firstName[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-surface-900 truncate">{fullName}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-surface-400 truncate">{member.user.email} · Joined {new Date(member.createdAt).toLocaleDateString()}</p>
                  </div>
                  {!isOwner && canManageTeam && (
                    <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <select
                        value={member.role}
                        onChange={(e) => updateRole(member.id, e.target.value)}
                        className="text-xs rounded-lg border border-surface-200 px-2 py-1.5 focus:outline-none focus:border-brand-500"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="STAFF">Staff</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                      <button onClick={() => removeMember(member.id, fullName)}
                        className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
