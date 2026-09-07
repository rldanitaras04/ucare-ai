"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";

export interface EmergencyContact {
  id: string;
  patient_id: string;
  name: string;
  relationship: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  is_primary: boolean;
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

export async function getEmergencyContacts(patientId: string) {
  const { supabase, user } = await authorize();
  const { data: profileRaw } = await supabase.from("patient_profiles" as never).select("id").eq("user_id", user.id).maybeSingle();
  const profile = profileRaw as { id: string } | null;
  const isOwner = profile?.id === patientId;
  const { data: rolesRaw } = await supabase.from("user_roles").select("roles(name)").eq("user_id", user.id);
  const roleNames = ((rolesRaw ?? []) as { roles: { name: string } | null }[]).map((r) => r.roles?.name).filter(Boolean) as string[];
  const isStaff = STAFF_ROLES.some((r) => roleNames.includes(r));
  if (!isOwner && !isStaff) return { data: [], error: null };
  const { data: contactsRaw, error } = await supabase.from("emergency_contacts" as never).select("*").eq("patient_id", patientId).order("is_primary", { ascending: false });
  const data = contactsRaw as EmergencyContact[] | null;
  return { data: data ?? [], error: error?.message ?? null };
}

export async function createEmergencyContact(input: { patient_id: string; name: string; relationship?: string; phone: string; email?: string; address?: string; is_primary?: boolean }) {
  const { supabase } = await authorize();
  const { data: inserted, error } = await supabase.from("emergency_contacts" as never).insert({ patient_id: input.patient_id, name: input.name, relationship: input.relationship ?? null, phone: input.phone, email: input.email ?? null, address: input.address ?? null, is_primary: input.is_primary ?? true } as never).select().single();
  if (error) return { data: null, error: error.message };
  revalidatePath("/my-records/medical");
  return { data: inserted as unknown as EmergencyContact, error: null };
}

export async function updateEmergencyContact(id: string, input: Partial<{ name: string; relationship: string; phone: string; email: string; address: string; is_primary: boolean }>) {
  const { supabase } = await authorize();
  const { error } = await supabase.from("emergency_contacts" as never).update({ ...input, updated_at: new Date().toISOString() } as never).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/my-records/medical");
  return { error: null };
}

export async function deleteEmergencyContact(id: string) {
  const { supabase } = await authorize();
  const { error } = await supabase.from("emergency_contacts" as never).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/my-records/medical");
  return { error: null };
}
