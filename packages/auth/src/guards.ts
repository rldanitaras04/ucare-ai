import type { Permission, UserRole, AuthUser } from "@repo/types";
import { hasPermission } from "./permissions";
import { isRoleHigherOrEqual } from "./roles";

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
}

export function requirePermission(
  userPermissions: Permission[],
  permission: Permission
): AuthorizationResult {
  if (hasPermission(userPermissions, permission)) {
    return { authorized: true };
  }
  return {
    authorized: false,
    reason: `Missing permission: ${permission}`,
  };
}

export function requireRole(
  userRole: UserRole,
  requiredRole: UserRole
): AuthorizationResult {
  if (isRoleHigherOrEqual(userRole, requiredRole)) {
    return { authorized: true };
  }
  return {
    authorized: false,
    reason: `Required role: ${requiredRole}, current role: ${userRole}`,
  };
}

export function requireAuth(user: AuthUser | null): AuthorizationResult {
  if (!user) {
    return {
      authorized: false,
      reason: "Authentication required",
    };
  }
  return { authorized: true };
}

export function requireAdminAccess(user: AuthUser | null): AuthorizationResult {
  const authResult = requireAuth(user);
  if (!authResult.authorized) return authResult;

  if (!isRoleHigherOrEqual(user!.role, "nurse")) {
    return {
      authorized: false,
      reason: "Admin access required",
    };
  }

  return { authorized: true };
}

export function canPerformAction(
  user: AuthUser | null,
  options: {
    permission?: Permission;
    role?: UserRole;
  }
): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: "Authentication required" };
  }

  if (options.permission && !hasPermission(user.permissions, options.permission)) {
    return { authorized: false, reason: `Missing permission: ${options.permission}` };
  }

  if (options.role && !isRoleHigherOrEqual(user.role, options.role)) {
    return { authorized: false, reason: `Required role: ${options.role}` };
  }

  return { authorized: true };
}
