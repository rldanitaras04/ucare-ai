import type { UserRole } from "@repo/types";
import { ROLE_HIERARCHY } from "@repo/types";

export function isRoleHigherOrEqual(role: UserRole, requiredRole: UserRole): boolean {
  const roleLevel = ROLE_HIERARCHY[role];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return roleLevel <= requiredLevel;
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "superadmin";
}

export function isNurse(role: UserRole): boolean {
  return role === "nurse";
}

export function isClinical(role: UserRole): boolean {
  return role === "nurse" || role === "doctor" || role === "dentist";
}

export function isMedical(role: UserRole): boolean {
  return role === "nurse" || role === "doctor";
}

export function isDental(role: UserRole): boolean {
  return role === "dentist";
}

export function isStaff(role: UserRole): boolean {
  return role === "staff";
}

export function isPatient(role: UserRole): boolean {
  return role === "patient";
}

export function canAccessAdminPanel(role: UserRole): boolean {
  return ROLE_HIERARCHY[role] <= ROLE_HIERARCHY.nurse;
}

export function canAccessClinical(role: UserRole): boolean {
  return isClinical(role) || isSuperAdmin(role);
}
