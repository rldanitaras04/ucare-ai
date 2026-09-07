"use client";

import * as React from "react";
import { recordBreakGlassAccess, getBreakGlassLogs, type BreakGlassLog } from "@/lib/actions/break-glass";

export default function BreakGlassPage() {
  const [events, setEvents] = React.useState<BreakGlassLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const result = await getBreakGlassLogs();
      setEvents(result.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) return;
    setSubmitting(true);
    setMessage(null);

    const result = await recordBreakGlassAccess({
      patient_id: "00000000-0000-0000-0000-000000000000",
      reason: reason.trim(),
    });

    setSubmitting(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Break-glass access recorded" });
      setReason("");
      const updated = await getBreakGlassLogs();
      setEvents(updated.data ?? []);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Break-Glass Request</h1>
        <p className="text-sm text-slate-500">Emergency access with audit trail</p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Break-glass access is logged and flagged for review. Use only in emergencies.
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500">Reason for Emergency Access *</label>
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" placeholder="Describe the emergency reason (minimum 10 characters)..." />
          {reason.length > 0 && reason.length < 10 && (
            <p className="mt-1 text-xs text-red-600">Minimum 10 characters required</p>
          )}
        </div>
        <button type="submit" disabled={submitting || reason.trim().length < 10} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
          {submitting ? "Recording..." : "Record Break-Glass Access"}
        </button>
      </form>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.text}</div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-900">Break-Glass History</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
        ) : events.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No break-glass events recorded</p>
        ) : (
          <div className="mt-3 space-y-2">
            {events.map((event) => (
              <div key={event.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-sm text-slate-900">{event.reason}</p>
                <p className="text-xs text-slate-400">{new Date(event.accessed_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
