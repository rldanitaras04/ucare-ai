"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import type { Database } from "@repo/types";

type PrescriptionStatus = Database["public"]["Enums"]["prescription_status"];
type PrescriptionType = Database["public"]["Enums"]["prescription_type"];
type MedicationRoute = Database["public"]["Enums"]["medication_route"];
type MedicationFrequency = Database["public"]["Enums"]["medication_frequency"];

export type { PrescriptionStatus, PrescriptionType, MedicationRoute, MedicationFrequency };

export interface Prescription {
  id: string;
  prescription_number: string;
  patient_id: string;
  encounter_id: string | null;
  prescriber_id: string;
  prescription_type: PrescriptionType;
  status: PrescriptionStatus;
  medication_name: string;
  medication_strength: string | null;
  dose: string;
  route: MedicationRoute;
  frequency: MedicationFrequency;
  frequency_custom: string | null;
  duration_days: number | null;
  quantity: number | null;
  instructions: string | null;
  date_prescribed: string;
  date_issued: string | null;
  date_dispensed: string | null;
  date_completed: string | null;
  signed_at: string | null;
  signed_by: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionWithDetails extends Prescription {
  patient?: {
    first_name: string;
    last_name: string;
    university_id: string;
  } | null;
  prescriber?: {
    full_name: string | null;
    email: string;
  } | null;
}

const STATUS_LABELS: Record<PrescriptionStatus, string> = {
  draft: "Draft",
  signed: "Signed",
  issued: "Issued",
  dispensed: "Dispensed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const ROUTE_LABELS: Record<MedicationRoute, string> = {
  oral: "Oral",
  topical: "Topical",
  intravenous: "IV",
  intramuscular: "IM",
  subcutaneous: "SC",
  inhalation: "Inhalation",
  rectal: "Rectal",
  ophthalmic: "Ophthalmic",
  otic: "Otic",
  nasal: "Nasal",
  sublingual: "Sublingual",
  transdermal: "Transdermal",
  other: "Other",
};

const FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_times_daily: "Three times daily",
  four_times_daily: "Four times daily",
  every_4_hours: "Every 4 hours",
  every_6_hours: "Every 6 hours",
  every_8_hours: "Every 8 hours",
  every_12_hours: "Every 12 hours",
  as_needed: "As needed",
  at_bedtime: "At bedtime",
  with_meals: "With meals",
  other: "Other",
};

export { STATUS_LABELS, ROUTE_LABELS, FREQUENCY_LABELS };

export async function getPrescriptions(): Promise<{
  data: PrescriptionWithDetails[] | null;
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
    .from("prescriptions")
    .select(`
      *,
      patient:patient_profiles(first_name, last_name, university_id),
      prescriber:prescriber_id(full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const result: PrescriptionWithDetails[] = (data ?? []).map((record) => {
    const { patient, prescriber, ...rest } = record as Record<string, unknown> & {
      patient: { first_name: string; last_name: string; university_id: string } | null;
      prescriber: { full_name: string | null; email: string } | null;
    };
    return {
      ...(rest as unknown as Prescription),
      patient: patient ?? null,
      prescriber: prescriber ?? null,
    };
  });

  return { data: result, error: null };
}

export async function getPrescriptionsByPatient(
  patientId: string
): Promise<{ data: Prescription[] | null; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data as Prescription[]) ?? [], error: null };
}

export async function createPrescription(prescription: {
  patient_id: string;
  encounter_id?: string;
  prescription_type: PrescriptionType;
  medication_name: string;
  medication_strength?: string;
  dose: string;
  route: MedicationRoute;
  frequency: MedicationFrequency;
  frequency_custom?: string;
  duration_days?: number;
  quantity?: number;
  instructions?: string;
}): Promise<{ data: Prescription | null; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  // Generate prescription number
  const { data: numberData, error: numberError } = await supabase.rpc(
    "generate_prescription_number"
  );

  if (numberError || !numberData) {
    return { data: null, error: numberError?.message ?? "Failed to generate prescription number" };
  }

  const { data, error } = await supabase
    .from("prescriptions")
    .insert({
      prescription_number: numberData as string,
      patient_id: prescription.patient_id,
      encounter_id: prescription.encounter_id || null,
      prescriber_id: user.id,
      prescription_type: prescription.prescription_type,
      medication_name: prescription.medication_name,
      medication_strength: prescription.medication_strength || null,
      dose: prescription.dose,
      route: prescription.route,
      frequency: prescription.frequency,
      frequency_custom: prescription.frequency_custom || null,
      duration_days: prescription.duration_days || null,
      quantity: prescription.quantity || null,
      instructions: prescription.instructions || null,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/prescriptions");
  return { data: data as unknown as Prescription, error: null };
}

export async function updatePrescriptionStatus(
  prescriptionId: string,
  status: PrescriptionStatus,
  cancellationReason?: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const updateData: {
    status: PrescriptionStatus;
    signed_at?: string;
    signed_by?: string;
    date_issued?: string;
    date_dispensed?: string;
    date_completed?: string;
    cancellation_reason?: string | null;
  } = { status };

  if (status === "signed") {
    updateData.signed_at = new Date().toISOString();
    updateData.signed_by = user.id;
  } else if (status === "issued") {
    updateData.date_issued = new Date().toISOString();
  } else if (status === "dispensed") {
    updateData.date_dispensed = new Date().toISOString();
  } else if (status === "completed") {
    updateData.date_completed = new Date().toISOString();
  } else if (status === "cancelled") {
    updateData.cancellation_reason = cancellationReason || null;
  }

  const { error } = await supabase
    .from("prescriptions")
    .update(updateData)
    .eq("id", prescriptionId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/prescriptions");
  return { success: true, error: null };
}

export async function deletePrescription(
  prescriptionId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Only allow deleting draft prescriptions
  const { data: prescription } = await supabase
    .from("prescriptions")
    .select("status")
    .eq("id", prescriptionId)
    .single();

  if (!prescription || prescription.status !== "draft") {
    return { success: false, error: "Only draft prescriptions can be deleted" };
  }

  const { error } = await supabase
    .from("prescriptions")
    .delete()
    .eq("id", prescriptionId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/prescriptions");
  return { success: true, error: null };
}
