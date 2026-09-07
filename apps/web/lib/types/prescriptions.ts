import type { Database } from "@repo/types";

export type PrescriptionStatus = Database["public"]["Enums"]["prescription_status"];
export type PrescriptionType = Database["public"]["Enums"]["prescription_type"];
export type MedicationRoute = Database["public"]["Enums"]["medication_route"];
export type MedicationFrequency = Database["public"]["Enums"]["medication_frequency"];

export interface Prescription {
  id: string;
  prescription_number: string;
  patient_id: string;
  encounter_id: string | null;
  prescriber_id: string;
  prescription_type: PrescriptionType;
  status: PrescriptionStatus;
  medication_name: string;
  medication_strength: string | null;
  dose: string;
  route: MedicationRoute;
  frequency: MedicationFrequency;
  frequency_custom: string | null;
  duration_days: number | null;
  quantity: number | null;
  instructions: string | null;
  date_prescribed: string;
  date_issued: string | null;
  date_dispensed: string | null;
  date_completed: string | null;
  signed_at: string | null;
  signed_by: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionWithDetails extends Prescription {
  patient?: {
    first_name: string;
    last_name: string;
    university_id: string;
  } | null;
  prescriber?: {
    full_name: string | null;
    email: string;
  } | null;
}

export const STATUS_LABELS: Record<PrescriptionStatus, string> = {
  draft: "Draft",
  signed: "Signed",
  issued: "Issued",
  dispensed: "Dispensed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ROUTE_LABELS: Record<MedicationRoute, string> = {
  oral: "Oral",
  topical: "Topical",
  intravenous: "IV",
  intramuscular: "IM",
  subcutaneous: "SC",
  inhalation: "Inhalation",
  rectal: "Rectal",
  ophthalmic: "Ophthalmic",
  otic: "Otic",
  nasal: "Nasal",
  sublingual: "Sublingual",
  transdermal: "Transdermal",
  other: "Other",
};

export const FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_times_daily: "Three times daily",
  four_times_daily: "Four times daily",
  every_4_hours: "Every 4 hours",
  every_6_hours: "Every 6 hours",
  every_8_hours: "Every 8 hours",
  every_12_hours: "Every 12 hours",
  as_needed: "As needed",
  at_bedtime: "At bedtime",
  with_meals: "With meals",
  other: "Other",
};
