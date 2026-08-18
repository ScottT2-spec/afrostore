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

  const [details, setDetails] = useState<Record<string, string>>({});
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const updateDetail = (key: string, value: string) => setDetails((prev) => ({ ...prev, [key]: value }));

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
    setDetails(
      Object.fromEntries(
        Object.entries(user.profileDetails || {}).map(([k, v]) => [k, v || ""])
      )
    );
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

  const saveDetails = async () => {
    setSavingDetails(true);
    setDetailsError("");
    const res = await api.patch("/api/auth/me", { profileDetails: details });
    setSavingDetails(false);
    if (res.success) {
      await refreshUser();
      setDetailsSaved(true);
      setTimeout(() => setDetailsSaved(false), 3000);
    } else {
      setDetailsError(res.error || "Failed to save details");
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

        {/* Additional Details */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><User className="h-5 w-5" />Additional Details</h3>

          {detailsSaved && (
            <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              ✅ Details saved successfully!
            </div>
          )}
          {detailsError && (
            <div className="mb-4 rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">{detailsError}</div>
          )}

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-surface-700 mb-3">Personal Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Date of Birth</label>
                  <input type="date" value={details.dateOfBirth || ""} onChange={(e) => updateDetail("dateOfBirth", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Gender</label>
                  <select value={details.gender || ""} onChange={(e) => updateDetail("gender", e.target.value)} className="input-field">
                    <option value="">Please select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Marital Status</label>
                  <select value={details.maritalStatus || ""} onChange={(e) => updateDetail("maritalStatus", e.target.value)} className="input-field">
                    <option value="">Please select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Blood Group</label>
                  <select value={details.bloodGroup || ""} onChange={(e) => updateDetail("bloodGroup", e.target.value)} className="input-field">
                    <option value="">Please select</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-surface-700 mb-3">Additional Contact Numbers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Alternate Contact Number</label>
                  <input value={details.alternateContact || ""} onChange={(e) => updateDetail("alternateContact", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Family Contact Number</label>
                  <input value={details.familyContact || ""} onChange={(e) => updateDetail("familyContact", e.target.value)} className="input-field" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-surface-700 mb-3">Guardian & Identification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Guardian Name</label>
                  <input value={details.guardianName || ""} onChange={(e) => updateDetail("guardianName", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">ID Proof Name</label>
                  <input value={details.idProofName || ""} onChange={(e) => updateDetail("idProofName", e.target.value)} className="input-field" placeholder="e.g. National ID, Passport" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">ID Proof Number</label>
                  <input value={details.idProofNumber || ""} onChange={(e) => updateDetail("idProofNumber", e.target.value)} className="input-field" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-surface-700 mb-3">Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Permanent Address</label>
                  <textarea value={details.permanentAddress || ""} onChange={(e) => updateDetail("permanentAddress", e.target.value)} className="input-field resize-y" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Current Address</label>
                  <textarea value={details.currentAddress || ""} onChange={(e) => updateDetail("currentAddress", e.target.value)} className="input-field resize-y" rows={3} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-surface-700 mb-3">Bank Details</h4>
              <p className="text-xs text-surface-400 mb-3">Stored on your account only — never shown to customers or other staff.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Account Holder's Name</label>
                  <input value={details.bankAccountHolderName || ""} onChange={(e) => updateDetail("bankAccountHolderName", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Account Number</label>
                  <input value={details.bankAccountNumber || ""} onChange={(e) => updateDetail("bankAccountNumber", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Bank Name</label>
                  <input value={details.bankName || ""} onChange={(e) => updateDetail("bankName", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Bank Identifier Code</label>
                  <input value={details.bankIdentifierCode || ""} onChange={(e) => updateDetail("bankIdentifierCode", e.target.value)} className="input-field" placeholder="e.g. SWIFT/BIC" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Branch</label>
                  <input value={details.bankBranch || ""} onChange={(e) => updateDetail("bankBranch", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Tax Payer ID</label>
                  <input value={details.taxPayerId || ""} onChange={(e) => updateDetail("taxPayerId", e.target.value)} className="input-field" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-surface-700 mb-3">Social Media</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Facebook Link</label>
                  <input value={details.facebookLink || ""} onChange={(e) => updateDetail("facebookLink", e.target.value)} className="input-field" placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Twitter Link</label>
                  <input value={details.twitterLink || ""} onChange={(e) => updateDetail("twitterLink", e.target.value)} className="input-field" placeholder="https://x.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Social Media 1</label>
                  <input value={details.socialMedia1 || ""} onChange={(e) => updateDetail("socialMedia1", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Social Media 2</label>
                  <input value={details.socialMedia2 || ""} onChange={(e) => updateDetail("socialMedia2", e.target.value)} className="input-field" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-surface-700 mb-3">Custom Fields</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n}>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Custom Field {n}</label>
                    <input value={details[`customField${n}`] || ""} onChange={(e) => updateDetail(`customField${n}`, e.target.value)} className="input-field" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={saveDetails} disabled={savingDetails} className="btn-primary">
              {savingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />Save Details</>}
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
