import { describe, it, expect } from "vitest";
import {
  isRoleHigherOrEqual,
  isSuperAdmin,
  isAdmin,
  isStaff,
  isUser,
  canAccessAdminPanel,
} from "./roles";
import type { UserRole } from "@repo/types";

describe("isRoleHigherOrEqual", () => {
  it("super_admin >= all roles", () => {
    const roles: UserRole[] = [
      "super_admin", "admin", "clinic_admin", "nurse", "doctor",
      "dentist", "staff", "clinic_staff", "user", "patient",
    ];
    for (const role of roles) {
      expect(isRoleHigherOrEqual("super_admin", role)).toBe(true);
    }
  });

  it("admin >= admin and below", () => {
    expect(isRoleHigherOrEqual("admin", "admin")).toBe(true);
    expect(isRoleHigherOrEqual("admin", "clinic_admin")).toBe(true);
    expect(isRoleHigherOrEqual("admin", "nurse")).toBe(true);
    expect(isRoleHigherOrEqual("admin", "doctor")).toBe(true);
    expect(isRoleHigherOrEqual("admin", "dentist")).toBe(true);
    expect(isRoleHigherOrEqual("admin", "staff")).toBe(true);
    expect(isRoleHigherOrEqual("admin", "clinic_staff")).toBe(true);
    expect(isRoleHigherOrEqual("admin", "user")).toBe(true);
    expect(isRoleHigherOrEqual("admin", "patient")).toBe(true);
  });

  it("admin < super_admin", () => {
    expect(isRoleHigherOrEqual("admin", "super_admin")).toBe(false);
  });

  it("nurse >= nurse and below", () => {
    expect(isRoleHigherOrEqual("nurse", "nurse")).toBe(true);
    expect(isRoleHigherOrEqual("nurse", "staff")).toBe(true);
    expect(isRoleHigherOrEqual("nurse", "user")).toBe(true);
  });

  it("nurse < admin", () => {
    expect(isRoleHigherOrEqual("nurse", "admin")).toBe(false);
  });

  it("same level roles are equal", () => {
    expect(isRoleHigherOrEqual("nurse", "doctor")).toBe(true);
    expect(isRoleHigherOrEqual("doctor", "nurse")).toBe(true);
    expect(isRoleHigherOrEqual("doctor", "dentist")).toBe(true);
    expect(isRoleHigherOrEqual("staff", "clinic_staff")).toBe(true);
    expect(isRoleHigherOrEqual("user", "patient")).toBe(true);
  });

  it("user < staff", () => {
    expect(isRoleHigherOrEqual("user", "staff")).toBe(false);
    expect(isRoleHigherOrEqual("patient", "clinic_staff")).toBe(false);
  });
});

describe("isSuperAdmin", () => {
  it("returns true for super_admin", () => {
    expect(isSuperAdmin("super_admin")).toBe(true);
  });

  it("returns false for all other roles", () => {
    const others: UserRole[] = [
      "admin", "clinic_admin", "nurse", "doctor", "dentist",
      "staff", "clinic_staff", "user", "patient",
    ];
    for (const role of others) {
      expect(isSuperAdmin(role)).toBe(false);
    }
  });
});

describe("isAdmin", () => {
  it("returns true for super_admin and admin", () => {
    expect(isAdmin("super_admin")).toBe(true);
    expect(isAdmin("admin")).toBe(true);
  });

  it("returns false for non-admin roles", () => {
    const nonAdmin: UserRole[] = [
      "clinic_admin", "nurse", "doctor", "dentist",
      "staff", "clinic_staff", "user", "patient",
    ];
    for (const role of nonAdmin) {
      expect(isAdmin(role)).toBe(false);
    }
  });
});

describe("isStaff", () => {
  it("returns true for super_admin, admin, and staff", () => {
    expect(isStaff("super_admin")).toBe(true);
    expect(isStaff("admin")).toBe(true);
    expect(isStaff("staff")).toBe(true);
  });

  it("returns false for non-staff roles", () => {
    const nonStaff: UserRole[] = [
      "clinic_admin", "nurse", "doctor", "dentist",
      "clinic_staff", "user", "patient",
    ];
    for (const role of nonStaff) {
      expect(isStaff(role)).toBe(false);
    }
  });
});

describe("isUser", () => {
  it("returns true only for user role", () => {
    expect(isUser("user")).toBe(true);
  });

  it("returns false for all other roles", () => {
    const others: UserRole[] = [
      "super_admin", "admin", "clinic_admin", "nurse", "doctor",
      "dentist", "staff", "clinic_staff", "patient",
    ];
    for (const role of others) {
      expect(isUser(role)).toBe(false);
    }
  });
});

describe("canAccessAdminPanel", () => {
  it("allows super_admin and admin", () => {
    expect(canAccessAdminPanel("super_admin")).toBe(true);
    expect(canAccessAdminPanel("admin")).toBe(true);
  });

  it("denies clinic_admin and below", () => {
    const denied: UserRole[] = [
      "clinic_admin", "nurse", "doctor", "dentist",
      "staff", "clinic_staff", "user", "patient",
    ];
    for (const role of denied) {
      expect(canAccessAdminPanel(role)).toBe(false);
    }
  });
});
