import { describe, it, expect } from "vitest";
import {
  getPermissionsForRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./permissions";
import type { Permission, UserRole } from "@repo/types";

describe("getPermissionsForRole", () => {
  it("super_admin has all admin permissions", () => {
    const perms = getPermissionsForRole("super_admin");
    expect(perms).toContain("users.view");
    expect(perms).toContain("users.create");
    expect(perms).toContain("roles.manage");
    expect(perms).toContain("permissions.manage");
    expect(perms).toContain("audit_logs.view");
    expect(perms).toContain("settings.manage");
  });

  it("admin has user and role permissions", () => {
    const perms = getPermissionsForRole("admin");
    expect(perms).toContain("users.view");
    expect(perms).toContain("users.create");
    expect(perms).toContain("roles.view");
    expect(perms).toContain("audit_logs.view");
    expect(perms).not.toContain("roles.manage");
    expect(perms).not.toContain("settings.manage");
  });

  it("user has no permissions", () => {
    expect(getPermissionsForRole("user")).toEqual([]);
  });

  it("nurse has clinical permissions", () => {
    const perms = getPermissionsForRole("nurse");
    expect(perms).toContain("triage.create");
    expect(perms).toContain("triage.view");
    expect(perms).toContain("clinical.view");
    expect(perms).toContain("clinical.create");
  });

  it("dentist has dental permissions", () => {
    const perms = getPermissionsForRole("dentist");
    expect(perms).toContain("dental.view");
    expect(perms).toContain("dental.create");
    expect(perms).toContain("prescriptions.create");
  });

  it("patient has limited permissions", () => {
    const perms = getPermissionsForRole("patient");
    expect(perms).toContain("walk_ins.view");
    expect(perms).toContain("queue.view");
    expect(perms).not.toContain("clinical.create");
  });
});

describe("hasPermission", () => {
  it("returns true when permission exists", () => {
    const perms: Permission[] = ["users.view", "users.create"];
    expect(hasPermission(perms, "users.view")).toBe(true);
  });

  it("returns false when permission missing", () => {
    const perms: Permission[] = ["users.view"];
    expect(hasPermission(perms, "users.create")).toBe(false);
  });

  it("returns false for empty permissions", () => {
    expect(hasPermission([], "users.view")).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("returns true when at least one permission matches", () => {
    const perms: Permission[] = ["users.view"];
    expect(hasAnyPermission(perms, ["users.view", "users.create"])).toBe(true);
  });

  it("returns false when no permissions match", () => {
    const perms: Permission[] = ["users.view"];
    expect(hasAnyPermission(perms, ["users.create", "roles.manage"])).toBe(false);
  });

  it("returns false for empty arrays", () => {
    expect(hasAnyPermission([], ["users.view"])).toBe(false);
    expect(hasAnyPermission(["users.view"], [])).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("returns true when all permissions match", () => {
    const perms: Permission[] = ["users.view", "users.create", "users.update"];
    expect(hasAllPermissions(perms, ["users.view", "users.create"])).toBe(true);
  });

  it("returns false when some permissions missing", () => {
    const perms: Permission[] = ["users.view"];
    expect(hasAllPermissions(perms, ["users.view", "users.create"])).toBe(false);
  });

  it("returns true for empty required permissions", () => {
    expect(hasAllPermissions(["users.view"], [])).toBe(true);
  });
});
