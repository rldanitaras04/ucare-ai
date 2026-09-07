"use client";

import * as React from "react";
import { getProviderRequests, createProviderRequest, updateProviderRequestStatus, type ProviderRequest } from "@/lib/actions/provider-requests";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  for_coordination: "bg-blue-100 text-blue-700",
  provider_contacted: "bg-blue-100 text-blue-700",
  provider_confirmed: "bg-green-100 text-green-700",
  provider_declined: "bg-red-100 text-red-600",
  session_created: "bg-purple-100 text-purple-700",
  served: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-500",
  closed: "bg-slate-100 text-slate-500",
};

export default function ProviderRequestsPage() {
  const [requests, setRequests] = React.useState<ProviderRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = React.useState({ patient_id: "", visit_id: "", provider_type: "doctor" as "doctor" | "dentist", reason: "", urgency: "normal" as "normal" | "urgent" | "emergency" });

  const load = React.useCallback(async () => {
    const result = await getProviderRequests();
    setRequests(result.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result = await createProviderRequest({
      patient_id: form.patient_id,
      visit_id: form.visit_id,
      provider_type: form.provider_type,
      urgency: form.urgency,
      reason: form.reason || undefined,
    });
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else { setMessage({ type: "success", text: "Provider request created" }); setShowForm(false); setForm({ patient_id: "", visit_id: "", provider_type: "doctor", reason: "", urgency: "normal" }); await load(); }
  };

  const handleStatusUpdate = async (id: string, status: ProviderRequest["status"]) => {
    const result = await updateProviderRequestStatus(id, status);
    if (result.error) setMessage({ type: "error", text: result.error });
    else { setMessage({ type: "success", text: "Request updated" }); await load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Provider Requests</h1>
          <p className="text-sm text-slate-500">{requests.length} request{requests.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          {showForm ? "Cancel" : "New Request"}
        </button>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.text}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">Patient ID *</label>
              <input type="text" required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="UUID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Visit ID *</label>
              <input type="text" required value={form.visit_id} onChange={(e) => setForm({ ...form, visit_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="UUID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Provider Type *</label>
              <select required value={form.provider_type} onChange={(e) => setForm({ ...form, provider_type: e.target.value as "doctor" | "dentist" })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
                <option value="doctor">Doctor</option>
                <option value="dentist">Dentist</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Urgency *</label>
              <select required value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as typeof form.urgency })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Reason *</label>
            <textarea rows={2} required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="Why is a provider needed?" />
          </div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No provider requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 capitalize">{req.provider_type} Request</p>
                  <p className="text-xs text-slate-500">Urgency: {req.urgency} · Patient: {req.patient_name ?? "Unknown"}</p>
                  {req.reason && <p className="mt-1 text-xs text-slate-400">{req.reason}</p>}
                  <p className="mt-1 text-xs text-slate-400">{new Date(req.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[req.status] ?? "bg-slate-100 text-slate-600"}`}>{req.status.replace(/_/g, " ")}</span>
                  {req.status === "pending" && (
                    <button onClick={() => handleStatusUpdate(req.id, "for_coordination")} className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100">Coordinate</button>
                  )}
                  {req.status === "for_coordination" && (
                    <button onClick={() => handleStatusUpdate(req.id, "confirmed")} className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100">Confirm</button>
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
