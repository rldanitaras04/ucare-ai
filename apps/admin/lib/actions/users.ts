"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import { logAuditEvent, AuditActions } from "@repo/auth";

export interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export async function getUsers(): Promise<{ data: UserWithProfile[] | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, roles(name)");

  const rolesByUser: Record<string, string[]> = {};
  (userRoles ?? []).forEach((ur: { user_id: string; roles: { name: string } | null }) => {
    if (ur.roles?.name) {
      if (!rolesByUser[ur.user_id]) rolesByUser[ur.user_id] = [];
      rolesByUser[ur.user_id].push(ur.roles.name);
    }
  });

  const enriched = (profiles ?? []).map((p) => ({
    ...p,
    roles: rolesByUser[p.id] ?? [p.role],
  }));

  return { data: enriched, error: null };
}

export async function getUserById(userId: string): Promise<{ data: UserWithProfile | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId);

  const roles = (userRoles ?? [])
    .map((ur: { roles: { name: string } | null }) => ur.roles?.name)
    .filter(Boolean) as string[];

  return { data: { ...profile, roles: roles.length > 0 ? roles : [profile.role] }, error: null };
}

export async function updateUserRole(userId: string, newRole: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["super_admin", "admin"].includes(callerRole)) {
    return { success: false, error: "Insufficient permissions to change user roles" };
  }

  if (userId === user.id) {
    return { success: false, error: "You cannot change your own role" };
  }

  const { data: roleRecord, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", newRole)
    .single();

  if (roleError || !roleRecord) {
    return { success: false, error: `Invalid role: ${newRole}` };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  const { error: deleteError } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  const { error: insertError } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role_id: roleRecord.id });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  await logAuditEvent(supabase, {
    action: AuditActions.USER_ROLE_CHANGED,
    resource: "profiles",
    resource_id: userId,
    details: { new_role: newRole },
  });

  revalidatePath("/users");
  return { success: true, error: null };
}

export async function toggleUserRole(userId: string, roleName: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["super_admin", "admin"].includes(callerRole)) {
    return { success: false, error: "Insufficient permissions to change user roles" };
  }

  if (userId === user.id) {
    return { success: false, error: "You cannot change your own roles" };
  }

  const { data: roleRecord, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (roleError || !roleRecord) {
    return { success: false, error: `Invalid role: ${roleName}` };
  }

  const { data: existing } = await supabase
    .from("user_roles")
    .select("user_id, role_id")
    .eq("user_id", userId)
    .eq("role_id", roleRecord.id)
    .maybeSingle();

  if (existing) {
    const { count } = await supabase
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("user_id", userId);

    if ((count ?? 0) <= 1) {
      return { success: false, error: "Cannot remove the last role. User must have at least one role." };
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role_id", roleRecord.id);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role_id: roleRecord.id });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  const { data: currentRoles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId);

  const roleNames = (currentRoles ?? [])
    .map((ur: { roles: { name: string } | null }) => ur.roles?.name)
    .filter(Boolean) as string[];

  if (roleNames.length > 0) {
    await supabase
      .from("profiles")
      .update({ role: roleNames[0], updated_at: new Date().toISOString() })
      .eq("id", userId);
  }

  await logAuditEvent(supabase, {
    action: AuditActions.USER_ROLE_CHANGED,
    resource: "profiles",
    resource_id: userId,
    details: { action: existing ? "removed_role" : "added_role", role: roleName, current_roles: roleNames },
  });

  revalidatePath("/users");
  return { success: true, error: null };
}

export async function updateUserProfile(userId: string, data: { full_name?: string }): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const callerRole = user.user_metadata?.role as string | undefined;
  const isOwnProfile = userId === user.id;
  const hasAdminAccess = callerRole && ["super_admin", "admin"].includes(callerRole);

  if (!isOwnProfile && !hasAdminAccess) {
    return { success: false, error: "You can only edit your own profile" };
  }

  const allowedFields: { full_name?: string } = {};
  if (data.full_name !== undefined) {
    allowedFields.full_name = data.full_name;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ...allowedFields, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent(supabase, {
    action: AuditActions.USER_UPDATED,
    resource: "profiles",
    resource_id: userId,
    details: allowedFields,
  });

  revalidatePath("/users");
  return { success: true, error: null };
}

export async function searchUsers(query: string): Promise<{ data: UserWithProfile[] | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, roles(name)");

  const rolesByUser: Record<string, string[]> = {};
  (userRoles ?? []).forEach((ur: { user_id: string; roles: { name: string } | null }) => {
    if (ur.roles?.name) {
      if (!rolesByUser[ur.user_id]) rolesByUser[ur.user_id] = [];
      rolesByUser[ur.user_id].push(ur.roles.name);
    }
  });

  const enriched = (profiles ?? []).map((p) => ({
    ...p,
    roles: rolesByUser[p.id] ?? [p.role],
  }));

  return { data: enriched, error: null };
}

export async function getAllRoles(): Promise<{ data: Array<{ id: string; name: string; description: string | null }> | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("roles")
    .select("id, name, description")
    .order("name");

  return { data: data ?? [], error: error?.message ?? null };
}
