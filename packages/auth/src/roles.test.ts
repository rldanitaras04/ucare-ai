import { describe, it, expect } from "vitest";
import {
  isRoleHigherOrEqual,
  isSuperAdmin,
  isStaff,
  isPatient,
  isClinical,
  isMedical,
  isDental,
  isNurse,
  canAccessAdminPanel,
  canAccessClinical,
} from "./roles";

describe("isRoleHigherOrEqual", () => {
  it("superadmin >= all roles", () => {
    const roles: Array<"nurse" | "doctor" | "dentist" | "staff" | "patient"> = [
      "nurse", "doctor", "dentist", "staff", "patient",
    ];
    for (const role of roles) {
      expect(isRoleHigherOrEqual("superadmin", role)).toBe(true);
    }
  });

  it("superadmin >= superadmin", () => {
    expect(isRoleHigherOrEqual("superadmin", "superadmin")).toBe(true);
  });

  it("nurse >= nurse and below", () => {
    expect(isRoleHigherOrEqual("nurse", "nurse")).toBe(true);
    expect(isRoleHigherOrEqual("nurse", "doctor")).toBe(true);
    expect(isRoleHigherOrEqual("nurse", "dentist")).toBe(true);
    expect(isRoleHigherOrEqual("nurse", "staff")).toBe(true);
    expect(isRoleHigherOrEqual("nurse", "patient")).toBe(true);
  });

  it("nurse < superadmin", () => {
    expect(isRoleHigherOrEqual("nurse", "superadmin")).toBe(false);
  });

  it("doctor >= doctor and below", () => {
    expect(isRoleHigherOrEqual("doctor", "doctor")).toBe(true);
    expect(isRoleHigherOrEqual("doctor", "dentist")).toBe(true);
    expect(isRoleHigherOrEqual("doctor", "staff")).toBe(true);
    expect(isRoleHigherOrEqual("doctor", "patient")).toBe(true);
  });

  it("doctor < nurse", () => {
    expect(isRoleHigherOrEqual("doctor", "nurse")).toBe(false);
    expect(isRoleHigherOrEqual("doctor", "superadmin")).toBe(false);
  });

  it("dentist >= dentist and below", () => {
    expect(isRoleHigherOrEqual("dentist", "dentist")).toBe(true);
    expect(isRoleHigherOrEqual("dentist", "staff")).toBe(true);
    expect(isRoleHigherOrEqual("dentist", "patient")).toBe(true);
  });

  it("dentist < nurse", () => {
    expect(isRoleHigherOrEqual("dentist", "nurse")).toBe(false);
    expect(isRoleHigherOrEqual("dentist", "superadmin")).toBe(false);
  });

  it("doctor and dentist are equal level", () => {
    expect(isRoleHigherOrEqual("doctor", "dentist")).toBe(true);
    expect(isRoleHigherOrEqual("dentist", "doctor")).toBe(true);
  });

  it("staff >= patient", () => {
    expect(isRoleHigherOrEqual("staff", "staff")).toBe(true);
    expect(isRoleHigherOrEqual("staff", "patient")).toBe(true);
  });

  it("staff < doctor/dentist", () => {
    expect(isRoleHigherOrEqual("staff", "doctor")).toBe(false);
    expect(isRoleHigherOrEqual("staff", "dentist")).toBe(false);
    expect(isRoleHigherOrEqual("staff", "nurse")).toBe(false);
    expect(isRoleHigherOrEqual("staff", "superadmin")).toBe(false);
  });

  it("patient < staff", () => {
    expect(isRoleHigherOrEqual("patient", "staff")).toBe(false);
    expect(isRoleHigherOrEqual("patient", "doctor")).toBe(false);
    expect(isRoleHigherOrEqual("patient", "dentist")).toBe(false);
    expect(isRoleHigherOrEqual("patient", "nurse")).toBe(false);
    expect(isRoleHigherOrEqual("patient", "superadmin")).toBe(false);
  });

  it("patient >= patient", () => {
    expect(isRoleHigherOrEqual("patient", "patient")).toBe(true);
  });
});

