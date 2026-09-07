export type ProviderType = "doctor" | "dentist";
export type SessionType = "monthly_visit" | "case_based" | "emergency";
export type ProviderSessionStatus =
  | "planned"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export interface ProviderSession {
  id: string;
  provider_profile_id: string;
  provider_type: ProviderType;
  session_type: SessionType;
  session_date: string;
  start_time: string;
  end_time: string | null;
  status: ProviderSessionStatus;
  created_at: string;
}

export interface ProviderSessionWithProvider extends ProviderSession {
  provider: {
    full_name: string | null;
    email: string;
  } | null;
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  monthly_visit: "Monthly Visit",
  case_based: "Case-Based",
  emergency: "Emergency",
};

export const SESSION_STATUS_LABELS: Record<ProviderSessionStatus, string> = {
  planned: "Planned",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};
