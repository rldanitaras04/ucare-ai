import type { AuthUser, UserRole, PatientPersona, Permission } from "@repo/types";
import { getPermissionsForRole } from "./permissions";
import { ALL_ROLES, PATIENT_PERSONAS } from "@repo/types";

export function createAuthUser(params: {
  id: string;
  email: string;
  role: UserRole;
  persona?: PatientPersona;
}): AuthUser {
  return {
    id: params.id,
    email: params.email,
    role: params.role,
    persona: params.persona,
    permissions: getPermissionsForRole(params.role),
  };
}

export function parseUserRole(role: string): UserRole {
  if (ALL_ROLES.includes(role as UserRole)) {
    return role as UserRole;
  }
  return "patient";
}

export function parsePatientPersona(persona: string | undefined): PatientPersona | undefined {
  if (persona && PATIENT_PERSONAS.includes(persona as PatientPersona)) {
    return persona as PatientPersona;
  }
  return undefined;
}
