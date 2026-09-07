"use client";

import * as React from "react";

export default function MyClearancesPage() {
  const [clearances, setClearances] = React.useState<{ id: string; clearance_number: string; clearance_type: string; status: string; valid_until: string | null; created_at: string }[]>([]);
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

      const { data: clearancesRaw } = await supabase
        .from("health_clearances" as never)
        .select("*")
        .eq("patient_id", profile.id)
        .order("created_at", { ascending: false });

      setClearances((clearancesRaw ?? []) as { id: string; clearance_number: string; clearance_type: string; status: string; valid_until: string | null; created_at: string }[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Health Clearances</h1>
        <p className="text-sm text-slate-500">{clearances.length} clearance{clearances.length !== 1 ? "s" : ""}</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : clearances.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No health clearances found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clearances.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.clearance_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                  <p className="text-xs text-slate-400">{c.clearance_number}</p>
                  <p className="mt-1 text-xs text-slate-400">Created: {new Date(c.created_at).toLocaleDateString()}</p>
                  {c.valid_until && <p className="text-xs text-slate-400">Valid until: {new Date(c.valid_until).toLocaleDateString()}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.status === "approved" ? "bg-green-100 text-green-700" : c.status === "denied" ? "bg-red-100 text-red-600" : c.status === "expired" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700"}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
