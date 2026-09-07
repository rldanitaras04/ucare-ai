"use client";

import * as React from "react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = React.useState<{ id: string; scheduled_at: string; status: string; appointment_type: string; reason: string | null }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const { createClient } = await import("@repo/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("appointments").select("*").order("scheduled_at", { ascending: false });
      setAppointments(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-sm text-slate-500">{appointments.length} appointment{appointments.length !== 1 ? "s" : ""}</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-slate-500">No appointments scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{new Date(apt.scheduled_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  <p className="text-sm text-slate-500">{new Date(apt.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                  {apt.reason && <p className="mt-1 text-xs text-slate-400">{apt.reason}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 capitalize">{apt.appointment_type}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${apt.status === "completed" ? "bg-green-100 text-green-700" : apt.status === "cancelled" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}>{apt.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
