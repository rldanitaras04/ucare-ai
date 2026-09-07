import { createServerClient } from "@repo/supabase/server";
import { sanitizeRole } from "@repo/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = sanitizeRole(user?.user_metadata?.role as string);
  const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const today = new Date().toISOString().split("T")[0];

  const [patientsResult, visitsResult, queueResult, activeQueueResult, prescriptionsResult, clearancesResult] = await Promise.all([
    supabase.from("patient_profiles").select("id", { count: "exact", head: true }),
    supabase.from("walk_in_visits").select("id", { count: "exact", head: true }).gte("visit_date", `${today}T00:00:00`).lte("visit_date", `${today}T23:59:59`),
    supabase.from("queue_entries").select("queue_number, status, priority").in("status", ["waiting", "called"]).order("created_at", { ascending: true }).limit(5),
    supabase.from("queue_entries").select("id", { count: "exact", head: true }).in("status", ["waiting", "called", "in_session"]),
    supabase.from("prescriptions").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("health_clearances").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const totalPatients = patientsResult.count ?? 0;
  const todayVisits = visitsResult.count ?? 0;
  const activeQueue = activeQueueResult.count ?? 0;
  const pendingPrescriptions = prescriptionsResult.count ?? 0;
  const pendingClearances = clearancesResult.count ?? 0;
  const queueEntries = queueResult.data ?? [];

  const isPatient = role === "patient";
  const isClinical = ["doctor", "dentist", "nurse"].includes(role);
  const isOps = ["superadmin", "staff", "nurse"].includes(role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back! Logged in as <span className="font-medium text-slate-700">{roleLabel}</span>.
        </p>
      </div>

      {!isPatient && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isOps && (
            <>
              <StatCard label="Total Patients" value={totalPatients} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" color="blue" />
              <StatCard label="Today's Walk-Ins" value={todayVisits} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="emerald" />
              <StatCard label="Active Queue" value={activeQueue} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" color="amber" />
              <StatCard label="Pending Clearances" value={pendingClearances} icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" color="purple" />
            </>
          )}
          {isClinical && (
            <>
              <StatCard label="Active Queue" value={activeQueue} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" color="amber" />
              <StatCard label="Today's Visits" value={todayVisits} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="emerald" />
              <StatCard label="Draft Prescriptions" value={pendingPrescriptions} icon="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" color="blue" />
              <StatCard label="Pending Clearances" value={pendingClearances} icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" color="purple" />
            </>
          )}
        </div>
      )}

      {isPatient && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink href="/my-records/medical" label="My Medical Record" description="View your health information" color="blue" />
          <QuickLink href="/my-records/dental" label="My Dental Record" description="View your dental records" color="purple" />
          <QuickLink href="/my-prescriptions" label="My Prescriptions" description="View your prescriptions" color="emerald" />
          <QuickLink href="/my-clearances" label="Health Clearances" description="View your clearances" color="amber" />
          <QuickLink href="/my-queue-status" label="Queue Status" description="Check your queue position" color="slate" />
        </div>
      )}

      {isOps && queueEntries.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Current Queue</h2>
            <Link href="/queue/reception" className="text-xs font-medium text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="space-y-2">
            {queueEntries.map((entry) => (
              <div key={entry.queue_number} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{entry.queue_number}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    entry.status === "called" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  }`}>{entry.status}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  entry.priority === "emergency" ? "bg-red-100 text-red-700" :
                  entry.priority === "urgent" ? "bg-amber-100 text-amber-700" :
                  entry.priority === "priority" ? "bg-blue-100 text-blue-700" :
                  "bg-slate-100 text-slate-600"
                }`}>{entry.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isOps && (
          <>
            <QuickLink href="/patients/register" label="Walk-In Registration" description="Register a new walk-in patient" color="emerald" />
            <QuickLink href="/queue/reception" label="Queue Reception" description="Manage the patient queue" color="amber" />
            <QuickLink href="/queue/triage" label="Triage Assessment" description="Perform triage assessments" color="blue" />
          </>
        )}
        {isClinical && role === "doctor" && (
          <QuickLink href="/consultations/medical" label="Medical Consultations" description="View and manage consultations" color="blue" />
        )}
        {isClinical && role === "dentist" && (
          <QuickLink href="/consultations/dental" label="Dental Consultations" description="View and manage dental consultations" color="purple" />
        )}
        {isOps && (
          <>
            <QuickLink href="/staff-availability" label="Staff Availability" description="Manage staff duty status" color="slate" />
            <QuickLink href="/provider-sessions" label="Provider Sessions" description="Schedule provider sessions" color="emerald" />
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    slate: { bg: "bg-slate-50", text: "text-slate-600" },
  };
  const c = colorMap[color] ?? colorMap.slate;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
        <svg className={`h-5 w-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function QuickLink({ href, label, description, color }: { href: string; label: string; description: string; color: string }) {
  const colorMap: Record<string, { bg: string; border: string }> = {
    blue: { bg: "bg-blue-50", border: "border-blue-200 hover:border-blue-300" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200 hover:border-emerald-300" },
    amber: { bg: "bg-amber-50", border: "border-amber-200 hover:border-amber-300" },
    purple: { bg: "bg-purple-50", border: "border-purple-200 hover:border-purple-300" },
    slate: { bg: "bg-slate-50", border: "border-slate-200 hover:border-slate-300" },
  };
  const c = colorMap[color] ?? colorMap.slate;

  return (
    <Link href={href} className={`rounded-2xl border ${c.border} bg-white p-5 transition-colors hover:bg-slate-50`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
        <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{label}</h3>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </Link>
  );
}
