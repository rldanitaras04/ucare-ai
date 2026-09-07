import type { Permission, UserRole } from "@repo/types";
import { ROLE_PERMISSIONS } from "@repo/types";

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
