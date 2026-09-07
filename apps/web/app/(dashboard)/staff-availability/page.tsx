"use client";

import * as React from "react";
import { getStaffAvailability, recordDutyStatus, updateDutyStatus, type StaffAvailabilityWithMember } from "@/lib/actions/staff-availability";
import { DUTY_STATUS_LABELS, type DutyStatus } from "@/lib/types/staff-availability";

const STATUS_COLORS: Record<DutyStatus, string> = {
  available: "bg-green-100 text-green-700",
  unavailable: "bg-slate-100 text-slate-600",
  seminar: "bg-blue-100 text-blue-700",
  training: "bg-blue-100 text-blue-700",
  official_activity: "bg-purple-100 text-purple-700",
  on_leave: "bg-red-100 text-red-600",
};

export default function StaffAvailabilityPage() {
  const [records, setRecords] = React.useState<StaffAvailabilityWithMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = React.useState({ staff_profile_id: "", duty_status: "available" as DutyStatus, notes: "", start_time: "", end_time: "" });

  const load = React.useCallback(async () => {
    const result = await getStaffAvailability();
    setRecords(result.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staff_profile_id || !form.start_time) return;
    setSubmitting(true);
    setMessage(null);
    const result = await recordDutyStatus(
      form.staff_profile_id,
      form.duty_status,
      form.notes || undefined,
      form.start_time || undefined,
      form.end_time || undefined,
    );
    setSubmitting(false);
    if (!result.success) setMessage({ type: "error", text: result.error ?? "Failed" });
    else { setMessage({ type: "success", text: "Duty status recorded" }); setShowForm(false); setForm({ staff_profile_id: "", duty_status: "available", notes: "", start_time: "", end_time: "" }); await load(); }
  };

  const handleUpdateStatus = async (id: string, newStatus: DutyStatus) => {
    const result = await updateDutyStatus(id, newStatus);
    if (!result.success) setMessage({ type: "error", text: result.error ?? "Failed" });
    else { setMessage({ type: "success", text: "Status updated" }); await load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Availability</h1>
          <p className="text-sm text-slate-500">{records.length} record{records.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          {showForm ? "Cancel" : "Record Duty Status"}
        </button>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.text}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">Staff Profile ID *</label>
              <input type="text" required value={form.staff_profile_id} onChange={(e) => setForm({ ...form, staff_profile_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" placeholder="UUID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Status *</label>
              <select required value={form.duty_status} onChange={(e) => setForm({ ...form, duty_status: e.target.value as DutyStatus })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100">
                {Object.entries(DUTY_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Start Date *</label>
              <input type="datetime-local" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">End Date</label>
              <input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" placeholder="Optional reason..." />
          </div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Saving..." : "Record Status"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No availability records yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{rec.staff?.full_name ?? rec.staff_profile_id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[rec.duty_status as DutyStatus] ?? "bg-slate-100 text-slate-600"}`}>
                      {DUTY_STATUS_LABELS[rec.duty_status as DutyStatus] ?? rec.duty_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {rec.start_time ? new Date(rec.start_time).toLocaleDateString() : "—"}
                    {rec.end_time ? ` – ${new Date(rec.end_time).toLocaleDateString()}` : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{rec.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {rec.duty_status !== "available" && (
                        <button onClick={() => handleUpdateStatus(rec.id, "available")} className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100">Set Available</button>
                      )}
                      {rec.duty_status === "available" && (
                        <button onClick={() => handleUpdateStatus(rec.id, "unavailable")} className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100">Set Unavailable</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
