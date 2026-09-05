export type UserRole =
  | "super_admin"
  | "admin"
  | "staff"
  | "user"
  | "clinic_admin"
  | "nurse"
  | "clinic_staff"
  | "doctor"
  | "dentist"
  | "patient";

export type Permission =
  | "users.view"
  | "users.create"
  | "users.update"
  | "users.delete"
  | "roles.view"
  | "roles.manage"
  | "permissions.view"
  | "permissions.manage"
  | "audit_logs.view"
  | "settings.manage"
  // Walk-ins
  | "walk_ins.view"
  | "walk_ins.create"
  | "walk_ins.update"
  // Queue
  | "queue.view"
  | "queue.manage"
  | "queue.call"
  // Triage
  | "triage.create"
  | "triage.view"
  | "triage.fallback_override"
  // Staff duty
  | "staff_duty.view"
  | "staff_duty.manage"
  // Clinical
  | "clinical.view"
  | "clinical.create"
  // Dental
  | "dental.view"
  | "dental.create"
  // Prescriptions
  | "prescriptions.create"
  | "prescriptions.view"
  // Clearances
  | "clearances.create"
  | "clearances.view"
  | "clearances.approve";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

export interface Session {
  user: AuthUser;
  access_token: string;
  expires_at: number;
}
