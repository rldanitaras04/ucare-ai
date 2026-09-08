"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import { getAuthContext, hasRole } from "@/lib/auth";

const STAFF_ROLES = ["superadmin", "nurse", "doctor", "dentist", "staff"] as const;

export type QueueStatus = "waiting" | "called" | "in_session" | "served" | "skipped";
export type PriorityLevel = "emergency" | "urgent" | "priority" | "normal";

export interface QueueEntryWithVisit {
  id: string;
  visit_id: string;
  queue_number: string;
  service_category: string;
  priority: PriorityLevel;
  status: QueueStatus;
  room_station: string | null;
  called_at: string | null;
  served_at: string | null;
  created_at: string;
  walk_in_visits?: {
    id: string;
    patient_id: string;
    service_type: string;
    status: string;
    reason_for_visit: string | null;
    patient_profiles?: {
      first_name: string;
      last_name: string;
      university_id: string;
    } | null;
  } | null;
}

export async function getQueueWithPatients(): Promise<{
  data: QueueEntryWithVisit[] | null;
  error: string | null;
}> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...STAFF_ROLES])) {
    return { data: null, error: "Insufficient permissions to view queue" };
  }

  const { data, error } = await auth.supabase
    .from("queue_entries")
    .select(`
      *,
      walk_in_visits!queue_entries_visit_id_fkey (
        id,
        patient_id,
        service_type,
        status,
        reason_for_visit,
        patient_profiles!walk_in_visits_patient_id_fkey (
          first_name,
          last_name,
          university_id
        )
      )
    `)
    .in("status", ["waiting", "called", "in_session"])
    .order("created_at", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data as unknown as QueueEntryWithVisit[]) ?? [], error: null };
}

export async function callPatient(
  queueEntryId: string,
  roomStation?: string
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...STAFF_ROLES])) {
    return { success: false, error: "Insufficient permissions to call patients" };
  }

  const { error } = await auth.supabase
    .from("queue_entries")
    .update({
      status: "called",
      called_at: new Date().toISOString(),
      room_station: roomStation || null,
    })
    .eq("id", queueEntryId)
    .eq("status", "waiting");

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/queue-board");
  revalidatePath("/consultations");
  return { success: true, error: null };
}

export async function startSession(
  queueEntryId: string
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...STAFF_ROLES])) {
    return { success: false, error: "Insufficient permissions to start session" };
  }

  const { error } = await auth.supabase
    .from("queue_entries")
    .update({ status: "in_session" })
    .eq("id", queueEntryId)
    .eq("status", "called");

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/queue-board");
  return { success: true, error: null };
}

export async function skipPatient(
  queueEntryId: string
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...STAFF_ROLES])) {
    return { success: false, error: "Insufficient permissions to skip patients" };
  }

  const { error } = await auth.supabase
    .from("queue_entries")
    .update({ status: "skipped" })
    .eq("id", queueEntryId)
    .in("status", ["waiting", "called"]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/queue-board");
  return { success: true, error: null };
}

export async function requeuePatient(
  queueEntryId: string
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...STAFF_ROLES])) {
    return { success: false, error: "Insufficient permissions to requeue patients" };
  }

  const { error } = await auth.supabase
    .from("queue_entries")
    .update({
      status: "waiting",
      called_at: null,
      served_at: null,
    })
    .eq("id", queueEntryId)
    .eq("status", "skipped");

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/queue-board");
  return { success: true, error: null };
}

export async function updatePriority(
  queueEntryId: string,
  priority: PriorityLevel
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...STAFF_ROLES])) {
    return { success: false, error: "Insufficient permissions to update priority" };
  }

  const { error } = await auth.supabase
    .from("queue_entries")
    .update({ priority })
    .eq("id", queueEntryId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/queue-board");
  return { success: true, error: null };
}

export async function assignRoom(
  queueEntryId: string,
  roomStation: string
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...STAFF_ROLES])) {
    return { success: false, error: "Insufficient permissions to assign rooms" };
  }

  const { error } = await auth.supabase
    .from("queue_entries")
    .update({ room_station: roomStation })
    .eq("id", queueEntryId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/queue-board");
  return { success: true, error: null };
}
