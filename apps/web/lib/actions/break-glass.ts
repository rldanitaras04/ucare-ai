"use server";

import { createServerClient } from "@repo/supabase/server";

export interface BreakGlassLog {
  id: string;
  provider_id: string;
  patient_id: string;
  reason: string;
  accessed_at: string;
  ip_address: string | null;
  notified: boolean;
}

export async function recordBreakGlassAccess(params: {
  patient_id: string;
  reason: string;
}): Promise<{ data: string | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "doctor", "dentist"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions for break-glass access" };
  }

  if (!params.reason || params.reason.trim().length < 10) {
    return { data: null, error: "A detailed justification reason is required (minimum 10 characters)" };
  }

  const { data, error } = await supabase.rpc("record_break_glass_access", {
    p_patient_id: params.patient_id,
    p_reason: params.reason.trim(),
  });

  return { data: data as string | null, error: error?.message ?? null };
}

export async function getBreakGlassLogs(): Promise<{
  data: BreakGlassLog[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse"].includes(callerRole)) {
    return { data: [], error: "Insufficient permissions" };
  }

  const { data, error } = await supabase
    .from("break_glass_audit_logs")
    .select("*")
    .order("accessed_at", { ascending: false });

  return { data: (data as BreakGlassLog[]) ?? [], error: error?.message ?? null };
}

export async function getBreakGlassLogsForPatient(patientId: string): Promise<{
  data: BreakGlassLog[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "doctor", "dentist"].includes(callerRole)) {
    return { data: [], error: "Insufficient permissions" };
  }

  const { data, error } = await supabase
    .from("break_glass_audit_logs")
    .select("*")
    .eq("patient_id", patientId)
    .order("accessed_at", { ascending: false });

  return { data: (data as BreakGlassLog[]) ?? [], error: error?.message ?? null };
}
