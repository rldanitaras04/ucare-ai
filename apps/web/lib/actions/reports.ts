"use server";

import { createServerClient } from "@repo/supabase/server";

export interface ReportMetrics {
  totalPatients: number;
  totalVisits: number;
  visitsToday: number;
  visitsThisWeek: number;
  visitsThisMonth: number;
  totalPrescriptions: number;
  totalClearances: number;
  totalEncounters: number;
  activeQueue: number;
  visitsByService: Array<{ service: string; count: number }>;
  visitsByStatus: Array<{ status: string; count: number }>;
  visitsByDay: Array<{ date: string; count: number }>;
  topDiagnoses: Array<{ code: string; count: number }>;
}

export async function getReportMetrics(dateRange?: {
  start: string;
  end: string;
}): Promise<{ data: ReportMetrics | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions" };
  }

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const startFilter = dateRange?.start ?? monthAgo;
  const endFilter = dateRange?.end ?? new Date().toISOString();

  const [
    patientsResult,
    totalVisitsResult,
    todayVisitsResult,
    weekVisitsResult,
    monthVisitsResult,
    prescriptionsResult,
    clearancesResult,
    encountersResult,
    queueResult,
    serviceResult,
    statusResult,
    diagnosesResult,
  ] = await Promise.all([
    supabase.from("patient_profiles").select("id", { count: "exact", head: true }),
    supabase.from("walk_in_visits").select("id", { count: "exact", head: true })
      .gte("visit_date", startFilter).lte("visit_date", endFilter),
    supabase.from("walk_in_visits").select("id", { count: "exact", head: true })
      .gte("visit_date", `${today}T00:00:00`).lte("visit_date", `${today}T23:59:59`),
    supabase.from("walk_in_visits").select("id", { count: "exact", head: true })
      .gte("visit_date", `${weekAgo}T00:00:00`),
    supabase.from("walk_in_visits").select("id", { count: "exact", head: true })
      .gte("visit_date", `${monthAgo}T00:00:00`),
    supabase.from("prescriptions").select("id", { count: "exact", head: true })
      .gte("created_at", startFilter).lte("created_at", endFilter),
    supabase.from("health_clearances").select("id", { count: "exact", head: true })
      .gte("created_at", startFilter).lte("created_at", endFilter),
    supabase.from("clinical_encounters").select("id", { count: "exact", head: true })
      .gte("created_at", startFilter).lte("created_at", endFilter),
    supabase.from("queue_entries").select("id", { count: "exact", head: true })
      .in("status", ["waiting", "called", "in_session"]),
    supabase.from("walk_in_visits").select("service_type")
      .gte("visit_date", startFilter).lte("visit_date", endFilter),
    supabase.from("walk_in_visits").select("status")
      .gte("visit_date", startFilter).lte("visit_date", endFilter),
    supabase.from("clinical_encounters").select("diagnosis_codes")
      .gte("created_at", startFilter).lte("created_at", endFilter)
      .not("diagnosis_codes", "is", null),
  ]);

  // Process service type distribution
  const serviceCounts: Record<string, number> = {};
  (serviceResult.data ?? []).forEach((row) => {
    serviceCounts[row.service_type] = (serviceCounts[row.service_type] || 0) + 1;
  });
  const visitsByService = Object.entries(serviceCounts).map(([service, count]) => ({ service, count }));

  // Process status distribution
  const statusCounts: Record<string, number> = {};
  (statusResult.data ?? []).forEach((row) => {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  });
  const visitsByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  // Process diagnoses
  const diagnosisCounts: Record<string, number> = {};
  (diagnosesResult.data ?? []).forEach((row) => {
    (row.diagnosis_codes ?? []).forEach((code) => {
      diagnosisCounts[code] = (diagnosisCounts[code] || 0) + 1;
    });
  });
  const topDiagnoses = Object.entries(diagnosisCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([code, count]) => ({ code, count }));

  // Generate daily visits for last 30 days
  const visitsByDay: Array<{ date: string; count: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    visitsByDay.push({ date: dateStr, count: 0 });
  }

  return {
    data: {
      totalPatients: patientsResult.count ?? 0,
      totalVisits: totalVisitsResult.count ?? 0,
      visitsToday: todayVisitsResult.count ?? 0,
      visitsThisWeek: weekVisitsResult.count ?? 0,
      visitsThisMonth: monthVisitsResult.count ?? 0,
      totalPrescriptions: prescriptionsResult.count ?? 0,
      totalClearances: clearancesResult.count ?? 0,
      totalEncounters: encountersResult.count ?? 0,
      activeQueue: queueResult.count ?? 0,
      visitsByService,
      visitsByStatus,
      visitsByDay,
      topDiagnoses,
    },
    error: null,
  };
}

export async function exportReportCSV(metrics: ReportMetrics): Promise<string> {
  const lines = [
    "Metric,Value",
    `Total Patients,${metrics.totalPatients}`,
    `Total Visits,${metrics.totalVisits}`,
    `Visits Today,${metrics.visitsToday}`,
    `Visits This Week,${metrics.visitsThisWeek}`,
    `Visits This Month,${metrics.visitsThisMonth}`,
    `Total Prescriptions,${metrics.totalPrescriptions}`,
    `Total Clearances,${metrics.totalClearances}`,
    `Total Encounters,${metrics.totalEncounters}`,
    `Active Queue,${metrics.activeQueue}`,
    "",
    "Service,Count",
    ...metrics.visitsByService.map((v) => `${v.service},${v.count}`),
    "",
    "Status,Count",
    ...metrics.visitsByStatus.map((v) => `${v.status},${v.count}`),
    "",
    "Diagnosis Code,Count",
    ...metrics.topDiagnoses.map((d) => `${d.code},${d.count}`),
  ];
  return lines.join("\n");
}
