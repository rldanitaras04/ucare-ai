"use server";

import { createServerClient } from "@repo/supabase/server";
import type { Database } from "@repo/types";

type NotificationType = Database["public"]["Enums"]["notification_type"];

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link_url: string | null;
  created_at: string;
}

export async function getNotifications(): Promise<{
  data: Notification[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return { data: (data as Notification[]) ?? [], error: error?.message ?? null };
}

export async function getUnreadNotificationCount(): Promise<{
  data: number;
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: 0, error: "Not authenticated" };

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return { data: count ?? 0, error: error?.message ?? null };
}

export async function markNotificationAsRead(notificationId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return { success: !error, error: error?.message ?? null };
}

export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.rpc("mark_all_notifications_read");

  return { success: !error, error: error?.message ?? null };
}

export async function deleteNotification(notificationId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return { success: !error, error: error?.message ?? null };
}

export async function createNotification(params: {
  user_id: string;
  title: string;
  message: string;
  type?: NotificationType;
  link_url?: string;
}): Promise<{ data: string | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase.rpc("create_notification", {
    p_user_id: params.user_id,
    p_title: params.title,
    p_message: params.message,
    p_type: params.type ?? "system_alert",
    p_link_url: params.link_url ?? null,
  });

  return { data: data as string | null, error: error?.message ?? null };
}
