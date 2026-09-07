import type { UserRole } from "@repo/types";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  section: string;
}

export const NAVIGATION_MENU: NavItem[] = [
  // ── Overview ─────────────────────────────────────────────────
  { title: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", section: "overview", roles: ["superadmin", "nurse", "staff", "doctor", "dentist", "patient"] },
  { title: "My Profile", href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", section: "overview", roles: ["superadmin", "nurse", "staff", "doctor", "dentist", "patient"] },

  // ── Administration ───────────────────────────────────────────
  { title: "User & RBAC", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", section: "administration", roles: ["superadmin"] },
  { title: "Audit Logs", href: "/admin/audit-logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", section: "administration", roles: ["superadmin", "nurse"] },
  { title: "System Infrastructure", href: "/admin/system", icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2", section: "administration", roles: ["superadmin"] },
  { title: "Lookup Management", href: "/admin/settings/lookups", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4", section: "administration", roles: ["superadmin", "nurse"] },

  // ── Clinic Operations ────────────────────────────────────────
  { title: "Patient Directory", href: "/patients", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", section: "clinic-operations", roles: ["superadmin", "nurse", "staff", "doctor", "dentist"] },
  { title: "Walk-In Registration", href: "/patients/register", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", section: "clinic-operations", roles: ["superadmin", "staff"] },
  { title: "Queue Reception", href: "/queue/reception", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", section: "clinic-operations", roles: ["superadmin", "staff"] },
  { title: "Queue & Triage", href: "/queue/triage", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", section: "clinic-operations", roles: ["superadmin", "nurse", "staff"] },
  { title: "Staff Availability", href: "/staff-availability", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", section: "clinic-operations", roles: ["superadmin", "nurse", "staff", "doctor", "dentist"] },
  { title: "Provider Sessions", href: "/provider-sessions", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", section: "clinic-operations", roles: ["superadmin", "nurse", "staff", "doctor", "dentist"] },
  { title: "Provider Requests", href: "/provider-requests", icon: "M13 10V3L4 14h7v7l9-11h-7z", section: "clinic-operations", roles: ["superadmin", "nurse", "staff", "doctor", "dentist"] },
  { title: "Inventory", href: "/inventory", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", section: "clinic-operations", roles: ["superadmin", "nurse", "staff"] },
  { title: "Health Clearances", href: "/health-clearances", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", section: "clinic-operations", roles: ["superadmin", "nurse", "staff"] },
  { title: "Certificates", href: "/certificates", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", section: "clinic-operations", roles: ["superadmin", "nurse", "doctor", "dentist", "staff"] },

  // ── Medical ──────────────────────────────────────────────────
  { title: "Medical Consultations", href: "/consultations/medical", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", section: "medical", roles: ["superadmin", "doctor"] },
  { title: "Medical Records", href: "/records/medical", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", section: "medical", roles: ["superadmin", "nurse", "doctor"] },
  { title: "Prescriptions", href: "/prescriptions", icon: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3", section: "medical", roles: ["superadmin", "doctor", "dentist", "nurse"] },

  // ── Dental ───────────────────────────────────────────────────
  { title: "Dental Consultations", href: "/consultations/dental", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", section: "dental", roles: ["superadmin", "dentist"] },
  { title: "Dental Records & Charting", href: "/records/dental", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", section: "dental", roles: ["superadmin", "nurse", "dentist"] },

  // ── Security ─────────────────────────────────────────────────
  { title: "Break-Glass Request", href: "/security/break-glass", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", section: "security", roles: ["superadmin", "doctor", "dentist", "nurse"] },

  // ── Reports ──────────────────────────────────────────────────
  { title: "Reports & Analytics", href: "/reports", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", section: "reports", roles: ["superadmin", "nurse", "doctor", "dentist"] },

  // ── Patient Portal ───────────────────────────────────────────
  { title: "My Queue Status", href: "/my-queue-status", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", section: "my-health", roles: ["patient"] },
  { title: "My Appointments", href: "/my-appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", section: "my-health", roles: ["patient"] },
  { title: "My Medical Record", href: "/my-records/medical", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", section: "my-health", roles: ["patient"] },
  { title: "My Dental Record", href: "/my-records/dental", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", section: "my-health", roles: ["patient"] },
  { title: "My Prescriptions", href: "/my-prescriptions", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", section: "my-health", roles: ["patient"] },
  { title: "My Clearances", href: "/my-clearances", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", section: "my-health", roles: ["patient"] },
];

export const SECTION_LABELS: Record<string, string> = {
  overview: "",
  administration: "Administration",
  "clinic-operations": "Clinic Operations",
  medical: "Medical",
  dental: "Dental",
  security: "Security",
  reports: "Reports",
  "my-health": "My Health",
};

export function getFilteredNavigation(role: UserRole): NavItem[] {
  return NAVIGATION_MENU.filter((item) => item.roles.includes(role));
}

export function getGroupedNavigation(role: UserRole): { section: string; label: string; items: NavItem[] }[] {
  const filtered = getFilteredNavigation(role);
  const groups: { section: string; label: string; items: NavItem[] }[] = [];
  let currentSection = "";

  for (const item of filtered) {
    if (item.section !== currentSection) {
      currentSection = item.section;
      groups.push({
        section: item.section,
        label: SECTION_LABELS[item.section] ?? item.section,
        items: [],
      });
    }
    groups[groups.length - 1].items.push(item);
  }

  return groups;
}

export function getAllowedRoutes(role: UserRole): string[] {
  const navRoutes = NAVIGATION_MENU
    .filter((item) => item.roles.includes(role))
    .map((item) => item.href);
  return [...new Set(navRoutes)];
}

export function isRouteAllowed(href: string, role: UserRole): boolean {
  return NAVIGATION_MENU.some(
    (item) => item.href === href && item.roles.includes(role)
  );
}