describe("isSuperAdmin", () => {
  it("returns true for superadmin", () => {
    expect(isSuperAdmin("superadmin")).toBe(true);
  });

  it("returns false for all other roles", () => {
    const others: Array<"nurse" | "doctor" | "dentist" | "staff" | "patient"> = [
      "nurse", "doctor", "dentist", "staff", "patient",
    ];
    for (const role of others) {
      expect(isSuperAdmin(role)).toBe(false);
    }
  });
});

describe("isNurse", () => {
  it("returns true for nurse", () => {
    expect(isNurse("nurse")).toBe(true);
  });

  it("returns false for other roles", () => {
    const others: Array<"superadmin" | "doctor" | "dentist" | "staff" | "patient"> = [
      "superadmin", "doctor", "dentist", "staff", "patient",
    ];
    for (const role of others) {
      expect(isNurse(role)).toBe(false);
    }
  });
});

describe("isClinical", () => {
  it("returns true for nurse, doctor, dentist", () => {
    expect(isClinical("nurse")).toBe(true);
    expect(isClinical("doctor")).toBe(true);
    expect(isClinical("dentist")).toBe(true);
  });

  it("returns false for non-clinical roles", () => {
    expect(isClinical("superadmin")).toBe(false);
    expect(isClinical("staff")).toBe(false);
    expect(isClinical("patient")).toBe(false);
  });
});

describe("isMedical", () => {
  it("returns true for nurse and doctor", () => {
    expect(isMedical("nurse")).toBe(true);
    expect(isMedical("doctor")).toBe(true);
  });

  it("returns false for non-medical roles", () => {
    expect(isMedical("superadmin")).toBe(false);
    expect(isMedical("dentist")).toBe(false);
    expect(isMedical("staff")).toBe(false);
    expect(isMedical("patient")).toBe(false);
  });
});

describe("isDental", () => {
  it("returns true for dentist", () => {
    expect(isDental("dentist")).toBe(true);
  });

  it("returns false for other roles", () => {
    expect(isDental("superadmin")).toBe(false);
    expect(isDental("nurse")).toBe(false);
    expect(isDental("doctor")).toBe(false);
    expect(isDental("staff")).toBe(false);
    expect(isDental("patient")).toBe(false);
  });
});

describe("isStaff", () => {
  it("returns true for staff", () => {
    expect(isStaff("staff")).toBe(true);
  });

  it("returns false for other roles", () => {
    expect(isStaff("superadmin")).toBe(false);
    expect(isStaff("nurse")).toBe(false);
    expect(isStaff("doctor")).toBe(false);
    expect(isStaff("dentist")).toBe(false);
    expect(isStaff("patient")).toBe(false);
  });
});

describe("isPatient", () => {
  it("returns true for patient", () => {
    expect(isPatient("patient")).toBe(true);
  });

  it("returns false for other roles", () => {
    const others: Array<"superadmin" | "nurse" | "doctor" | "dentist" | "staff"> = [
      "superadmin", "nurse", "doctor", "dentist", "staff",
    ];
    for (const role of others) {
      expect(isPatient(role)).toBe(false);
    }
  });
});

describe("canAccessAdminPanel", () => {
  it("allows superadmin and nurse", () => {
    expect(canAccessAdminPanel("superadmin")).toBe(true);
    expect(canAccessAdminPanel("nurse")).toBe(true);
  });

  it("denies doctor, dentist, staff, and patient", () => {
    expect(canAccessAdminPanel("doctor")).toBe(false);
    expect(canAccessAdminPanel("dentist")).toBe(false);
    expect(canAccessAdminPanel("staff")).toBe(false);
    expect(canAccessAdminPanel("patient")).toBe(false);
  });
});

describe("canAccessClinical", () => {
  it("allows superadmin, nurse, doctor, dentist", () => {
    expect(canAccessClinical("superadmin")).toBe(true);
    expect(canAccessClinical("nurse")).toBe(true);
    expect(canAccessClinical("doctor")).toBe(true);
    expect(canAccessClinical("dentist")).toBe(true);
  });

  it("denies staff and patient", () => {
    expect(canAccessClinical("staff")).toBe(false);
    expect(canAccessClinical("patient")).toBe(false);
  });
});
