"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import type { Database } from "@repo/types";

const PROVIDER_ROLES = ["super_admin", "admin", "doctor", "dentist"];

type EncounterStatus = Database["public"]["Enums"]["encounter_status"];

export interface VisitWithTriage {
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
  red_flags: string[];
  temperature_c: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate_bpm: number | null;
  spo2_percent: number | null;
  pain_score: number | null;
}

export interface EncounterData {
  encounter_id: string;
  visit_id: string;
  patient_id: string;
  provider_id: string;
  encounter_type: string;
  status: EncounterStatus;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  diagnosis_codes: string[];
  notes: string | null;
  started_at: string;
  completed_at: string | null;
}

export async function getVisitForConsultation(visitId: string): Promise<{
  data: VisitWithTriage | null;
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
        priority,
        chief_complaint,
        red_flags,
        temperature_c,
        systolic_bp,
        diastolic_bp,
        heart_rate_bpm,
        spo2_percent,
        pain_score
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
      priority: string | null;
      chief_complaint: string | null;
      red_flags: string[];
      temperature_c: number | null;
      systolic_bp: number | null;
      diastolic_bp: number | null;
      heart_rate_bpm: number | null;
      spo2_percent: number | null;
      pain_score: number | null;
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
      priority_level: triage?.priority ?? null,
      chief_complaint: triage?.chief_complaint ?? null,
      red_flags: triage?.red_flags ?? [],
      temperature_c: triage?.temperature_c ?? null,
      systolic_bp: triage?.systolic_bp ?? null,
      diastolic_bp: triage?.diastolic_bp ?? null,
      heart_rate_bpm: triage?.heart_rate_bpm ?? null,
      spo2_percent: triage?.spo2_percent ?? null,
      pain_score: triage?.pain_score ?? null,
    },
    error: null,
  };
}

export async function getOrCreateEncounter(visitId: string): Promise<{
  data: EncounterData | null;
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !PROVIDER_ROLES.includes(callerRole)) {
    return { data: null, error: "Insufficient permissions to create consultations" };
  }

  // Check for existing active encounter
  const { data: existing } = await supabase
    .from("clinical_encounters")
    .select("*")
    .eq("visit_id", visitId)
    .eq("provider_id", user.id)
    .eq("status", "in_progress")
    .single();

  if (existing) {
    return { data: existing as unknown as EncounterData, error: null };
  }

  // Get visit details for patient_id
  const { data: visit } = await supabase
    .from("walk_in_visits")
    .select("patient_id, service_type")
    .eq("id", visitId)
    .single();

  if (!visit) {
    return { data: null, error: "Visit not found" };
  }

  const encounterType =
    visit.service_type === "dental" ? "dental" : "medical";

  const { data: encounter, error: insertError } = await supabase
    .from("clinical_encounters")
    .insert({
      visit_id: visitId,
      patient_id: visit.patient_id,
      provider_id: user.id,
      encounter_type: encounterType,
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

  revalidatePath("/consultations");

  return { data: encounter as unknown as EncounterData, error: null };
}

export interface SoapNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosis_codes: string[];
  notes: string;
}

export async function saveSoapNotes(
  encounterId: string,
  soap: SoapNotes
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("clinical_encounters")
    .update({
      subjective: soap.subjective || null,
      objective: soap.objective || null,
      assessment: soap.assessment || null,
      plan: soap.plan || null,
      diagnosis_codes: soap.diagnosis_codes,
      notes: soap.notes || null,
    })
    .eq("id", encounterId)
    .eq("provider_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/consultations");

  return { success: true, error: null };
}

export async function completeEncounter(encounterId: string): Promise<{
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
    .from("clinical_encounters")
    .select("visit_id")
    .eq("id", encounterId)
    .eq("provider_id", user.id)
    .single();

  if (!encounter) {
    return { success: false, error: "Encounter not found" };
  }

  // Complete the encounter
  const { error: encounterError } = await supabase
    .from("clinical_encounters")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
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

  revalidatePath("/consultations");
  revalidatePath("/walk-ins");
  revalidatePath("/queue-board");

  return { success: true, error: null };
}

export async function getVisitsForConsultation(): Promise<{
  data: VisitWithTriage[];
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
        priority, chief_complaint, red_flags,
        temperature_c, systolic_bp, diastolic_bp,
        heart_rate_bpm, spo2_percent, pain_score
      )
    `)
    .eq("status", "triaged")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

interface ConsultationVisitRow {
  id: string;
  patient_id: string;
  service_type: string;
  status: string;
  reason_for_visit: string | null;
  patient_profiles: {
    university_id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
  } | null;
  queue_entries: Array<{ queue_number: string }>;
  triage_records: Array<{
    priority: string | null;
    chief_complaint: string | null;
    red_flags: string[];
    temperature_c: number | null;
    systolic_bp: number | null;
    diastolic_bp: number | null;
    heart_rate_bpm: number | null;
    spo2_percent: number | null;
    pain_score: number | null;
  }>;
}

  const visits: VisitWithTriage[] = (data ?? []).map((row: ConsultationVisitRow) => {
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
      priority_level: triage?.priority ?? null,
      chief_complaint: triage?.chief_complaint ?? null,
      red_flags: triage?.red_flags ?? [],
      temperature_c: triage?.temperature_c ?? null,
      systolic_bp: triage?.systolic_bp ?? null,
      diastolic_bp: triage?.diastolic_bp ?? null,
      heart_rate_bpm: triage?.heart_rate_bpm ?? null,
      spo2_percent: triage?.spo2_percent ?? null,
      pain_score: triage?.pain_score ?? null,
    };
  });

  return { data: visits, error: null };
}
