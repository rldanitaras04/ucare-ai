export type DutyStatus =
  | "available"
  | "unavailable"
  | "seminar"
  | "training"
  | "official_activity"
  | "on_leave";

export interface StaffAvailabilityRecord {
  id: string;
  staff_profile_id: string;
  duty_status: DutyStatus;
  notes: string | null;
  start_time: string | null;
  end_time: string | null;
  authorized_by: string | null;
  created_at: string;
}

export interface StaffMember {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

export interface StaffAvailabilityWithMember extends StaffAvailabilityRecord {
  staff: StaffMember | null;
}

export const DUTY_STATUS_LABELS: Record<DutyStatus, string> = {
  available: "Available",
  unavailable: "Unavailable",
  seminar: "Seminar",
  training: "Training",
  official_activity: "Official Activity",
  on_leave: "On Leave",
};
