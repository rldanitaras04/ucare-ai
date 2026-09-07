"use client";

import * as React from "react";

export default function SystemPage() {
  const [stats, setStats] = React.useState({ profiles: 0, patients: 0, visits: 0, prescriptions: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const { createClient } = await import("@repo/supabase/client");
      const supabase = createClient();
      const [profiles, patients, visits, prescriptions] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("patient_profiles").select("id", { count: "exact", head: true }),
        supabase.from("walk_in_visits").select("id", { count: "exact", head: true }),
        supabase.from("prescriptions").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        profiles: profiles.count ?? 0,
        patients: patients.count ?? 0,
        visits: visits.count ?? 0,
        prescriptions: prescriptions.count ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Infrastructure</h1>
        <p className="text-sm text-slate-500">System health and configuration overview</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">User Profiles</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.profiles}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Patient Profiles</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.patients}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Walk-In Visits</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.visits}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Prescriptions</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.prescriptions}</p>
          </div>
        </div>
      )}
    </div>
  );
}
