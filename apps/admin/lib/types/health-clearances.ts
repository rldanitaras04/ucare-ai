import type { Database } from "@repo/types";

export type ClearanceType = Database["public"]["Enums"]["clearance_type"];
export type ClearanceStatus = Database["public"]["Enums"]["clearance_status"];

export interface HealthClearance {
  id: string;
  clearance_number: string;
  patient_id: string;
  clearance_type: ClearanceType;
  status: ClearanceStatus;
  purpose: string | null;
  valid_from: string;
  valid_until: string | null;
  assessed_by: string | null;
  assessment_notes: string | null;
  approved_by: string | null;
  approval_date: string | null;
  denial_reason: string | null;
  requirements: Array<{
    name: string;
    completed: boolean;
    date: string | null;
  }>;
  encounter_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthClearanceWithDetails extends HealthClearance {
  patient?: {
    first_name: string;
    last_name: string;
    university_id: string;
  } | null;
  assessor?: {
    full_name: string | null;
    email: string;
  } | null;
  approver?: {
    full_name: string | null;
    email: string;
  } | null;
}

export const CLEARANCE_TYPE_LABELS: Record<ClearanceType, string> = {
  admission: "Admission",
  annual: "Annual",
  internship: "Internship/OJT",
  sports: "Sports",
  graduation: "Graduation",
  employee: "Employee",
  other: "Other",
};

export const CLEARANCE_STATUS_LABELS: Record<ClearanceStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  requires_action: "Requires Action",
  approved: "Approved",
  denied: "Denied",
  expired: "Expired",
  cancelled: "Cancelled",
};
