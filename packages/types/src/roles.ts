import type { UserRole } from "./auth";

export interface Role {
  id: string;
  name: UserRole;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  created_at: string;
}

export interface UserRoleAssignment {
  user_id: string;
  role_id: string;
  created_at: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  created_at: string;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 0,
  admin: 1,
  clinic_admin: 2,
  nurse: 3,
  doctor: 3,
  dentist: 3,
  staff: 4,
  clinic_staff: 4,
  user: 5,
  patient: 5,
} as const;

export const DEFAULT_ROLE: UserRole = "user";

// ─── Clinic Role Constants ─────────────────────────────────────────────────

/** All clinic-specific role names seeded by migration 00008. */
export const CLINIC_ROLES = [
  "clinic_admin",
  "nurse",
  "clinic_staff",
  "doctor",
  "dentist",
  "patient",
] as const;

export type ClinicRole = (typeof CLINIC_ROLES)[number];

/** Granular permission names for clinic operations. */
export const CLINIC_PERMISSIONS = [
  // Walk-ins
  "walk_ins.view",
  "walk_ins.create",
  "walk_ins.update",
  // Queue
  "queue.view",
  "queue.manage",
  "queue.call",
  // Triage
  "triage.create",
  "triage.view",
  "triage.fallback_override",
  // Staff duty
  "staff_duty.view",
  "staff_duty.manage",
  // Clinical
  "clinical.view",
  "clinical.create",
  // Dental
  "dental.view",
  "dental.create",
  // Prescriptions
  "prescriptions.create",
  "prescriptions.view",
  // Clearances
  "clearances.create",
  "clearances.view",
  "clearances.approve",
] as const;

export type ClinicPermission = (typeof CLINIC_PERMISSIONS)[number];

/**
 * Role → Permission mapping for clinic operations.
 * Used for client-side permission checks (supplemented by RLS in production).
 */
export const CLINIC_ROLE_PERMISSIONS: Record<ClinicRole, readonly ClinicPermission[]> = {
  clinic_admin: CLINIC_PERMISSIONS, // all clinic permissions
  nurse: [
    "triage.create",
    "triage.view",
    "walk_ins.view",
    "walk_ins.update",
    "queue.view",
    "clinical.view",
    "clinical.create",
    "prescriptions.view",
    "clearances.view",
    "clearances.create",
    "staff_duty.view",
  ],
  clinic_staff: [
    "walk_ins.view",
    "walk_ins.create",
    "walk_ins.update",
    "queue.view",
    "queue.manage",
    "queue.call",
    "triage.create",
    "triage.view",
    "triage.fallback_override",
    "staff_duty.view",
    "clearances.view",
  ],
  doctor: [
    "walk_ins.view",
    "queue.view",
    "triage.view",
    "clinical.view",
    "clinical.create",
    "prescriptions.create",
    "prescriptions.view",
    "clearances.view",
    "clearances.approve",
  ],
  dentist: [
    "walk_ins.view",
    "queue.view",
    "dental.view",
    "dental.create",
    "prescriptions.create",
    "prescriptions.view",
    "clearances.view",
    "clearances.approve",
  ],
  patient: [
    "walk_ins.view",
    "queue.view",
    "triage.view",
    "clearances.create",
    "clearances.view",
  ],
};
