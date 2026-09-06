"use client";

import { useState, useEffect } from "react";
import { Container, PageHeader, Card, CardHeader, CardTitle, CardContent, Button } from "@repo/ui";
import { getReportMetrics, exportReportCSV, type ReportMetrics } from "@/lib/actions/reports";

function StatCard({ title, value, description }: { title: string; value: string | number; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function BarChart({ data, labelKey, valueKey }: { data: Array<Record<string, string | number>>; labelKey: string; valueKey: string }) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="space-y-2">
      {data.slice(0, 10).map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-24 truncate text-xs text-muted-foreground">{String(item[labelKey])}</span>
          <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
            <div
              className="h-full rounded bg-primary transition-all"
              style={{ width: `${((Number(item[valueKey]) || 0) / max) * 100}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-medium">{String(item[valueKey])}</span>
        </div>
      ))}
    </div>
  );
}

function PieSegments({ data }: { data: Array<{ status: string; count: number }> }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500", "bg-purple-500", "bg-gray-500"];
  return (
    <div className="space-y-3">
      <div className="flex gap-1 h-4 rounded-full overflow-hidden">
        {data.map((d, i) => (
          <div
            key={i}
            className={`${colors[i % colors.length]} transition-all`}
            style={{ width: `${(d.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className={`h-3 w-3 rounded-full ${colors[i % colors.length]}`} />
            <span className="text-muted-foreground">{d.status.replace(/_/g, " ")}:</span>
            <span className="font-medium">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("month");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const now = new Date();
      let start = new Date(Date.now() - 30 * 86400000).toISOString();
      if (dateRange === "today") start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      else if (dateRange === "week") start = new Date(Date.now() - 7 * 86400000).toISOString();
      else if (dateRange === "all") start = "2020-01-01T00:00:00Z";

      const { data } = await getReportMetrics({ start, end: now.toISOString() });
      setMetrics(data);
      setLoading(false);
    }
    load();
  }, [dateRange]);

  const handleExport = async () => {
    if (!metrics) return;
    const csv = await exportReportCSV(metrics);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ucare-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <PageHeader
        title="Reports & Analytics"
        description="Clinic operational insights and metrics."
      />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["today", "week", "month", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                dateRange === range ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {range === "today" ? "Today" : range === "week" ? "Last 7 Days" : range === "month" ? "Last 30 Days" : "All Time"}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!metrics}>
          Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border bg-card shadow-sm" />
          ))}
        </div>
      ) : metrics ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Patients" value={metrics.totalPatients} description="Registered profiles" />
            <StatCard title="Total Visits" value={metrics.totalVisits} description="In selected period" />
            <StatCard title="Today's Visits" value={metrics.visitsToday} description="Walk-ins today" />
            <StatCard title="Active Queue" value={metrics.activeQueue} description="Currently waiting" />
            <StatCard title="Prescriptions" value={metrics.totalPrescriptions} description="Issued in period" />
            <StatCard title="Clearances" value={metrics.totalClearances} description="Generated in period" />
            <StatCard title="Encounters" value={metrics.totalEncounters} description="Clinical encounters" />
            <StatCard title="This Month" value={metrics.visitsThisMonth} description="Monthly total" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Visits by Service</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.visitsByService.length > 0 ? (
                  <BarChart data={metrics.visitsByService} labelKey="service" valueKey="count" />
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Visit Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.visitsByStatus.length > 0 ? (
                  <PieSegments data={metrics.visitsByStatus} />
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Diagnoses</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.topDiagnoses.length > 0 ? (
                  <BarChart data={metrics.topDiagnoses} labelKey="code" valueKey="count" />
                ) : (
                  <p className="text-sm text-muted-foreground">No diagnosis data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Daily Visits (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-32">
                  {metrics.visitsByDay.map((d, i) => {
                    const maxDay = Math.max(...metrics.visitsByDay.map((x) => x.count), 1);
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-primary rounded-t transition-all min-h-[2px]"
                        style={{ height: `${(d.count / maxDay) * 100}%` }}
                        title={`${d.date}: ${d.count}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>{metrics.visitsByDay[0]?.date}</span>
                  <span>{metrics.visitsByDay[metrics.visitsByDay.length - 1]?.date}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <p className="mt-8 text-center text-muted-foreground">Failed to load report data.</p>
      )}
    </Container>
  );
}
