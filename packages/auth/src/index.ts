export {
  getPermissionsForRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./permissions";

export {
  isRoleHigherOrEqual,
  isSuperAdmin,
  isAdmin,
  isStaff,
  isUser,
  canAccessAdminPanel,
} from "./roles";

export {
  requirePermission,
  requireRole,
  requireAuth,
  requireAdminAccess,
  canPerformAction,
} from "./guards";

export { createAuthUser, parseUserRole } from "./session";

export { logAuditEvent, AuditActions } from "./audit";
export type { AuditLogEntry } from "./audit";
