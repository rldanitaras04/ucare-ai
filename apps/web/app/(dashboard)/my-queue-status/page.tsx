"use client";

import * as React from "react";

export default function MyQueueStatusPage() {
  const [entries, setEntries] = React.useState<{ id: string; queue_number: string; status: string; priority: string; room_station: string | null; called_at: string | null; service_category: string; created_at: string }[]>([]);
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

      const { data: visitsRaw } = await supabase
        .from("walk_in_visits" as never)
        .select("id")
        .eq("patient_id", profile.id);

      const visits = (visitsRaw ?? []) as { id: string }[];
      const visitIds = visits.map((v) => v.id);
      if (visitIds.length === 0) { setLoading(false); return; }

      const { data: entriesRaw } = await supabase
        .from("queue_entries" as never)
        .select("*")
        .in("visit_id", visitIds)
        .in("status", ["waiting", "called", "in_session"])
        .order("created_at", { ascending: false })
        .limit(10);

      setEntries((entriesRaw ?? []) as { id: string; queue_number: string; status: string; priority: string; room_station: string | null; called_at: string | null; service_category: string; created_at: string }[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Queue Status</h1>
        <p className="text-sm text-slate-500">Your current queue position</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">You are not currently in the queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{entry.queue_number}</p>
                  <p className="text-sm text-slate-500 capitalize">{entry.service_category}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${entry.status === "called" ? "bg-amber-100 text-amber-700" : entry.status === "in_session" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {entry.status.replace("_", " ")}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">Priority: {entry.priority}</p>
                </div>
              </div>
              {entry.room_station && <p className="mt-3 text-sm text-slate-600">Room: {entry.room_station}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
