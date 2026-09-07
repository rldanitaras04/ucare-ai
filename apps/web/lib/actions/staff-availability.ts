"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import type {
  DutyStatus,
  StaffAvailabilityRecord,
  StaffMember,
  StaffAvailabilityWithMember,
} from "@/lib/types/staff-availability";

const ADMIN_ROLES = ["superadmin", "nurse"];

export type {
  DutyStatus,
  StaffAvailabilityRecord,
  StaffMember,
  StaffAvailabilityWithMember,
};

export async function getStaffAvailability(): Promise<{
  data: StaffAvailabilityWithMember[] | null;
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
  if (!callerRole || !["superadmin", "nurse", "staff", "doctor", "dentist"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions to view staff availability" };
  }

  const { data, error } = await supabase
    .from("staff_availability")
    .select("*, profiles:staff_profile_id(id, full_name, email, role)")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const result: StaffAvailabilityWithMember[] = (data ?? []).map(
    (record) => {
      const { profiles, ...rest } = record as Record<string, unknown> & {
        profiles: StaffMember | null;
      };
      return {
        ...(rest as Omit<StaffAvailabilityRecord, "staff">),
        staff: profiles ?? null,
      };
    }
  );

  return { data: result, error: null };
}

export async function getAvailableStaff(): Promise<{
  data: StaffMember[] | null;
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
  if (!callerRole || !["superadmin", "nurse", "staff", "doctor", "dentist"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions to view available staff" };
  }

  // Get profiles that are clinic staff (nurse, doctor, dentist, staff)
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["nurse", "doctor", "dentist", "staff"])
    .order("full_name");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

export async function recordDutyStatus(
  staffProfileId: string,
  dutyStatus: DutyStatus,
  notes?: string,
  startTime?: string,
  endTime?: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !ADMIN_ROLES.includes(callerRole)) {
    return { success: false, error: "Insufficient permissions to record duty status" };
  }

  const { error } = await supabase.from("staff_availability").insert({
    staff_profile_id: staffProfileId,
    duty_status: dutyStatus,
    notes: notes?.trim() || null,
    start_time: startTime || null,
    end_time: endTime || null,
    authorized_by: user.id,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/staff-availability");
  return { success: true, error: null };
}

export async function updateDutyStatus(
  recordId: string,
  dutyStatus: DutyStatus,
  notes?: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !ADMIN_ROLES.includes(callerRole)) {
    return { success: false, error: "Insufficient permissions to update duty status" };
  }

  const { error } = await supabase
    .from("staff_availability")
    .update({
      duty_status: dutyStatus,
      notes: notes?.trim() || null,
    })
    .eq("id", recordId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/staff-availability");
  return { success: true, error: null };
}

export async function getCurrentAvailability(): Promise<{
  data: Record<string, DutyStatus> | null;
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
  if (!callerRole || !["superadmin", "nurse", "staff", "doctor", "dentist"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions to view current availability" };
  }

  // Get the latest availability record for each staff member
  const { data: recent, error } = await supabase
    .from("staff_availability")
    .select("staff_profile_id, duty_status")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { data: null, error: error.message };
  }

  const availability: Record<string, DutyStatus> = {};
  for (const record of recent ?? []) {
    if (!availability[record.staff_profile_id]) {
      availability[record.staff_profile_id] = record.duty_status as DutyStatus;
    }
  }

  return { data: availability, error: null };
}
