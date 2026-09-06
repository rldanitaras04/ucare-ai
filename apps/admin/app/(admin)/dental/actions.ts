"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import type { Database } from "@repo/types";

type OdontogramCondition = Database["public"]["Enums"]["odontogram_condition"];
type OdontogramSurface = Database["public"]["Enums"]["odontogram_surface"];
type EncounterStatus = Database["public"]["Enums"]["encounter_status"];

export interface DentalVisitData {
  visit_id: string;
  patient_id: string;
  university_id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  service_type: string;
  visit_status: string;
  reason_for_visit: string | null;
  queue_number: string;
  priority_level: string | null;
  chief_complaint: string | null;
}

export interface DentalEncounterData {
  encounter_id: string;
  visit_id: string;
  patient_id: string;
  dentist_id: string;
  examination_notes: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  status: EncounterStatus;
  created_at: string;
}

export interface OdontogramEntryData {
  id: string;
  dental_encounter_id: string;
  patient_id: string;
  tooth_number: number;
  surface: string;
  condition: string;
  procedure_performed: string | null;
  notes: string | null;
}

export async function getDentalVisit(visitId: string): Promise<{
  data: DentalVisitData | null;
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
    .from("walk_in_visits")
    .select(`
      id as visit_id,
      patient_id,
      service_type,
      status as visit_status,
      reason_for_visit,
      patient_profiles!walk_in_visits_patient_id_fkey (
        university_id,
        first_name,
        last_name,
        middle_name
      ),
      queue_entries!queue_entries_visit_id_fkey (
        queue_number
      ),
      triage_records!triage_records_visit_id_fkey (
        priority_level,
        chief_complaint
      )
    `)
    .eq("id", visitId)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Visit not found" };
  }

  const row = data as unknown as {
    visit_id: string;
    patient_id: string;
    service_type: string;
    visit_status: string;
    reason_for_visit: string | null;
    patient_profiles: {
      university_id: string;
      first_name: string;
      last_name: string;
      middle_name: string | null;
    } | null;
    queue_entries: Array<{ queue_number: string }>;
    triage_records: Array<{
      priority_level: string | null;
      chief_complaint: string | null;
    }>;
  };

  const patient = row.patient_profiles;
  const queue = row.queue_entries?.[0];
  const triage = row.triage_records?.[0];

  return {
    data: {
      visit_id: row.visit_id,
      patient_id: row.patient_id,
      university_id: patient?.university_id ?? "N/A",
      first_name: patient?.first_name ?? "Unknown",
      last_name: patient?.last_name ?? "Patient",
      middle_name: patient?.middle_name ?? null,
      service_type: row.service_type,
      visit_status: row.visit_status,
      reason_for_visit: row.reason_for_visit,
      queue_number: queue?.queue_number ?? "N/A",
      priority_level: triage?.priority_level ?? null,
      chief_complaint: triage?.chief_complaint ?? null,
    },
    error: null,
  };
}

export async function getOrCreateDentalEncounter(visitId: string): Promise<{
  data: DentalEncounterData | null;
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  // Check for existing active encounter
  const { data: existing } = await supabase
    .from("dental_encounters")
    .select("*")
    .eq("visit_id", visitId)
    .eq("dentist_id", user.id)
    .eq("status", "in_progress")
    .single();

  if (existing) {
    return { data: existing as unknown as DentalEncounterData, error: null };
  }

  // Get visit details for patient_id
  const { data: visit } = await supabase
    .from("walk_in_visits")
    .select("patient_id")
    .eq("id", visitId)
    .single();

  if (!visit) {
    return { data: null, error: "Visit not found" };
  }

  // Create new encounter
  const { data: encounter, error: insertError } = await supabase
    .from("dental_encounters")
    .insert({
      visit_id: visitId,
      patient_id: visit.patient_id,
      dentist_id: user.id,
      status: "in_progress",
    })
    .select("*")
    .single();

  if (insertError) {
    return { data: null, error: insertError.message };
  }

  // Update visit status
  await supabase
    .from("walk_in_visits")
    .update({ status: "in_consultation" })
    .eq("id", visitId);

  revalidatePath("/dental");

  return { data: encounter as unknown as DentalEncounterData, error: null };
}

