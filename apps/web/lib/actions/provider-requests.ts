"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext, hasRole } from "@/lib/auth";
import type { Database } from "@repo/types";

type ProviderType = Database["public"]["Enums"]["provider_type"];
type RequestUrgency = Database["public"]["Enums"]["request_urgency"];
type ProviderRequestStatus = Database["public"]["Enums"]["provider_request_status"];

export interface ProviderRequest {
  id: string;
  patient_id: string;
  visit_id: string;
  requested_by: string;
  provider_type: ProviderType;
  urgency: RequestUrgency;
  reason: string | null;
  status: ProviderRequestStatus;
  created_at: string;
  patient_name?: string;
  visit_service_type?: string;
}

export async function getProviderRequests(): Promise<{
  data: ProviderRequest[];
  error: string | null;
}> {
  const auth = await getAuthContext();
  if (!hasRole(auth, ["superadmin", "nurse", "staff", "doctor", "dentist"])) {
    return { data: [], error: "Insufficient permissions" };
  }
  const supabase = auth.supabase;

  const { data, error } = await supabase
    .from("provider_requests")
    .select(`
      *,
      patient_profiles!provider_requests_patient_id_fkey (first_name, last_name),
      walk_in_visits!provider_requests_visit_id_fkey (service_type)
    `)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  interface RequestRow {
    id: string;
    patient_id: string;
    visit_id: string;
    requested_by: string;
    provider_type: ProviderType;
    urgency: RequestUrgency;
    reason: string | null;
    status: ProviderRequestStatus;
    created_at: string;
    patient_profiles: { first_name: string; last_name: string } | null;
    walk_in_visits: { service_type: string } | null;
  }

  const requests: ProviderRequest[] = (data as RequestRow[]).map((r) => ({
    id: r.id,
    patient_id: r.patient_id,
    visit_id: r.visit_id,
    requested_by: r.requested_by,
    provider_type: r.provider_type,
    urgency: r.urgency,
    reason: r.reason,
    status: r.status,
    created_at: r.created_at,
    patient_name: r.patient_profiles ? `${r.patient_profiles.first_name} ${r.patient_profiles.last_name}` : "Unknown",
    visit_service_type: r.walk_in_visits?.service_type ?? undefined,
  }));

  return { data: requests, error: null };
}

export async function createProviderRequest(request: {
  patient_id: string;
  visit_id: string;
  provider_type: ProviderType;
  urgency?: RequestUrgency;
  reason?: string;
}): Promise<{ data: ProviderRequest | null; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, ["superadmin", "nurse", "staff", "doctor", "dentist"])) {
    return { data: null, error: "Insufficient permissions" };
  }
  const supabase = auth.supabase;

  const { data, error } = await supabase
    .from("provider_requests")
    .insert({
      patient_id: request.patient_id,
      visit_id: request.visit_id,
      requested_by: auth.user.id,
      provider_type: request.provider_type,
      urgency: request.urgency ?? "normal",
      reason: request.reason ?? null,
    })
    .select()
    .single();

  revalidatePath("/provider-requests");
  return { data: data as ProviderRequest | null, error: error?.message ?? null };
}

export async function updateProviderRequestStatus(
  requestId: string,
  status: ProviderRequestStatus
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, ["superadmin", "nurse", "staff", "doctor", "dentist"])) {
    return { success: false, error: "Insufficient permissions" };
  }
  const supabase = auth.supabase;

  const { error } = await supabase
    .from("provider_requests")
    .update({ status })
    .eq("id", requestId);

  revalidatePath("/provider-requests");
  return { success: !error, error: error?.message ?? null };
}
