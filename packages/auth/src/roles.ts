import type { UserRole } from "@repo/types";
import { ROLE_HIERARCHY } from "@repo/types";

export function isRoleHigherOrEqual(role: UserRole, requiredRole: UserRole): boolean {
  const roleLevel = ROLE_HIERARCHY[role];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return roleLevel <= requiredLevel;
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}

export function isAdmin(role: UserRole): boolean {
  return role === "super_admin" || role === "admin";
}

export function isStaff(role: UserRole): boolean {
  return role === "super_admin" || role === "admin" || role === "staff";
}

export function isUser(role: UserRole): boolean {
  return role === "user";
}

export function canAccessAdminPanel(role: UserRole): boolean {
  return ROLE_HIERARCHY[role] <= ROLE_HIERARCHY.admin;
}
