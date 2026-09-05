"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";

export interface PatientProfile {
  id: string;
  user_id: string | null;
  university_id: string;
  student_employee_no: string | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  sex: string | null;
  date_of_birth: string | null;
  contact_number: string | null;
  affiliation: "student" | "faculty" | "staff" | null;
  college_unit: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
  blood_type: string | null;
  allergies: string[];
  chronic_conditions: string[];
  created_at: string;
  updated_at: string;
}

export interface PatientVisit {
  id: string;
  service_type: string;
  status: string;
  reason_for_visit: string | null;
  visit_date: string;
  created_at: string;
}

export interface PatientWithVisits extends PatientProfile {
  visits: PatientVisit[];
  visit_count: number;
}

export async function getPatients(): Promise<{
  data: PatientProfile[] | null;
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
    .from("patient_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

export async function searchPatients(
  query: string
): Promise<{ data: PatientProfile[] | null; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return { data: null, error: "Search query is required" };
  }

  const { data, error } = await supabase
    .from("patient_profiles")
    .select("*")
    .or(
      `university_id.ilike.%${trimmed}%,first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,student_employee_no.ilike.%${trimmed}%`
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

export async function getPatientById(
  patientId: string
): Promise<{ data: PatientWithVisits | null; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: patient, error } = await supabase
    .from("patient_profiles")
    .select("*")
    .eq("id", patientId)
    .single();

  if (error || !patient) {
    return { data: null, error: error?.message ?? "Patient not found" };
  }

  const { data: visits } = await supabase
    .from("walk_in_visits")
    .select("id, service_type, status, reason_for_visit, visit_date, created_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  return {
    data: {
      ...patient,
      visits: visits ?? [],
      visit_count: visits?.length ?? 0,
    },
    error: null,
  };
}

export async function updatePatientProfile(
  patientId: string,
  data: Partial<PatientProfile>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("patient_profiles")
    .update({
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name,
      sex: data.sex,
      date_of_birth: data.date_of_birth,
      contact_number: data.contact_number,
      affiliation: data.affiliation,
      college_unit: data.college_unit,
      student_employee_no: data.student_employee_no,
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_number: data.emergency_contact_number,
      blood_type: data.blood_type,
      allergies: data.allergies,
      chronic_conditions: data.chronic_conditions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
  return { success: true, error: null };
}
