"use client";
import { Loader2 } from "lucide-react";
import { User, Lock, Save, Mail } from "@/components/icons/FilledIcons";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";
import { api } from "@/lib/api-client";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Fields load from `user` once it's available (auth context resolves async)
  const [initialized, setInitialized] = useState(false);
  if (user && !initialized) {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone || "");
    setAvatar(user.avatar || null);
    setInitialized(true);
  }

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileError("");
    const res = await api.patch("/api/auth/me", {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || null,
      avatar: avatar || null,
    });
    setSavingProfile(false);
    if (res.success) {
      await refreshUser();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } else {
      setProfileError(res.error || "Failed to save profile");
    }
  };

  const savePassword = async () => {
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match");
      return;
    }
    setSavingPassword(true);
    const res = await api.patch("/api/auth/me", { currentPassword, newPassword });
    setSavingPassword(false);
    if (res.success) {
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } else {
      setPasswordError(res.error || "Failed to change password");
    }
  };

  if (!user) {
    return (
      <>
        <DashboardHeader title="My Profile" />
        <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="My Profile" subtitle="Manage your personal account details" />
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Profile Info */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><User className="h-5 w-5" />Personal Info</h3>

          {profileSaved && (
            <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              ✅ Profile saved successfully!
            </div>
          )}
          {profileError && (
            <div className="mb-4 rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">{profileError}</div>
          )}

          <div className="space-y-4">
            <SingleImageUpload image={avatar} onChange={setAvatar} label="Profile Photo" compact />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email</label>
              <input value={user.email} disabled className="input-field bg-surface-50 text-surface-500 cursor-not-allowed" />
              <p className="mt-1 text-xs text-surface-400">Contact support to change your email address.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+234 812 345 6789" />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={saveProfile} disabled={savingProfile} className="btn-primary">
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />Save Changes</>}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><Lock className="h-5 w-5" />Change Password</h3>

          {passwordSaved && (
            <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              ✅ Password changed successfully!
            </div>
          )}
          {passwordError && (
            <div className="mb-4 rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">{passwordError}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" autoComplete="current-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" autoComplete="new-password" />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={savePassword} disabled={savingPassword || !currentPassword || !newPassword} className="btn-primary">
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Lock className="h-4 w-4" />Change Password</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
