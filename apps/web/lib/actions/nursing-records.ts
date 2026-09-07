"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";

export interface VitalSign {
  id: string;
  encounter_id: string;
  patient_id: string;
  recorded_by: string;
  temperature_c: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate_bpm: number | null;
  resp_rate_cpm: number | null;
  spo2_percent: number | null;
  pain_score: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  recorded_at: string;
  notes: string | null;
}

export interface NursingAssessment {
  id: string;
  encounter_id: string;
  patient_id: string;
  assessed_by: string;
  assessment_type: string;
  chief_complaint: string | null;
  symptoms: string | null;
  duration: string | null;
  relevant_history: string | null;
  allergies: string | null;
  current_meds: string | null;
  observations: string | null;
  red_flags: string[];
  nursing_notes: string | null;
  is_minor_illness: boolean;
  protocol_name: string | null;
  intervention: string | null;
  disposition: string | null;
  priority: string;
  created_at: string;
}

export async function getVitalSigns(encounterId: string): Promise<{
  data: VitalSign[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "doctor"].includes(callerRole)) {
    return { data: [], error: "Insufficient permissions to view vital signs" };
  }

  const { data, error } = await supabase
    .from("vital_signs")
    .select("*")
    .eq("encounter_id", encounterId)
    .order("recorded_at", { ascending: false });

  return { data: (data as VitalSign[]) ?? [], error: error?.message ?? null };
}

export async function recordVitalSigns(vitals: {
  encounter_id: string;
  patient_id: string;
  temperature_c?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate_bpm?: number;
  resp_rate_cpm?: number;
  spo2_percent?: number;
  pain_score?: number;
  weight_kg?: number;
  height_cm?: number;
  notes?: string;
}): Promise<{ data: VitalSign | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "doctor"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions to record vital signs" };
  }

  const { data, error } = await supabase
    .from("vital_signs")
    .insert({
      encounter_id: vitals.encounter_id,
      patient_id: vitals.patient_id,
      recorded_by: user.id,
      temperature_c: vitals.temperature_c ?? null,
      systolic_bp: vitals.systolic_bp ?? null,
      diastolic_bp: vitals.diastolic_bp ?? null,
      heart_rate_bpm: vitals.heart_rate_bpm ?? null,
      resp_rate_cpm: vitals.resp_rate_cpm ?? null,
      spo2_percent: vitals.spo2_percent ?? null,
      pain_score: vitals.pain_score ?? null,
      weight_kg: vitals.weight_kg ?? null,
      height_cm: vitals.height_cm ?? null,
      notes: vitals.notes ?? null,
    })
    .select()
    .single();

  revalidatePath("/");
  return { data: data as VitalSign | null, error: error?.message ?? null };
}

export async function getNursingAssessments(encounterId: string): Promise<{
  data: NursingAssessment[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "doctor"].includes(callerRole)) {
    return { data: [], error: "Insufficient permissions to view nursing assessments" };
  }

  const { data, error } = await supabase
    .from("nursing_assessments")
    .select("*")
    .eq("encounter_id", encounterId)
    .order("created_at", { ascending: false });

  return { data: (data as NursingAssessment[]) ?? [], error: error?.message ?? null };
}

export async function saveNursingAssessment(assessment: {
  encounter_id: string;
  patient_id: string;
  assessment_type?: string;
  chief_complaint?: string;
  symptoms?: string;
  duration?: string;
  relevant_history?: string;
  allergies?: string;
  current_meds?: string;
  observations?: string;
  red_flags?: string[];
  nursing_notes?: string;
  is_minor_illness?: boolean;
  protocol_name?: string;
  intervention?: string;
  disposition?: string;
  priority?: string;
}): Promise<{ data: NursingAssessment | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions" };
  }

  const { data, error } = await supabase
    .from("nursing_assessments")
    .insert({
      encounter_id: assessment.encounter_id,
      patient_id: assessment.patient_id,
      assessed_by: user.id,
      assessment_type: assessment.assessment_type ?? "initial",
      chief_complaint: assessment.chief_complaint ?? null,
      symptoms: assessment.symptoms ?? null,
      duration: assessment.duration ?? null,
      relevant_history: assessment.relevant_history ?? null,
      allergies: assessment.allergies ?? null,
      current_meds: assessment.current_meds ?? null,
      observations: assessment.observations ?? null,
      red_flags: assessment.red_flags ?? [],
      nursing_notes: assessment.nursing_notes ?? null,
      is_minor_illness: assessment.is_minor_illness ?? false,
      protocol_name: assessment.protocol_name ?? null,
      intervention: assessment.intervention ?? null,
      disposition: assessment.disposition ?? null,
      priority: assessment.priority ?? "normal",
    })
    .select()
    .single();

  revalidatePath("/");
  return { data: data as NursingAssessment | null, error: error?.message ?? null };
}
