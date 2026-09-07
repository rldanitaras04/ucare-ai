"use client";

import * as React from "react";

export default function MyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = React.useState<{ id: string; prescription_number: string; medication_name: string; dose: string; frequency: string; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const { createClient } = await import("@repo/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profileRaw } = await supabase
        .from("patient_profiles" as never)
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const profile = profileRaw as { id: string } | null;
      if (!profile) { setLoading(false); return; }

      const { data: rxRaw } = await supabase
        .from("prescriptions" as never)
        .select("*")
        .eq("patient_id", profile.id)
        .order("created_at", { ascending: false });

      setPrescriptions((rxRaw ?? []) as { id: string; prescription_number: string; medication_name: string; dose: string; frequency: string; status: string; created_at: string }[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Prescriptions</h1>
        <p className="text-sm text-slate-500">{prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""}</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{rx.medication_name}</p>
                  <p className="text-xs text-slate-500">{rx.dose} · {rx.frequency.replace(/_/g, " ")}</p>
                  <p className="text-xs text-slate-400">{rx.prescription_number}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${rx.status === "completed" ? "bg-green-100 text-green-700" : rx.status === "dispensed" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>{rx.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
