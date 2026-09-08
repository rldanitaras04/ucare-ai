"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import { getAuthContext, hasRole } from "@/lib/auth";
import type { Database } from "@repo/types";

const TRIAGE_ROLES = ["superadmin", "nurse", "doctor"] as const;
const VIEWER_ROLES = ["superadmin", "nurse", "staff", "doctor", "dentist"] as const;

type PriorityLevel = Database["public"]["Enums"]["priority_level"];
type DutyStatus = Database["public"]["Enums"]["duty_status"];

export interface VisitWithPatient {
  visit_id: string;
  patient_id: string;
  university_id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  service_type: string;
  visit_status: string;
  reason_for_visit: string | null;
  visit_date: string;
  queue_number: string;
  queue_priority: string;
  queue_status: string;
}

export interface TriageAssessmentData {
  visit_id: string;
  is_fallback: boolean;
  fallback_reason: string | null;
  priority: PriorityLevel;
  temperature_c: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate_bpm: number | null;
  resp_rate_cpm: number | null;
  spo2_percent: number | null;
  pain_score: number;
  chief_complaint: string | null;
  red_flags: string[];
  triage_notes: string | null;
}

export interface NurseStatus {
  is_nurse_available: boolean;
  nurse_name: string | null;
  duty_status: DutyStatus | null;
  notes: string | null;
}

export async function getNurseAvailability(): Promise<{
  data: NurseStatus;
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      data: { is_nurse_available: false, nurse_name: null, duty_status: null, notes: null },
      error: "Not authenticated",
    };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: record } = await supabase
    .from("staff_availability")
    .select("duty_status, notes, profiles!staff_availability_staff_profile_id_fkey(full_name)")
    .gte("created_at", `${today}T00:00:00`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!record) {
    return {
      data: { is_nurse_available: true, nurse_name: null, duty_status: "available", notes: null },
      error: null,
    };
  }

  const nurseName =
    record.profiles && typeof record.profiles === "object" && "full_name" in record.profiles
      ? (record.profiles as { full_name: string | null }).full_name
      : null;

  const isAvailable = record.duty_status === "available";

  return {
    data: {
      is_nurse_available: isAvailable,
      nurse_name: nurseName,
      duty_status: record.duty_status,
      notes: record.notes,
    },
    error: null,
  };
}

export async function getVisitDetails(visitId: string): Promise<{
  data: VisitWithPatient | null;
  error: string | null;
}> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...VIEWER_ROLES])) {
    return { data: null, error: "Insufficient permissions to view visit details" };
  }

  const { data, error } = await auth.supabase
    .from("walk_in_visits")
    .select(`
      id as visit_id,
      patient_id,
      service_type,
      status as visit_status,
      reason_for_visit,
      visit_date,
      patient_profiles!walk_in_visits_patient_id_fkey (
        university_id,
        first_name,
        last_name,
        middle_name
      ),
      queue_entries!queue_entries_visit_id_fkey (
        queue_number,
        priority as queue_priority,
        status as queue_status
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
    visit_date: string;
    patient_profiles: {
      university_id: string;
      first_name: string;
      last_name: string;
      middle_name: string | null;
    } | null;
    queue_entries: Array<{
      queue_number: string;
      queue_priority: string;
      queue_status: string;
    }>;
  };

  const patient = row.patient_profiles;
  const queue = row.queue_entries?.[0];

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
      visit_date: row.visit_date,
      queue_number: queue?.queue_number ?? "N/A",
      queue_priority: queue?.queue_priority ?? "normal",
      queue_status: queue?.queue_status ?? "waiting",
    },
    error: null,
  };
}

export async function saveTriageAssessment(
  assessment: TriageAssessmentData
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...TRIAGE_ROLES])) {
    return { success: false, error: "Insufficient permissions to perform triage" };
  }
  const supabase = auth.supabase;

  // 1. Insert triage record
  const { error: triageError } = await supabase.from("triage_records").insert({
    visit_id: assessment.visit_id,
    triaged_by: auth.user.id,
    is_fallback: assessment.is_fallback,
    fallback_reason: assessment.fallback_reason,
    priority: assessment.priority,
    temperature_c: assessment.temperature_c,
    systolic_bp: assessment.systolic_bp,
    diastolic_bp: assessment.diastolic_bp,
    heart_rate_bpm: assessment.heart_rate_bpm,
    resp_rate_cpm: assessment.resp_rate_cpm,
    spo2_percent: assessment.spo2_percent,
    pain_score: assessment.pain_score,
    chief_complaint: assessment.chief_complaint,
    red_flags: assessment.red_flags,
    triage_notes: assessment.triage_notes,
  });

  if (triageError) {
    return { success: false, error: triageError.message };
  }

  // 2. Update walk_in_visits status to 'triaged'
  const { error: visitError } = await supabase
    .from("walk_in_visits")
    .update({ status: "triaged" })
    .eq("id", assessment.visit_id);

  if (visitError) {
    return { success: false, error: visitError.message };
  }

  // 3. Update queue_entries priority to reflect clinical urgency
  const { error: queueError } = await supabase
    .from("queue_entries")
    .update({ priority: assessment.priority })
    .eq("visit_id", assessment.visit_id);

  if (queueError) {
    return { success: false, error: queueError.message };
  }

  revalidatePath("/triage");
  revalidatePath("/walk-ins");
  revalidatePath("/queue-board");

  return { success: true, error: null };
}

export async function getVisitsForTriage(): Promise<{
  data: VisitWithPatient[];
  error: string | null;
}> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...VIEWER_ROLES])) {
    return { data: [], error: "Insufficient permissions to view triage visits" };
  }

  const { data, error } = await auth.supabase
    .from("walk_in_visits")
    .select(`
      id,
      patient_id,
      service_type,
      status,
      reason_for_visit,
      visit_date,
      patient_profiles!walk_in_visits_patient_id_fkey (
        university_id, first_name, last_name, middle_name
      ),
      queue_entries!queue_entries_visit_id_fkey (
        queue_number, priority, status
      )
    `)
    .eq("status", "registered")
    .order("visit_date", { ascending: false });

  if (error) return { data: [], error: error.message };

interface TriageVisitRow {
  id: string;
  patient_id: string;
  service_type: string;
  status: string;
  reason_for_visit: string | null;
  visit_date: string;
  patient_profiles: {
    university_id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
  } | null;
  queue_entries: Array<{
    queue_number: string;
    priority: string;
    status: string;
  }>;
}

  const visits: VisitWithPatient[] = (data ?? []).map((row: TriageVisitRow) => {
    const patient = row.patient_profiles;
    const queue = row.queue_entries?.[0];
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
      visit_date: row.visit_date,
      queue_number: queue?.queue_number ?? "N/A",
      queue_priority: queue?.priority ?? "normal",
      queue_status: queue?.status ?? "waiting",
    };
  });

  return { data: visits, error: null };
}
