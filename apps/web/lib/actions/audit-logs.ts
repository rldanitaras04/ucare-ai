"use server";

import { createServerClient } from "@repo/supabase/server";
import { getAuthContext, hasRole } from "@/lib/auth";
import type { Json } from "@repo/types";

const ADMIN_ROLES = ["superadmin", "nurse"] as const;

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  details: Json;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  action?: string;
  resource?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

export async function getAuditLogs(
  filters?: AuditLogFilters,
  limit = 50,
  offset = 0
): Promise<{ data: AuditLog[] | null; error: string | null; count: number | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...ADMIN_ROLES])) {
    return { data: null, error: "Insufficient permissions to view audit logs", count: 0 };
  }

  let query = auth.supabase
    .from("audit_logs")
    .select("*", { count: "exact" });

  if (filters?.action) {
    query = query.eq("action", filters.action);
  }
  if (filters?.resource) {
    query = query.eq("resource", filters.resource);
  }
  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }
  if (filters?.start_date) {
    query = query.gte("created_at", filters.start_date);
  }
  if (filters?.end_date) {
    query = query.lte("created_at", filters.end_date);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { data: null, error: error.message, count: 0 };
  }

  return { data, error: null, count };
}

export async function getAuditLogById(logId: string): Promise<{ data: AuditLog | null; error: string | null }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, [...ADMIN_ROLES])) {
    return { data: null, error: "Insufficient permissions to view audit log details" };
  }

  const { data, error } = await auth.supabase
    .from("audit_logs")
    .select("*")
    .eq("id", logId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
