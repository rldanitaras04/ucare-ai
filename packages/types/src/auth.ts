export type UserRole =
  | "superadmin"
  | "nurse"
  | "staff"
  | "doctor"
  | "dentist"
  | "patient";

export type PatientPersona = "student" | "faculty" | "non_teaching_staff";

export type Permission =
  // System
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
  | "system.monitor"
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
  // Clinical (Medical)
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
  | "clearances.approve"
  // Reports
  | "reports.view"
  | "reports.export"
  // Inventory
  | "inventory.view"
  | "inventory.manage"
  // Certificates
  | "certificates.view"
  | "certificates.create"
  // Provider requests
  | "provider_requests.view"
  | "provider_requests.create"
  // Appointments
  | "appointments.view"
  | "appointments.create"
  | "appointments.manage"
  // Patient records (self-access)
  | "medical_records.view_own"
  | "dental_records.view_own";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  persona?: PatientPersona;
  permissions: Permission[];
}

export interface Session {
  user: AuthUser;
  access_token: string;
  expires_at: number;
}
