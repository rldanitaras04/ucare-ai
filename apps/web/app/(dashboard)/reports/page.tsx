"use client";

import * as React from "react";
import { getReportMetrics, exportReportCSV, type ReportMetrics } from "@/lib/actions/reports";

export default function ReportsPage() {
  const [metrics, setMetrics] = React.useState<ReportMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const result = await getReportMetrics();
      setMetrics(result.data);
      setLoading(false);
    };
    load();
  }, []);

  const handleExport = async () => {
    if (!metrics) return;
    const csv = await exportReportCSV(metrics);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (!metrics) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load report metrics</div>;
  }

  const statCards = [
    { label: "Total Patients", value: metrics.totalPatients, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Total Walk-Ins", value: metrics.totalVisits, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: "Prescriptions", value: metrics.totalPrescriptions, icon: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" },
    { label: "Health Clearances", value: metrics.totalClearances, icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">System-wide overview and metrics</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">{card.value.toLocaleString()}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Walk-Ins by Service Type</h2>
          <div className="mt-4 space-y-3">
            {metrics.visitsByService.length === 0 ? (
              <p className="text-sm text-slate-500">No data available</p>
            ) : (
              metrics.visitsByService.map((item) => (
                <div key={item.service} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 capitalize">{item.service}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-slate-900" style={{ width: `${Math.min((item.count / Math.max(metrics.totalVisits, 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-sm font-medium text-slate-900">{item.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Walk-Ins by Status</h2>
          <div className="mt-4 space-y-3">
            {metrics.visitsByStatus.length === 0 ? (
              <p className="text-sm text-slate-500">No data available</p>
            ) : (
              metrics.visitsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 capitalize">{item.status.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-slate-900" style={{ width: `${Math.min((item.count / Math.max(metrics.totalVisits, 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-sm font-medium text-slate-900">{item.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {metrics.topDiagnoses.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Top Diagnosis Codes</h2>
          <div className="mt-4 space-y-3">
            {metrics.topDiagnoses.map((item) => (
              <div key={item.code} className="flex items-center justify-between">
                <span className="text-sm font-mono text-slate-600">{item.code}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-slate-900" style={{ width: `${Math.min((item.count / Math.max(metrics.topDiagnoses[0]?.count ?? 1, 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Today</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.visitsToday}</p>
          <p className="text-sm text-slate-500">walk-ins</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">This Week</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.visitsThisWeek}</p>
          <p className="text-sm text-slate-500">walk-ins</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Active Queue</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.activeQueue}</p>
          <p className="text-sm text-slate-500">patients waiting</p>
        </div>
      </div>
    </div>
  );
}
