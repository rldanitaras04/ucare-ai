import type { Permission, UserRole } from "@repo/types";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
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
  ],
  admin: [
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "roles.view",
    "permissions.view",
    "audit_logs.view",
  ],
  staff: [
    "users.view",
    "audit_logs.view",
  ],
  user: [],

  // ── Clinic roles ───────────────────────────────────────────────────────
  clinic_admin: [
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
    "dental.view",
    "dental.create",
    "prescriptions.create",
    "prescriptions.view",
    "clearances.create",
    "clearances.view",
    "clearances.approve",
  ],
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

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(userPermissions: Permission[], permission: Permission): boolean {
  return userPermissions.includes(permission);
}

export function hasAnyPermission(
  userPermissions: Permission[],
  permissions: Permission[]
): boolean {
  return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(
  userPermissions: Permission[],
  permissions: Permission[]
): boolean {
  return permissions.every((p) => userPermissions.includes(p));
}
