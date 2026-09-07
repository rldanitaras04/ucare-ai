"use client";

import * as React from "react";
import { getProviderSessions, createProviderSession, updateSessionStatus, type ProviderSessionWithProvider } from "@/lib/actions/provider-sessions";
import { SESSION_TYPE_LABELS, type ProviderType, type SessionType, type ProviderSessionStatus } from "@/lib/types/provider-sessions";

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-slate-100 text-slate-600",
  confirmed: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function ProviderSessionsPage() {
  const [sessions, setSessions] = React.useState<ProviderSessionWithProvider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = React.useState({ provider_profile_id: "", provider_type: "doctor" as ProviderType, session_type: "monthly_visit" as SessionType, session_date: "", start_time: "" });

  const load = React.useCallback(async () => {
    const result = await getProviderSessions();
    setSessions(result.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result = await createProviderSession(
      form.provider_profile_id,
      form.provider_type,
      form.session_type,
      form.session_date,
      form.start_time,
    );
    setSubmitting(false);
    if (!result.success) setMessage({ type: "error", text: result.error ?? "Failed" });
    else { setMessage({ type: "success", text: "Session created" }); setShowForm(false); setForm({ provider_profile_id: "", provider_type: "doctor", session_type: "monthly_visit", session_date: "", start_time: "" }); await load(); }
  };

  const handleStatusUpdate = async (id: string, status: ProviderSessionStatus) => {
    const result = await updateSessionStatus(id, status);
    if (!result.success) setMessage({ type: "error", text: result.error ?? "Failed" });
    else { setMessage({ type: "success", text: "Session updated" }); await load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Provider Sessions</h1>
          <p className="text-sm text-slate-500">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          {showForm ? "Cancel" : "Schedule Session"}
        </button>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.text}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">Provider Profile ID *</label>
              <input type="text" required value={form.provider_profile_id} onChange={(e) => setForm({ ...form, provider_profile_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="UUID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Provider Type *</label>
              <select required value={form.provider_type} onChange={(e) => setForm({ ...form, provider_type: e.target.value as ProviderType })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
                <option value="doctor">Doctor</option>
                <option value="dentist">Dentist</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Session Type *</label>
              <select required value={form.session_type} onChange={(e) => setForm({ ...form, session_type: e.target.value as SessionType })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
                <option value="monthly_visit">Monthly Visit</option>
                <option value="case_based">Case-Based Visit</option>
                <option value="emergency">Emergency Session</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Session Date *</label>
              <input type="date" required value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Start Time *</label>
              <input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Creating..." : "Create Session"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No provider sessions scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 capitalize">{session.provider_type} — {SESSION_TYPE_LABELS[session.session_type as SessionType] ?? session.session_type}</p>
                  <p className="text-xs text-slate-500">{session.provider?.full_name ?? "Unknown provider"}</p>
                  <p className="text-sm text-slate-500">{new Date(session.session_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  {session.start_time && <p className="text-xs text-slate-400">{session.start_time}{session.end_time ? ` – ${session.end_time}` : ""}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[session.status] ?? "bg-slate-100 text-slate-600"}`}>{session.status}</span>
                  {session.status === "planned" && (
                    <button onClick={() => handleStatusUpdate(session.id, "confirmed")} className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100">Confirm</button>
                  )}
                  {session.status === "confirmed" && (
                    <button onClick={() => handleStatusUpdate(session.id, "active")} className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100">Start</button>
                  )}
                  {session.status === "active" && (
                    <button onClick={() => handleStatusUpdate(session.id, "completed")} className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100">Complete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
