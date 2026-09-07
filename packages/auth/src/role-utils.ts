import type { UserRole } from "@repo/types";

const VALID_ROLES = new Set<string>(["superadmin", "nurse", "staff", "doctor", "dentist", "patient"]);

const ROLE_MAP: Record<string, string> = {
  super_admin: "superadmin",
  admin: "superadmin",
  nurse_admin: "nurse",
  clinic_admin: "nurse",
  clinic_staff: "staff",
  user: "patient",
};

export function sanitizeRole(role: string | undefined): UserRole {
  if (!role) return "patient";
  if (VALID_ROLES.has(role)) return role as UserRole;
  return (ROLE_MAP[role] ?? "patient") as UserRole;
}
