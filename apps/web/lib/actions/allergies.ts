"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";

export interface Allergy {
  id: string;
  patient_id: string;
  allergen: string;
  allergen_type: string;
  reaction: string | null;
  severity: string;
  onset_date: string | null;
  notes: string | null;
  is_active: boolean;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

const STAFF_ROLES = ["superadmin", "nurse", "doctor", "dentist", "staff"];

async function authorize() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function getAllergies(patientId: string) {
  const { supabase, user } = await authorize();
  const { data: profileRaw } = await supabase.from("patient_profiles" as never).select("id").eq("user_id", user.id).maybeSingle();
  const profile = profileRaw as { id: string } | null;
  const isOwner = profile?.id === patientId;
  const { data: rolesRaw } = await supabase.from("user_roles").select("roles(name)").eq("user_id", user.id);
  const roleNames = ((rolesRaw ?? []) as { roles: { name: string } | null }[]).map((r) => r.roles?.name).filter(Boolean) as string[];
  const isStaff = STAFF_ROLES.some((r) => roleNames.includes(r));
  if (!isOwner && !isStaff) return { data: [], error: null };
  const { data: allergyRaw, error } = await supabase.from("allergies" as never).select("*").eq("patient_id", patientId).order("created_at", { ascending: false });
  const data = allergyRaw as Allergy[] | null;
  return { data: data ?? [], error: error?.message ?? null };
}

export async function createAllergy(input: { patient_id: string; allergen: string; allergen_type?: string; reaction?: string; severity?: string; onset_date?: string; notes?: string }) {
  const { supabase, user } = await authorize();
  const { data: inserted, error } = await supabase.from("allergies" as never).insert({ patient_id: input.patient_id, allergen: input.allergen, allergen_type: input.allergen_type ?? "other", reaction: input.reaction ?? null, severity: input.severity ?? "moderate", onset_date: input.onset_date ?? null, notes: input.notes ?? null, recorded_by: user.id } as never).select().single();
  if (error) return { data: null, error: error.message };
  revalidatePath("/my-records/medical");
  return { data: inserted as unknown as Allergy, error: null };
}

export async function updateAllergy(id: string, input: Partial<{ allergen: string; allergen_type: string; reaction: string; severity: string; onset_date: string; notes: string; is_active: boolean }>) {
  const { supabase } = await authorize();
  const { error } = await supabase.from("allergies" as never).update({ ...input, updated_at: new Date().toISOString() } as never).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/my-records/medical");
  return { error: null };
}

export async function deleteAllergy(id: string) {
  const { supabase } = await authorize();
  const { error } = await supabase.from("allergies" as never).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/my-records/medical");
  return { error: null };
}
