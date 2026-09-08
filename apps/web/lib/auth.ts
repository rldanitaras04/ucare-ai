import { createServerClient } from "@repo/supabase/server";

export type UserRole = "superadmin" | "nurse" | "doctor" | "dentist" | "staff" | "patient";

export interface AuthContext {
  supabase: Awaited<ReturnType<typeof createServerClient>>;
  user: { id: string; email: string };
  roleNames: string[];
}

/**
 * Get authenticated user and their roles from the database.
 * Queries the `user_roles` table instead of trusting `user_metadata.role`.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: rolesRaw } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id);

  const roleNames = ((rolesRaw ?? []) as { roles: { name: string } | null }[])
    .map((r) => r.roles?.name)
    .filter(Boolean) as string[];

  return {
    supabase,
    user: { id: user.id, email: user.email ?? "" },
    roleNames,
  };
}

/**
 * Check if the user has at least one of the required roles.
 */
export function hasRole(auth: AuthContext, roles: readonly string[]): boolean {
  return auth.roleNames.some((r) => (roles as string[]).includes(r));
}

/**
 * Check if the user has all of the required roles.
 */
export function hasAllRoles(auth: AuthContext, roles: readonly string[]): boolean {
  return roles.every((r) => auth.roleNames.includes(r));
}

/**
 * Check if the user is a superadmin.
 */
export function isSuperAdmin(auth: AuthContext): boolean {
  return auth.roleNames.includes("superadmin");
}

/**
 * Check if the user is clinical staff (doctor, dentist, nurse).
 */
export function isClinical(auth: AuthContext): boolean {
  return hasRole(auth, ["superadmin", "doctor", "dentist", "nurse"]);
}

/**
 * Check if the user is any staff (not patient).
 */
export function isStaff(auth: AuthContext): boolean {
  return hasRole(auth, ["superadmin", "doctor", "dentist", "nurse", "staff"]);
}

/**
 * Check if the user is a patient.
 */
export function isPatient(auth: AuthContext): boolean {
  return auth.roleNames.includes("patient");
}

/**
 * Throw an error if the user doesn't have the required roles.
 */
export function requireRoles(auth: AuthContext, roles: UserRole[]): void {
  if (!hasRole(auth, roles)) {
    throw new Error("Insufficient permissions");
  }
}

/**
 * Get the patient profile ID for the authenticated user.
 */
export async function getPatientProfileId(auth: AuthContext): Promise<string | null> {
  const { data: profile } = await auth.supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  return (profile as { id: string } | null)?.id ?? null;
}
