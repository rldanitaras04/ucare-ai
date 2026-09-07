import type { UserRole, PatientPersona, Permission } from "./auth";

export interface Role {
  id: string;
  name: UserRole;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PermissionRow {
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
  superadmin: 0,
  nurse: 1,
  doctor: 2,
  dentist: 2,
  staff: 3,
  patient: 4,
} as const;

export const DEFAULT_ROLE: UserRole = "patient";

export const PATIENT_PERSONAS: PatientPersona[] = [
  "student",
  "faculty",
  "non_teaching_staff",
];

export const ALL_ROLES: UserRole[] = [
  "superadmin",
  "nurse",
  "doctor",
  "dentist",
  "staff",
  "patient",
];

export const STAFF_ROLES: UserRole[] = [
  "superadmin",
  "nurse",
  "doctor",
  "dentist",
  "staff",
];

export const CLINICAL_ROLES: UserRole[] = [
  "nurse",
  "doctor",
  "dentist",
];

export const MEDICAL_ROLES: UserRole[] = [
  "superadmin",
  "nurse",
  "doctor",
];

export const DENTAL_ROLES: UserRole[] = [
  "superadmin",
  "dentist",
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: [
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "roles.view",
    "roles.manage",
    "permissions.view",
    "permissions.manage",
    "audit_logs.view",
    "settings.manage",
    "system.monitor",
    "reports.view",
    "reports.export",
    "inventory.view",
    "inventory.manage",
    "appointments.view",
    "appointments.manage",
    "walk_ins.view",
    "queue.view",
    "triage.view",
    "clinical.view",
    "dental.view",
    "prescriptions.view",
    "clearances.view",
    "certificates.view",
    "provider_requests.view",
  ],
  nurse: [
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
    "staff_duty.manage",
    "clinical.view",
    "clinical.create",
    "prescriptions.view",
    "clearances.view",
    "clearances.create",
    "reports.view",
    "inventory.view",
    "certificates.view",
    "certificates.create",
    "appointments.view",
    "appointments.create",
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
    "certificates.view",
    "certificates.create",
    "provider_requests.view",
    "provider_requests.create",
    "appointments.view",
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
    "certificates.view",
    "certificates.create",
    "provider_requests.view",
    "provider_requests.create",
    "appointments.view",
  ],
  staff: [
    "walk_ins.view",
    "walk_ins.create",
    "walk_ins.update",
    "queue.view",
    "queue.manage",
    "queue.call",
    "staff_duty.view",
    "clearances.view",
    "appointments.view",
    "appointments.create",
    "appointments.manage",
  ],
  patient: [
    "queue.view",
    "clearances.view",
    "clearances.create",
    "certificates.view",
    "medical_records.view_own",
    "dental_records.view_own",
    "appointments.view",
    "appointments.create",
  ],
};

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
