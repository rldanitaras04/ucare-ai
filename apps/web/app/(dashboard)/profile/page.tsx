"use client";

import * as React from "react";
import { Avatar } from "@repo/ui";
import { sanitizeRole } from "@repo/auth";
import { updateProfileFullName, updateProfilePhone, updateProfileAvatar, deleteProfileAvatar } from "@/lib/actions/profile";

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  nurse: "Nurse",
  staff: "Staff",
  doctor: "Doctor",
  dentist: "Dentist",
  patient: "Patient",
};

export default function ProfilePage() {
  const [user, setUser] = React.useState<{ id: string; email?: string | null; user_metadata: Record<string, unknown> } | null>(null);
  const [profile, setProfile] = React.useState<{ full_name: string | null; avatar_url: string | null; role: string | null; phone: string | null; created_at: string | null } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editingName, setEditingName] = React.useState(false);
  const [editingPhone, setEditingPhone] = React.useState(false);
  const [nameValue, setNameValue] = React.useState("");
  const [phoneValue, setPhoneValue] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const load = async () => {
      const { createClient } = await import("@repo/supabase/client");
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }

      setUser(authUser);

      const { data } = await supabase
        .from("profiles" as never)
        .select("full_name, avatar_url, role, phone, created_at")
        .eq("id", authUser.id)
        .single();

      const p = data as { full_name: string | null; avatar_url: string | null; role: string | null; phone: string | null; created_at: string | null } | null;

      const { data: roleRows } = await supabase
        .from("user_roles" as never)
        .select("roles(name)")
        .eq("user_id", authUser.id);

      const roleNames = ((roleRows ?? []) as { roles: { name: string } | null }[])
        .map((r) => r.roles?.name)
        .filter(Boolean) as string[];
      const canonicalRole = sanitizeRole(roleNames[0] ?? p?.role ?? (authUser.user_metadata?.role as string) ?? "patient");

      setProfile({
        full_name: p?.full_name ?? null,
        avatar_url: p?.avatar_url ?? null,
        role: canonicalRole,
        phone: p?.phone ?? null,
        created_at: p?.created_at ?? null,
      });
      setNameValue(p?.full_name || (authUser.user_metadata?.full_name as string) || "");
      setPhoneValue(p?.phone || (authUser.user_metadata?.phone as string) || "");
      setLoading(false);
    };
    load();
  }, []);

  const displayName = profile?.full_name || (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "User";
  const email = user?.email || "No email";
  const phone = profile?.phone || (user?.user_metadata?.phone as string) || "Not set";
  const role = profile?.role ?? sanitizeRole((user?.user_metadata?.role as string) ?? "patient");
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Unknown";
  const avatarUrl = profile?.avatar_url || (user?.user_metadata?.avatar_url as string) || null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "File must be under 2MB" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Only JPEG, PNG, GIF, and WebP are allowed" });
      return;
    }

    setUploading(true);
    setMessage(null);

    const { createClient } = await import("@repo/supabase/client");
    const supabase = createClient();

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `profile-avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("ucare-ai-bucket")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage({ type: "error", text: uploadError.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("ucare-ai-bucket")
      .getPublicUrl(path);

    const result = await updateProfileAvatar(urlData.publicUrl);
    setUploading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Avatar updated" });
      setProfile((prev) => prev ? { ...prev, avatar_url: urlData.publicUrl } : prev);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    setMessage(null);

    const { createClient } = await import("@repo/supabase/client");
    const supabase = createClient();

    if (user) {
      const exts = ["jpg", "jpeg", "png", "gif", "webp"];
      for (const ext of exts) {
        await supabase.storage.from("ucare-ai-bucket").remove([`profile-avatars/${user.id}.${ext}`]);
      }
    }

    const result = await deleteProfileAvatar();
    setUploading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Avatar removed" });
      setProfile((prev) => prev ? { ...prev, avatar_url: null } : prev);
    }
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setSaving(true);
    setMessage(null);
    const result = await updateProfileFullName(nameValue.trim());
    setSaving(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Name updated" });
      setEditingName(false);
      setProfile((prev) => prev ? { ...prev, full_name: nameValue.trim() } : prev);
    }
  };

  const handleSavePhone = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateProfilePhone(phoneValue.trim());
    setSaving(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Phone updated" });
      setEditingPhone(false);
      setProfile((prev) => prev ? { ...prev, phone: phoneValue.trim() } : prev);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500">View and manage your account information.</p>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.text}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {avatarUrl ? (
              <Avatar src={avatarUrl} name={displayName} size="lg" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-600">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
            >
              {uploading ? "..." : "Change"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
            <p className="text-sm text-slate-500">{email}</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {ROLE_LABELS[role] ?? role}
            </span>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="ml-2 text-xs text-red-500 hover:underline disabled:opacity-50"
              >
                Remove avatar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
          </div>
          <dl className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <dt className="text-xs font-medium text-slate-400">Full Name</dt>
                {!editingName && (
                  <button type="button" onClick={() => setEditingName(true)} className="text-xs text-slate-500 hover:text-slate-700">Edit</button>
                )}
              </div>
              {editingName ? (
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                  <button type="button" onClick={handleSaveName} disabled={saving} className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                    {saving ? "..." : "Save"}
                  </button>
                  <button type="button" onClick={() => { setEditingName(false); setNameValue(profile?.full_name || ""); }} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              ) : (
                <dd className="text-sm text-slate-700">{displayName}</dd>
              )}
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">Email</dt>
              <dd className="text-sm text-slate-700">{email}</dd>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <dt className="text-xs font-medium text-slate-400">Phone</dt>
                {!editingPhone && (
                  <button type="button" onClick={() => setEditingPhone(true)} className="text-xs text-slate-500 hover:text-slate-700">Edit</button>
                )}
              </div>
              {editingPhone ? (
                <div className="mt-1 flex gap-2">
                  <input
                    type="tel"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter your phone number"
                  />
                  <button type="button" onClick={handleSavePhone} disabled={saving} className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                    {saving ? "..." : "Save"}
                  </button>
                  <button type="button" onClick={() => { setEditingPhone(false); setPhoneValue(profile?.phone || ""); }} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              ) : (
                <dd className="text-sm text-slate-700">{phone}</dd>
              )}
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900">Account Details</h3>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs font-medium text-slate-400">Role</dt>
              <dd className="text-sm text-slate-700">{ROLE_LABELS[role] ?? role}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">Member Since</dt>
              <dd className="text-sm text-slate-700">{memberSince}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">User ID</dt>
              <dd className="text-xs font-mono text-slate-500 break-all">{user.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
