"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";

export interface MedicationAdministration {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  prescription_id: string | null;
  administered_by: string;
  medication_name: string;
  medication_strength: string | null;
  dose: string;
  route: string;
  administered_at: string;
  source_inventory: string | null;
  batch_number: string | null;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  adverse_reaction: string | null;
}

export async function getMedicationAdministrations(patientId: string): Promise<{
  data: MedicationAdministration[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "doctor"].includes(callerRole)) {
    return { data: [], error: "Insufficient permissions to view medication administrations" };
  }

  const { data, error } = await supabase
    .from("medication_administrations")
    .select("*")
    .eq("patient_id", patientId)
    .order("administered_at", { ascending: false });

  return { data: (data as MedicationAdministration[]) ?? [], error: error?.message ?? null };
}

export async function recordMedicationAdministration(admin: {
  patient_id: string;
  encounter_id?: string;
  prescription_id?: string;
  medication_name: string;
  medication_strength?: string;
  dose: string;
  route?: string;
  source_inventory?: string;
  batch_number?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  adverse_reaction?: string;
}): Promise<{ data: MedicationAdministration | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions" };
  }

  const { data, error } = await supabase
    .from("medication_administrations")
    .insert({
      patient_id: admin.patient_id,
      encounter_id: admin.encounter_id ?? null,
      prescription_id: admin.prescription_id ?? null,
      administered_by: user.id,
      medication_name: admin.medication_name,
      medication_strength: admin.medication_strength ?? null,
      dose: admin.dose,
      route: admin.route ?? "oral",
      source_inventory: admin.source_inventory ?? null,
      batch_number: admin.batch_number ?? null,
      quantity: admin.quantity ?? null,
      unit: admin.unit ?? "tablets",
      notes: admin.notes ?? null,
      adverse_reaction: admin.adverse_reaction ?? null,
    })
    .select()
    .single();

  revalidatePath("/");
  return { data: data as MedicationAdministration | null, error: error?.message ?? null };
}
