"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";

export type ProviderType = "doctor" | "dentist";
export type SessionType = "monthly_visit" | "case_based" | "emergency";
export type ProviderSessionStatus =
  | "planned"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export interface ProviderSession {
  id: string;
  provider_profile_id: string;
  provider_type: ProviderType;
  session_type: SessionType;
  session_date: string;
  start_time: string;
  end_time: string | null;
  status: ProviderSessionStatus;
  created_at: string;
}

export interface ProviderSessionWithProvider extends ProviderSession {
  provider: {
    full_name: string | null;
    email: string;
  } | null;
}

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  monthly_visit: "Monthly Visit",
  case_based: "Case-Based",
  emergency: "Emergency",
};

const SESSION_STATUS_LABELS: Record<ProviderSessionStatus, string> = {
  planned: "Planned",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export { SESSION_TYPE_LABELS, SESSION_STATUS_LABELS };

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
