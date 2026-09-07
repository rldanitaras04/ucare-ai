import { describe, it, expect } from "vitest";
import {
  getPermissionsForRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./permissions";
import type { Permission, UserRole } from "@repo/types";

describe("getPermissionsForRole", () => {
  it("superadmin has all admin permissions", () => {
    const perms = getPermissionsForRole("superadmin");
    expect(perms).toContain("users.view");
    expect(perms).toContain("users.create");
    expect(perms).toContain("roles.manage");
    expect(perms).toContain("permissions.manage");
    expect(perms).toContain("audit_logs.view");
    expect(perms).toContain("settings.manage");
  });

  it("nurse has clinical permissions", () => {
    const perms = getPermissionsForRole("nurse");
    expect(perms).toContain("triage.create");
    expect(perms).toContain("triage.view");
    expect(perms).toContain("clinical.view");
    expect(perms).toContain("clinical.create");
  });

  it("doctor has clinical and prescription permissions", () => {
    const perms = getPermissionsForRole("doctor");
    expect(perms).toContain("clinical.view");
    expect(perms).toContain("clinical.create");
    expect(perms).toContain("prescriptions.create");
    expect(perms).toContain("prescriptions.view");
  });

  it("dentist has dental permissions", () => {
    const perms = getPermissionsForRole("dentist");
    expect(perms).toContain("dental.view");
    expect(perms).toContain("dental.create");
    expect(perms).toContain("prescriptions.create");
  });

  it("staff has registration and queue permissions", () => {
    const perms = getPermissionsForRole("staff");
    expect(perms).toContain("walk_ins.view");
    expect(perms).toContain("walk_ins.create");
    expect(perms).toContain("queue.view");
    expect(perms).not.toContain("clinical.create");
  });

  it("patient has limited self-service permissions", () => {
    const perms = getPermissionsForRole("patient");
    expect(perms).toContain("queue.view");
    expect(perms).toContain("clearances.view");
    expect(perms).not.toContain("clinical.create");
    expect(perms).not.toContain("users.view");
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
