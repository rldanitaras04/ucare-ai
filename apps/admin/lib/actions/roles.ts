"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import { logAuditEvent, AuditActions } from "@repo/auth";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  created_at: string;
}

export async function getRoles(): Promise<{ data: Role[] | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: roles, error } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: roles, error: null };
}

export async function getPermissions(): Promise<{ data: Permission[] | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: permissions, error } = await supabase
    .from("permissions")
    .select("*")
    .order("resource")
    .order("action");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: permissions, error: null };
}

export async function getRolePermissions(roleId: string): Promise<{ data: string[] | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: rolePermissions, error } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: rolePermissions.map((rp) => rp.permission_id), error: null };
}

export async function createRole(data: { name: string; description?: string }): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("roles")
    .insert({ name: data.name, description: data.description });

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent(supabase, {
    action: AuditActions.ROLE_CREATED,
    resource: "roles",
    details: { name: data.name },
  });

  revalidatePath("/roles");
  return { success: true, error: null };
}

export async function updateRole(roleId: string, data: { name?: string; description?: string }): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("roles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", roleId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent(supabase, {
    action: AuditActions.ROLE_UPDATED,
    resource: "roles",
    resource_id: roleId,
    details: data,
  });

  revalidatePath("/roles");
  return { success: true, error: null };
}

export async function assignPermissionToRole(roleId: string, permissionId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("role_permissions")
    .insert({ role_id: roleId, permission_id: permissionId });

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent(supabase, {
    action: AuditActions.PERMISSION_ASSIGNED,
    resource: "role_permissions",
    details: { role_id: roleId, permission_id: permissionId },
  });

  revalidatePath("/roles");
  return { success: true, error: null };
}

export async function removePermissionFromRole(roleId: string, permissionId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId)
    .eq("permission_id", permissionId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent(supabase, {
    action: AuditActions.PERMISSION_REVOKED,
    resource: "role_permissions",
    details: { role_id: roleId, permission_id: permissionId },
  });

  revalidatePath("/roles");
  return { success: true, error: null };
}
