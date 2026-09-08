"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import { getAuthContext } from "@/lib/auth";

export async function updateProfileFullName(fullName: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const auth = await getAuthContext();
  const supabase = auth.supabase;

  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (authError) return { success: false, error: authError.message };

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", auth.user.id);

  if (dbError) return { success: false, error: dbError.message };

  revalidatePath("/profile");
  return { success: true, error: null };
}

export async function updateProfilePhone(phone: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const auth = await getAuthContext();
  const supabase = auth.supabase;

  const { error: authError } = await supabase.auth.updateUser({
    data: { phone },
  });

  if (authError) return { success: false, error: authError.message };

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ phone } as never)
    .eq("id", auth.user.id);

  if (dbError) return { success: false, error: dbError.message };

  revalidatePath("/profile");
  return { success: true, error: null };
}

export async function updateProfileAvatar(avatarUrl: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const auth = await getAuthContext();
  const supabase = auth.supabase;

  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });

  if (authError) return { success: false, error: authError.message };

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", auth.user.id);

  if (dbError) return { success: false, error: dbError.message };

  revalidatePath("/profile");
  return { success: true, error: null };
}

export async function deleteProfileAvatar(): Promise<{
  success: boolean;
  error: string | null;
}> {
  const auth = await getAuthContext();
  const supabase = auth.supabase;

  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: null },
  });

  if (authError) return { success: false, error: authError.message };

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", auth.user.id);

  if (dbError) return { success: false, error: dbError.message };

  revalidatePath("/profile");
  return { success: true, error: null };
}
