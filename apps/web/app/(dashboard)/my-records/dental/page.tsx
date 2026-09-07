"use client";

import * as React from "react";
import { getDentalHistory, createDentalHistoryEntry } from "@/lib/actions/dental-history";
import type { DentalHistoryEntry } from "@/lib/actions/dental-history";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-amber-100 text-amber-700",
  treated: "bg-green-100 text-green-700",
  monitoring: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

export default function MyDentalRecordPage() {
  const [patient, setPatient] = React.useState<{ id: string; first_name: string; last_name: string } | null>(null);
  const [entries, setEntries] = React.useState<DentalHistoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = React.useState({
    condition_name: "",
    tooth_number: "",
    surface: "",
    diagnosis_date: "",
    treatment_performed: "",
    status: "active",
    notes: "",
  });

  React.useEffect(() => {
    const load = async () => {
      try {
        const { createClient } = await import("@repo/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data: raw } = await supabase.from("patient_profiles" as never).select("id, first_name, last_name").eq("user_id", user.id).single();
        const data = raw as { id: string; first_name: string; last_name: string } | null;
        if (!data) { setLoading(false); return; }
        setPatient(data);
        const { data: dentalData } = await getDentalHistory(data.id);
        setEntries(dentalData ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !form.condition_name.trim()) return;
    setSubmitting(true);
    setMessage(null);
    const res = await createDentalHistoryEntry({
      patient_id: patient.id,
      condition_name: form.condition_name.trim(),
      tooth_number: form.tooth_number ? Number(form.tooth_number) : undefined,
      surface: form.surface.trim() || undefined,
      diagnosis_date: form.diagnosis_date || undefined,
      treatment_performed: form.treatment_performed.trim() || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    });
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setEntries((prev) => [res.data!, ...prev]);
      setForm({ condition_name: "", tooth_number: "", surface: "", diagnosis_date: "", treatment_performed: "", status: "active", notes: "" });
      setShowForm(false);
      setMessage({ type: "success", text: "Dental entry added." });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Dental Record</h1>
        <p className="text-sm text-slate-500">Your dental health information</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        </div>
      ) : !patient ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No patient profile found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {message && (
            <div className={`rounded-2xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Dental Information</h2>
            <p className="mt-2 text-sm text-slate-600">{patient.first_name} {patient.last_name}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Dental History</h3>
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                {showForm ? "Cancel" : "+ Add Entry"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Condition Name *</label>
                    <input
                      type="text"
                      required
                      value={form.condition_name}
                      onChange={(e) => setForm({ ...form, condition_name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Tooth Number</label>
                    <input
                      type="number"
                      min={1}
                      max={32}
                      value={form.tooth_number}
                      onChange={(e) => setForm({ ...form, tooth_number: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Surface</label>
                    <input
                      type="text"
                      value={form.surface}
                      onChange={(e) => setForm({ ...form, surface: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Diagnosis Date</label>
                    <input
                      type="date"
                      value={form.diagnosis_date}
                      onChange={(e) => setForm({ ...form, diagnosis_date: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Treatment Performed</label>
                    <input
                      type="text"
                      value={form.treatment_performed}
                      onChange={(e) => setForm({ ...form, treatment_performed: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="treated">Treated</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Entry"}
                </button>
              </form>
            )}

            {entries.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No dental history records found.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{entry.condition_name}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          {entry.tooth_number != null && <span>Tooth #{entry.tooth_number}</span>}
                          {entry.surface && <span>Surface: {entry.surface}</span>}
                          {entry.diagnosis_date && <span>Diagnosed: {entry.diagnosis_date}</span>}
                          {entry.treatment_performed && <span>Treatment: {entry.treatment_performed}</span>}
                          {entry.treatment_date && <span>Treated: {entry.treatment_date}</span>}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[entry.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
