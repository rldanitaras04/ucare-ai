import { describe, it, expect } from "vitest";
import {
  requirePermission,
  requireRole,
  requireAuth,
  requireAdminAccess,
  canPerformAction,
} from "./guards";
import type { AuthUser, UserRole, Permission } from "@repo/types";

function makeUser(role: UserRole, permissions: Permission[] = []): AuthUser {
  return {
    id: "test-user-id",
    email: "test@example.com",
    role,
    permissions,
  };
}

describe("requirePermission", () => {
  it("authorizes when permission present", () => {
    const result = requirePermission(["users.view"], "users.view");
    expect(result.authorized).toBe(true);
  });

  it("rejects when permission missing", () => {
    const result = requirePermission([], "users.view");
    expect(result.authorized).toBe(false);
    expect(result.reason).toContain("users.view");
  });
});

describe("requireRole", () => {
  it("authorizes when role is sufficient", () => {
    const result = requireRole("admin", "staff");
    expect(result.authorized).toBe(true);
  });

  it("rejects when role is insufficient", () => {
    const result = requireRole("user", "admin");
    expect(result.authorized).toBe(false);
    expect(result.reason).toContain("admin");
  });

  it("authorizes same-level role", () => {
    const result = requireRole("nurse", "nurse");
    expect(result.authorized).toBe(true);
  });
});

describe("requireAuth", () => {
  it("authorizes when user exists", () => {
    const user = makeUser("admin");
    const result = requireAuth(user);
    expect(result.authorized).toBe(true);
  });

  it("rejects when user is null", () => {
    const result = requireAuth(null);
    expect(result.authorized).toBe(false);
    expect(result.reason).toContain("Authentication required");
  });
});

describe("requireAdminAccess", () => {
  it("authorizes admin", () => {
    const user = makeUser("admin");
    const result = requireAdminAccess(user);
    expect(result.authorized).toBe(true);
  });

  it("authorizes super_admin", () => {
    const user = makeUser("super_admin");
    const result = requireAdminAccess(user);
    expect(result.authorized).toBe(true);
  });

  it("rejects clinic_admin", () => {
    const user = makeUser("clinic_admin");
    const result = requireAdminAccess(user);
    expect(result.authorized).toBe(false);
  });

  it("rejects staff", () => {
    const user = makeUser("staff");
    const result = requireAdminAccess(user);
    expect(result.authorized).toBe(false);
  });

  it("rejects null user", () => {
    const result = requireAdminAccess(null);
    expect(result.authorized).toBe(false);
  });
});

describe("canPerformAction", () => {
  it("authorizes with matching permission", () => {
    const user = makeUser("admin", ["users.view"]);
    const result = canPerformAction(user, { permission: "users.view" });
    expect(result.authorized).toBe(true);
  });

  it("rejects without matching permission", () => {
    const user = makeUser("admin", []);
    const result = canPerformAction(user, { permission: "users.view" });
    expect(result.authorized).toBe(false);
  });

  it("authorizes with sufficient role", () => {
    const user = makeUser("admin");
    const result = canPerformAction(user, { role: "staff" });
    expect(result.authorized).toBe(true);
  });

  it("rejects with insufficient role", () => {
    const user = makeUser("user");
    const result = canPerformAction(user, { role: "admin" });
    expect(result.authorized).toBe(false);
  });

  it("rejects null user", () => {
    const result = canPerformAction(null, { role: "user" });
    expect(result.authorized).toBe(false);
  });

  it("requires both permission and role when both specified", () => {
    const user = makeUser("admin", ["users.view"]);
    const result = canPerformAction(user, {
      permission: "users.view",
      role: "staff",
    });
    expect(result.authorized).toBe(true);
  });

  it("rejects if permission missing even with sufficient role", () => {
    const user = makeUser("admin", []);
    const result = canPerformAction(user, {
      permission: "users.view",
      role: "staff",
    });
    expect(result.authorized).toBe(false);
  });
});
