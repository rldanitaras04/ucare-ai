"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import type {
  ProviderSession,
  ProviderSessionWithProvider,
  ProviderType,
  SessionType,
  ProviderSessionStatus,
} from "@/lib/types/provider-sessions";

export type {
  ProviderSession,
  ProviderSessionWithProvider,
  ProviderType,
  SessionType,
  ProviderSessionStatus,
};

export async function getProviderSessions(): Promise<{
  data: ProviderSessionWithProvider[] | null;
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("provider_sessions")
    .select("*, provider:provider_profile_id(full_name, email)")
    .order("session_date", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const result: ProviderSessionWithProvider[] = (data ?? []).map(
    (record) => {
      const { provider, ...rest } = record as Record<string, unknown> & {
        provider: { full_name: string | null; email: string } | null;
      };
      return {
        ...(rest as Omit<ProviderSession, "provider">),
        provider: provider ?? null,
      };
    }
  );

  return { data: result, error: null };
}

export async function getProviders(): Promise<{
  data: Array<{ id: string; full_name: string | null; email: string; role: string }> | null;
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["doctor", "dentist"])
    .order("full_name");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

export async function createProviderSession(
  providerProfileId: string,
  providerType: ProviderType,
  sessionType: SessionType,
  sessionDate: string,
  startTime: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase.from("provider_sessions").insert({
    provider_profile_id: providerProfileId,
    provider_type: providerType,
    session_type: sessionType,
    session_date: sessionDate,
    start_time: startTime,
    status: "planned",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/provider-sessions");
  return { success: true, error: null };
}

export async function updateSessionStatus(
  sessionId: string,
  status: ProviderSessionStatus
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const updateData: {
    status: ProviderSessionStatus;
    start_time?: string;
    end_time?: string;
  } = { status };

  if (status === "active") {
    updateData.start_time = new Date().toISOString();
  } else if (status === "completed" || status === "cancelled") {
    updateData.end_time = new Date().toISOString();
  }

  const { error } = await supabase
    .from("provider_sessions")
    .update(updateData)
    .eq("id", sessionId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/provider-sessions");
  return { success: true, error: null };
}
