"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import { logAuditEvent, AuditActions } from "@repo/auth";
import type { Database } from "@repo/types";

const STAFF_ROLES = ["super_admin", "admin", "clinic_admin", "nurse", "doctor", "dentist", "staff", "clinic_staff"];

type ServiceType = Database["public"]["Enums"]["service_type"];

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
  affiliation: Database["public"]["Enums"]["affiliation_type"] | null;
  college_unit: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
  blood_type: string | null;
  allergies: string[];
  chronic_conditions: string[];
  created_at: string;
  updated_at: string;
}

export interface WalkInFormData {
  university_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  sex?: string;
  date_of_birth?: string;
  contact_number?: string;
  affiliation?: Database["public"]["Enums"]["affiliation_type"];
  college_unit?: string;
  student_employee_no?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  service_type: ServiceType;
  reason_for_visit: string;
}

export interface QueueEntry {
  id: string;
  visit_id: string;
  queue_number: string;
  service_category: ServiceType;
  priority: Database["public"]["Enums"]["priority_level"];
  status: Database["public"]["Enums"]["queue_status"];
  room_station: string | null;
  called_at: string | null;
  served_at: string | null;
  created_at: string;
}

export interface WalkInVisit {
  id: string;
  patient_id: string;
  service_type: ServiceType;
  status: Database["public"]["Enums"]["visit_status"];
  reason_for_visit: string | null;
  visit_date: string;
  created_at: string;
  updated_at: string;
}

export interface TicketData {
  visit: WalkInVisit;
  queue: QueueEntry;
  patient: PatientProfile;
}

const SERVICE_PREFIX: Record<ServiceType, string> = {
  medical: "M",
  dental: "D",
  nursing: "N",
  clearance: "C",
};

function generateQueueNumber(service: ServiceType, sequence: number): string {
  const prefix = SERVICE_PREFIX[service];
  return `${prefix}-${String(sequence).padStart(2, "0")}`;
}

export async function searchPatientByUniversityId(
  query: string
): Promise<{ data: PatientProfile | null; error: string | null }> {
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
    .or(`university_id.eq.${trimmed},student_employee_no.eq.${trimmed}`)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function registerWalkIn(
  formData: WalkInFormData
): Promise<{ data: TicketData | null; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !STAFF_ROLES.includes(callerRole)) {
    return { data: null, error: "Insufficient permissions to register walk-ins" };
  }

  // 1. Find or create patient profile
  let patientId: string;

  const { data: existingPatient } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("university_id", formData.university_id.trim())
    .maybeSingle();

  if (existingPatient) {
    patientId = existingPatient.id;
  } else {
    const { data: newPatient, error: patientError } = await supabase
      .from("patient_profiles")
      .insert({
        university_id: formData.university_id.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        middle_name: formData.middle_name?.trim() || null,
        sex: formData.sex || null,
        date_of_birth: formData.date_of_birth || null,
        contact_number: formData.contact_number?.trim() || null,
        affiliation: formData.affiliation || null,
        college_unit: formData.college_unit?.trim() || null,
        student_employee_no: formData.student_employee_no?.trim() || null,
        emergency_contact_name: formData.emergency_contact_name?.trim() || null,
        emergency_contact_number: formData.emergency_contact_number?.trim() || null,
      })
      .select("id")
      .single();

    if (patientError || !newPatient) {
      return { data: null, error: patientError?.message ?? "Failed to create patient profile" };
    }
    patientId = newPatient.id;
  }

  // 2. Create walk-in visit
  const { data: visit, error: visitError } = await supabase
    .from("walk_in_visits")
    .insert({
      patient_id: patientId,
      service_type: formData.service_type,
      reason_for_visit: formData.reason_for_visit.trim(),
      status: "registered",
    })
    .select("*")
    .single();

  if (visitError || !visit) {
    return { data: null, error: visitError?.message ?? "Failed to create walk-in visit" };
  }

  // 3. Generate queue number: count existing waiting/called/in_session entries for this service today
  const today = new Date().toISOString().split("T")[0];

  const { count } = await supabase
    .from("queue_entries")
    .select("*", { count: "exact", head: true })
    .eq("service_category", formData.service_type)
    .gte("created_at", `${today}T00:00:00`)
    .in("status", ["waiting", "called", "in_session"]);

  const sequence = (count ?? 0) + 1;
  const queueNumber = generateQueueNumber(formData.service_type, sequence);

  // 4. Insert queue entry
  const { data: queueEntry, error: queueError } = await supabase
    .from("queue_entries")
    .insert({
      visit_id: visit.id,
      queue_number: queueNumber,
      service_category: formData.service_type,
      priority: "normal",
      status: "waiting",
    })
    .select("*")
    .single();

  if (queueError || !queueEntry) {
    return { data: null, error: queueError?.message ?? "Failed to create queue entry" };
  }

  // 5. Fetch patient profile for the ticket
  const { data: patientProfile } = await supabase
    .from("patient_profiles")
    .select("*")
    .eq("id", patientId)
    .single();

  // 6. Audit log
  await logAuditEvent(supabase, {
    action: AuditActions.USER_CREATED,
    resource: "walk_in_visits",
    resource_id: visit.id,
    details: {
      patient_university_id: formData.university_id,
      service_type: formData.service_type,
      queue_number: queueNumber,
    },
  });

  revalidatePath("/walk-ins");
  revalidatePath("/queue-board");

  return {
    data: {
      visit,
      queue: queueEntry,
      patient: patientProfile as PatientProfile,
    },
    error: null,
  };
}

export async function getLiveQueue(): Promise<{
  data: QueueEntry[];
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], error: "Not authenticated" };
  }

  const priorityOrder = `
    CASE priority
      WHEN 'emergency' THEN 0
      WHEN 'urgent' THEN 1
      WHEN 'priority' THEN 2
      WHEN 'normal' THEN 3
    END
  `;

  const { data, error } = await supabase
    .from("queue_entries")
    .select("*")
    .in("status", ["waiting", "called", "in_session"])
    .order(priorityOrder, { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data ?? [], error: null };
}
