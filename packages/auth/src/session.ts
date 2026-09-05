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
  const validRoles = ["super_admin", "admin", "staff", "user"];
  if (validRoles.includes(role)) {
    return role as UserRole;
  }
  return "user";
}
