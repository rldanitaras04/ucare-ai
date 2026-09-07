"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";

export interface MedicalHistoryEntry {
  id: string;
  patient_id: string;
  condition_name: string;
  icd_code: string | null;
  diagnosis_date: string | null;
  resolution_date: string | null;
  status: string;
  severity: string | null;
  treating_facility: string | null;
  notes: string | null;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

const CLINICAL_ROLES = ["superadmin", "nurse", "doctor"];

async function authorize() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function getMedicalHistory(patientId: string) {
  const { supabase, user } = await authorize();
  const { data: profileRaw } = await supabase.from("patient_profiles" as never).select("id").eq("user_id", user.id).maybeSingle();
  const profile = profileRaw as { id: string } | null;
  const isOwner = profile?.id === patientId;
  const { data: rolesRaw } = await supabase.from("user_roles").select("roles(name)").eq("user_id", user.id);
  const roleNames = ((rolesRaw ?? []) as { roles: { name: string } | null }[]).map((r) => r.roles?.name).filter(Boolean) as string[];
  const isStaff = CLINICAL_ROLES.some((r) => roleNames.includes(r));
  if (!isOwner && !isStaff) return { data: [], error: null };
  const { data: historyRaw, error } = await supabase.from("medical_history" as never).select("*").eq("patient_id", patientId).order("created_at", { ascending: false });
  const data = historyRaw as MedicalHistoryEntry[] | null;
  return { data: data ?? [], error: error?.message ?? null };
}

export async function createMedicalHistoryEntry(input: { patient_id: string; condition_name: string; icd_code?: string; diagnosis_date?: string; resolution_date?: string; status?: string; severity?: string; treating_facility?: string; notes?: string }) {
  const { supabase, user } = await authorize();
  const { data: inserted, error } = await supabase.from("medical_history" as never).insert({ patient_id: input.patient_id, condition_name: input.condition_name, icd_code: input.icd_code ?? null, diagnosis_date: input.diagnosis_date ?? null, resolution_date: input.resolution_date ?? null, status: input.status ?? "active", severity: input.severity ?? null, treating_facility: input.treating_facility ?? null, notes: input.notes ?? null, recorded_by: user.id } as never).select().single();
  if (error) return { data: null, error: error.message };
  revalidatePath("/my-records/medical");
  return { data: inserted as unknown as MedicalHistoryEntry, error: null };
}

export async function updateMedicalHistoryEntry(id: string, input: Partial<{ condition_name: string; icd_code: string; diagnosis_date: string; resolution_date: string; status: string; severity: string; treating_facility: string; notes: string }>) {
  const { supabase } = await authorize();
  const { error } = await supabase.from("medical_history" as never).update({ ...input, updated_at: new Date().toISOString() } as never).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/my-records/medical");
  return { error: null };
}
