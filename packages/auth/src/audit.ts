export interface AuditLogEntry {
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

export async function logAuditEvent(
  supabase: AnySupabaseClient,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.rpc("log_audit_event", {
      p_user_id: user?.id ?? null,
      p_action: entry.action,
      p_resource: entry.resource,
      p_resource_id: entry.resource_id ?? null,
      p_details: entry.details ? JSON.stringify(entry.details) : null,
      p_ip_address: entry.ip_address ?? null,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

export const AuditActions = {
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
  USER_ROLE_CHANGED: "user.role_changed",
  USER_ACTIVATED: "user.activated",
  USER_DEACTIVATED: "user.deactivated",
  ROLE_CREATED: "role.created",
  ROLE_UPDATED: "role.updated",
  ROLE_DELETED: "role.deleted",
  PERMISSION_ASSIGNED: "permission.assigned",
  PERMISSION_REVOKED: "permission.revoked",
  LOGIN_SUCCESS: "auth.login_success",
  LOGIN_FAILED: "auth.login_failed",
  LOGOUT: "auth.logout",
  PASSWORD_CHANGED: "auth.password_changed",
  SETTINGS_UPDATED: "settings.updated",
} as const;
