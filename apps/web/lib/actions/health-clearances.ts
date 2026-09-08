"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import { getAuthContext, hasRole } from "@/lib/auth";
import { createDocumentVerification } from "./verification";
import type {
  ClearanceType,
  ClearanceStatus,
  HealthClearance,
  HealthClearanceWithDetails,
} from "@/lib/types/health-clearances";

const CLEARANCE_ROLES = ["superadmin", "nurse", "doctor", "dentist"];
const VIEWER_ROLES = ["superadmin", "nurse", "staff"];
const APPROVER_ROLES = ["superadmin", "nurse"];

function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export type { ClearanceType, ClearanceStatus, HealthClearance, HealthClearanceWithDetails };

export async function getHealthClearances(): Promise<{
  data: HealthClearanceWithDetails[] | null;
  error: string | null;
}> {
  const auth = await getAuthContext();
  if (!hasRole(auth, VIEWER_ROLES)) {
    return { data: null, error: "Insufficient permissions to view health clearances" };
  }
  const supabase = auth.supabase;

  const { data, error } = await supabase
    .from("health_clearances")
    .select(`
      *,
      patient:patient_profiles(first_name, last_name, university_id),
      assessor:assessed_by(full_name, email),
      approver:approved_by(full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const result: HealthClearanceWithDetails[] = (data ?? []).map((record) => {
    const { patient, assessor, approver, ...rest } = record as Record<string, unknown> & {
      patient: { first_name: string; last_name: string; university_id: string } | null;
      assessor: { full_name: string | null; email: string } | null;
      approver: { full_name: string | null; email: string } | null;
    };
    return {
      ...(rest as unknown as HealthClearance),
      patient: patient ?? null,
      assessor: assessor ?? null,
      approver: approver ?? null,
    };
  });

  return { data: result, error: null };
}

export async function getHealthClearanceById(
  clearanceId: string
): Promise<{ data: HealthClearanceWithDetails | null; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, VIEWER_ROLES)) {
    return { data: null, error: "Insufficient permissions to view clearance" };
  }

  const { data, error } = await auth.supabase
    .from("health_clearances")
    .select(`
      *,
      patient:patient_profiles(first_name, last_name, university_id),
      assessor:assessed_by(full_name, email),
      approver:approved_by(full_name, email)
    `)
    .eq("id", clearanceId)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Clearance not found" };
  }

  const { patient, assessor, approver, ...rest } = data as Record<string, unknown> & {
    patient: { first_name: string; last_name: string; university_id: string } | null;
    assessor: { full_name: string | null; email: string } | null;
    approver: { full_name: string | null; email: string } | null;
  };

  return {
    data: {
      ...(rest as unknown as HealthClearance),
      patient: patient ?? null,
      assessor: assessor ?? null,
      approver: approver ?? null,
    },
    error: null,
  };
}

export async function createHealthClearance(clearance: {
  patient_id: string;
  clearance_type: ClearanceType;
  purpose?: string;
  valid_from?: string;
  valid_until?: string;
  requirements?: Array<{ name: string; completed: boolean; date: string | null }>;
}): Promise<{ data: HealthClearance | null; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, CLEARANCE_ROLES)) {
    return { data: null, error: "Insufficient permissions to create health clearances" };
  }

  // Validate patient exists
  const { data: patient } = await auth.supabase
    .from("patient_profiles")
    .select("id")
    .eq("id", clearance.patient_id)
    .maybeSingle();
  if (!patient) {
    return { data: null, error: "Invalid patient ID" };
  }

  // Generate clearance number
  const { data: numberData, error: numberError } = await auth.supabase.rpc(
    "generate_clearance_number"
  );

  if (numberError || !numberData) {
    return { data: null, error: numberError?.message ?? "Failed to generate clearance number" };
  }

  const { data, error } = await auth.supabase
    .from("health_clearances")
    .insert({
      clearance_number: numberData as string,
      patient_id: clearance.patient_id,
      clearance_type: clearance.clearance_type,
      purpose: clearance.purpose || null,
      valid_from: clearance.valid_from || new Date().toISOString().split("T")[0],
      valid_until: clearance.valid_until || null,
      requirements: clearance.requirements || [],
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/health-clearances");
  return { data: data as unknown as HealthClearance, error: null };
}

export async function updateClearanceStatus(
  clearanceId: string,
  status: ClearanceStatus,
  options?: {
    assessment_notes?: string;
    denial_reason?: string;
    valid_until?: string;
  }
): Promise<{ success: boolean; error: string | null; verification_code?: string }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, APPROVER_ROLES)) {
    return { success: false, error: "Insufficient permissions to update clearance status" };
  }

  const updateData: {
    status: ClearanceStatus;
    assessed_by?: string;
    approved_by?: string;
    approval_date?: string;
    denial_reason?: string | null;
    assessment_notes?: string;
    valid_until?: string;
  } = { status };

  if (status === "in_review") {
    updateData.assessed_by = auth.user.id;
  } else if (status === "approved") {
    updateData.approved_by = auth.user.id;
    updateData.approval_date = new Date().toISOString();
  } else if (status === "denied") {
    updateData.denial_reason = options?.denial_reason || null;
  }

  if (options?.assessment_notes) {
    updateData.assessment_notes = options.assessment_notes;
  }

  if (options?.valid_until) {
    updateData.valid_until = options.valid_until;
  }

  const { error } = await auth.supabase
    .from("health_clearances")
    .update(updateData)
    .eq("id", clearanceId);

  if (error) {
    return { success: false, error: error.message };
  }

  let verification_code: string | undefined;
  if (status === "approved") {
    const code = generateVerificationCode();
    const { success: verSuccess } = await createDocumentVerification(
      "health_clearance",
      clearanceId,
      code
    );
    if (verSuccess) verification_code = code;
  }

  revalidatePath("/health-clearances");
  return { success: true, error: null, verification_code };
}

export async function updateRequirement(
  clearanceId: string,
  requirementIndex: number,
  completed: boolean
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, VIEWER_ROLES)) {
    return { success: false, error: "Insufficient permissions to update requirements" };
  }

  // Get current requirements
  const { data: clearance } = await auth.supabase
    .from("health_clearances")
    .select("requirements")
    .eq("id", clearanceId)
    .single();

  if (!clearance) {
    return { success: false, error: "Clearance not found" };
  }

  const requirements = (clearance.requirements as Array<{
    name: string;
    completed: boolean;
    date: string | null;
  }>) || [];

  if (requirementIndex < 0 || requirementIndex >= requirements.length) {
    return { success: false, error: "Invalid requirement index" };
  }

  requirements[requirementIndex] = {
    ...requirements[requirementIndex],
    completed,
    date: completed ? new Date().toISOString().split("T")[0] : null,
  };

  const { error } = await auth.supabase
    .from("health_clearances")
    .update({ requirements })
    .eq("id", clearanceId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/health-clearances");
  return { success: true, error: null };
}
