"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";

export interface DentalHistoryEntry {
  id: string;
  patient_id: string;
  condition_name: string;
  tooth_number: number | null;
  surface: string | null;
  diagnosis_date: string | null;
  treatment_date: string | null;
  treatment_performed: string | null;
  status: string;
  notes: string | null;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

const DENTIST_ROLES = ["superadmin", "dentist"];

async function authorize() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function getDentalHistory(patientId: string) {
  const { supabase, user } = await authorize();
  const { data: profileRaw } = await supabase.from("patient_profiles" as never).select("id").eq("user_id", user.id).maybeSingle();
  const profile = profileRaw as { id: string } | null;
  const isOwner = profile?.id === patientId;
  const { data: rolesRaw } = await supabase.from("user_roles").select("roles(name)").eq("user_id", user.id);
  const roleNames = ((rolesRaw ?? []) as { roles: { name: string } | null }[]).map((r) => r.roles?.name).filter(Boolean) as string[];
  const isStaff = DENTIST_ROLES.some((r) => roleNames.includes(r));
  if (!isOwner && !isStaff) return { data: [], error: null };
  const { data: dentalRaw, error } = await supabase.from("dental_history" as never).select("*").eq("patient_id", patientId).order("created_at", { ascending: false });
  const data = dentalRaw as DentalHistoryEntry[] | null;
  return { data: data ?? [], error: error?.message ?? null };
}

export async function createDentalHistoryEntry(input: { patient_id: string; condition_name: string; tooth_number?: number; surface?: string; diagnosis_date?: string; treatment_date?: string; treatment_performed?: string; status?: string; notes?: string }) {
  const { supabase, user } = await authorize();
  const { data: inserted, error } = await supabase.from("dental_history" as never).insert({ patient_id: input.patient_id, condition_name: input.condition_name, tooth_number: input.tooth_number ?? null, surface: input.surface ?? null, diagnosis_date: input.diagnosis_date ?? null, treatment_date: input.treatment_date ?? null, treatment_performed: input.treatment_performed ?? null, status: input.status ?? "active", notes: input.notes ?? null, recorded_by: user.id } as never).select().single();
  if (error) return { data: null, error: error.message };
  revalidatePath("/my-records/dental");
  return { data: inserted as unknown as DentalHistoryEntry, error: null };
}

export async function updateDentalHistoryEntry(id: string, input: Partial<{ condition_name: string; tooth_number: number; surface: string; diagnosis_date: string; treatment_date: string; treatment_performed: string; status: string; notes: string }>) {
  const { supabase } = await authorize();
  const { error } = await supabase.from("dental_history" as never).update({ ...input, updated_at: new Date().toISOString() } as never).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/my-records/dental");
  return { error: null };
}
