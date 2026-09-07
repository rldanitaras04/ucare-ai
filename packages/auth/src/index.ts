export {
  getPermissionsForRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./permissions";

export {
  isRoleHigherOrEqual,
  isSuperAdmin,
  isNurse,
  isClinical,
  isMedical,
  isDental,
  isStaff,
  isPatient,
  canAccessAdminPanel,
  canAccessClinical,
} from "./roles";

export {
  requirePermission,
  requireRole,
  requireAuth,
  requireAdminAccess,
  canPerformAction,
} from "./guards";

export { createAuthUser, parseUserRole, parsePatientPersona } from "./session";

export { sanitizeRole } from "./role-utils";

export { logAuditEvent, AuditActions } from "./audit";
export type { AuditLogEntry } from "./audit";
