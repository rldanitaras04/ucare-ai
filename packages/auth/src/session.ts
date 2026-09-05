import type { AuthUser, UserRole, Permission } from "@repo/types";
import { getPermissionsForRole } from "./permissions";

export function createAuthUser(params: {
  id: string;
  email: string;
  role: UserRole;
}): AuthUser {
  return {
    id: params.id,
    email: params.email,
    role: params.role,
    permissions: getPermissionsForRole(params.role),
  };
}

export function parseUserRole(role: string): UserRole {
  const validRoles: UserRole[] = [
    "super_admin",
    "admin",
    "staff",
    "user",
    "clinic_admin",
    "nurse",
    "clinic_staff",
    "doctor",
    "dentist",
    "patient",
  ];
  if (validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }
  return "user";
}