export async function getOdontogramEntries(encounterId: string): Promise<{
  data: OdontogramEntryData[];
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("odontogram_entries")
    .select("*")
    .eq("dental_encounter_id", encounterId)
    .order("tooth_number")
    .order("surface");

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data as unknown as OdontogramEntryData[]) ?? [], error: null };
}

export interface SaveOdontogramData {
  encounter_id: string;
  patient_id: string;
  entries: Array<{
    tooth_number: number;
    surface: OdontogramSurface;
    condition: OdontogramCondition;
    procedure_performed?: string;
    notes?: string;
  }>;
}

export async function saveOdontogramEntries(
  data: SaveOdontogramData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Delete existing entries for this encounter
  const { error: deleteError } = await supabase
    .from("odontogram_entries")
    .delete()
    .eq("dental_encounter_id", data.encounter_id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  // Insert new entries (only non-sound)
  const nonSound = data.entries.filter((e) => e.condition !== "sound");
  if (nonSound.length > 0) {
    const { error: insertError } = await supabase
      .from("odontogram_entries")
      .insert(
        nonSound.map((entry) => ({
          dental_encounter_id: data.encounter_id,
          patient_id: data.patient_id,
          tooth_number: entry.tooth_number,
          surface: entry.surface,
          condition: entry.condition,
          procedure_performed: entry.procedure_performed ?? null,
          notes: entry.notes ?? null,
        }))
      );

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath("/dental");

  return { success: true, error: null };
}

export interface SaveDentalFindings {
  encounter_id: string;
  examination_notes: string;
  diagnosis: string;
  treatment_plan: string;
}

export async function saveDentalFindings(
  findings: SaveDentalFindings
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("dental_encounters")
    .update({
      examination_notes: findings.examination_notes || null,
      diagnosis: findings.diagnosis || null,
      treatment_plan: findings.treatment_plan || null,
    })
    .eq("id", findings.encounter_id)
    .eq("dentist_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dental");

  return { success: true, error: null };
}

export async function completeDentalEncounter(encounterId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get encounter to find visit_id
  const { data: encounter } = await supabase
    .from("dental_encounters")
    .select("visit_id")
    .eq("id", encounterId)
    .eq("dentist_id", user.id)
    .single();

  if (!encounter) {
    return { success: false, error: "Encounter not found" };
  }

  // Complete the encounter
  const { error: encounterError } = await supabase
    .from("dental_encounters")
    .update({ status: "completed" })
    .eq("id", encounterId);

  if (encounterError) {
    return { success: false, error: encounterError.message };
  }

  // Update visit status to completed
  const { error: visitError } = await supabase
    .from("walk_in_visits")
    .update({ status: "completed" })
    .eq("id", encounter.visit_id);

  if (visitError) {
    return { success: false, error: visitError.message };
  }

  // Update queue entry status
  await supabase
    .from("queue_entries")
    .update({ status: "served" })
    .eq("visit_id", encounter.visit_id);

  revalidatePath("/dental");
  revalidatePath("/walk-ins");
  revalidatePath("/queue-board");

  return { success: true, error: null };
}

export async function getVisitsForDental(): Promise<{
  data: DentalVisitData[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("walk_in_visits")
    .select(`
      id,
      patient_id,
      service_type,
      status,
      reason_for_visit,
      patient_profiles!walk_in_visits_patient_id_fkey (
        university_id, first_name, last_name, middle_name
      ),
      queue_entries!queue_entries_visit_id_fkey (
        queue_number
      ),
      triage_records!triage_records_visit_id_fkey (
        priority_level, chief_complaint
      )
    `)
    .eq("service_type", "dental")
    .in("status", ["registered", "triaged"])
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  const visits: DentalVisitData[] = (data ?? []).map((row: any) => {
    const patient = row.patient_profiles;
    const queue = row.queue_entries?.[0];
    const triage = row.triage_records?.[0];
    return {
      visit_id: row.id,
      patient_id: row.patient_id,
      university_id: patient?.university_id ?? "N/A",
      first_name: patient?.first_name ?? "Unknown",
      last_name: patient?.last_name ?? "Patient",
      middle_name: patient?.middle_name ?? null,
      service_type: row.service_type,
      visit_status: row.status,
      reason_for_visit: row.reason_for_visit,
      queue_number: queue?.queue_number ?? "N/A",
      priority_level: triage?.priority_level ?? null,
      chief_complaint: triage?.chief_complaint ?? null,
    };
  });

  return { data: visits, error: null };
}
