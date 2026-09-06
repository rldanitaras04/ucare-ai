"use client";

import * as React from "react";
import { createClient } from "@repo/supabase/client";
import { Button, Input, FormField, Card, CardHeader, CardTitle, CardContent, Alert, AlertDescription, Avatar } from "@repo/ui";
import type { User } from "@supabase/supabase-js";

interface AdminProfileFormProps {
  user: User | null;
  initialAvatarUrl?: string | null;
}

export function AdminProfileForm({ user, initialAvatarUrl }: AdminProfileFormProps) {
  const initialName = user?.user_metadata?.full_name ?? "";
  const [fullName, setFullName] = React.useState(initialName);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(initialAvatarUrl ?? (user?.user_metadata?.avatar_url as string) ?? null);
  const [uploading, setUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const filePath = `profile-avatars/${user?.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("ucare-ai-bucket")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("ucare-ai-bucket")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await supabase
        .from("profiles" as never)
        .update({ avatar_url: publicUrl } as never)
        .eq("id", user?.id as never);

      setAvatarUrl(publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) {
        setError(error.message);
        return;
      }

      await supabase
        .from("profiles" as never)
        .update({ full_name: fullName } as never)
        .eq("id", user?.id as never);

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert>
              <AlertDescription>Profile updated successfully.</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <Avatar key={avatarUrl || "initial"} src={avatarUrl} name={user?.email ?? ""} size="lg" />
            <div>
              <p className="text-sm font-medium text-slate-900">Profile Photo</p>
              <p className="text-xs text-slate-400">JPG, PNG or GIF. Max 2MB.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-2 inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Change Photo"}
              </button>
            </div>
          </div>

          <FormField label="Full Name">
            <Input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormField>
          <FormField label="Email">
            <Input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-slate-400">Email cannot be changed.</p>
          </FormField>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
