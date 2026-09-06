"use server";

import { createServerClient } from "@repo/supabase/server";

export interface DashboardStats {
  totalPatients: number;
  todayVisits: number;
  activeQueue: number;
  totalAuditLogs: number;
}

export async function getDashboardStats(): Promise<{
  data: DashboardStats | null;
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const today = new Date().toISOString().split("T")[0];

  const [patientsResult, visitsResult, queueResult, auditResult] = await Promise.all([
    supabase
      .from("patient_profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("walk_in_visits")
      .select("id", { count: "exact", head: true })
      .gte("visit_date", `${today}T00:00:00`)
      .lte("visit_date", `${today}T23:59:59`),
    supabase
      .from("queue_entries")
      .select("id", { count: "exact", head: true })
      .in("status", ["waiting", "called", "in_session"]),
    supabase
      .from("audit_logs")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    data: {
      totalPatients: patientsResult.count ?? 0,
      todayVisits: visitsResult.count ?? 0,
      activeQueue: queueResult.count ?? 0,
      totalAuditLogs: auditResult.count ?? 0,
    },
    error: null,
  };
}
