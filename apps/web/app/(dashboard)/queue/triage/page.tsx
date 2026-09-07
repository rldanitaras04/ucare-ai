"use client";

import * as React from "react";
import { getVisitsForTriage, saveTriageAssessment, getNurseAvailability, type VisitWithPatient, type NurseStatus } from "@/lib/actions/triage";

type PriorityLevel = "emergency" | "urgent" | "priority" | "normal";

export default function TriagePage() {
  const [visits, setVisits] = React.useState<VisitWithPatient[]>([]);
  const [nurseStatus, setNurseStatus] = React.useState<NurseStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedVisit, setSelectedVisit] = React.useState<VisitWithPatient | null>(null);
  const [form, setForm] = React.useState({
    chief_complaint: "",
    pain_score: "0",
    temperature: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    respiratory_rate: "",
    oxygen_saturation: "",
    red_flags: "",
    priority: "normal" as PriorityLevel,
    triage_notes: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const [visitsResult, nurseResult] = await Promise.all([
        getVisitsForTriage(),
        getNurseAvailability(),
      ]);
      setVisits(visitsResult.data ?? []);
      setNurseStatus(nurseResult.data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setSubmitting(true);
    setMessage(null);

    const result = await saveTriageAssessment({
      visit_id: selectedVisit.visit_id,
      is_fallback: !nurseStatus?.is_nurse_available,
      fallback_reason: nurseStatus?.is_nurse_available ? null : "Nurse unavailable - fallback triage",
      priority: form.priority,
      temperature_c: form.temperature ? parseFloat(form.temperature) : null,
      systolic_bp: form.blood_pressure_systolic ? parseInt(form.blood_pressure_systolic) : null,
      diastolic_bp: form.blood_pressure_diastolic ? parseInt(form.blood_pressure_diastolic) : null,
      heart_rate_bpm: form.heart_rate ? parseInt(form.heart_rate) : null,
      resp_rate_cpm: form.respiratory_rate ? parseInt(form.respiratory_rate) : null,
      spo2_percent: form.oxygen_saturation ? parseFloat(form.oxygen_saturation) : null,
      pain_score: parseInt(form.pain_score) || 0,
      chief_complaint: form.chief_complaint || null,
      red_flags: form.red_flags ? form.red_flags.split(",").map((f) => f.trim()).filter(Boolean) : [],
      triage_notes: form.triage_notes || null,
    });

    setSubmitting(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Triage assessment saved successfully" });
      setSelectedVisit(null);
      setVisits((prev) => prev.filter((v) => v.visit_id !== selectedVisit.visit_id));
      setForm({ chief_complaint: "", pain_score: "0", temperature: "", blood_pressure_systolic: "", blood_pressure_diastolic: "", heart_rate: "", respiratory_rate: "", oxygen_saturation: "", red_flags: "", priority: "normal", triage_notes: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Live Queue & Triage</h1>
        <p className="text-sm text-slate-500">
          {nurseStatus === null ? "Checking availability..." : nurseStatus.is_nurse_available ? "Nurse is available for triage" : "Nurse unavailable - fallback triage active"}
        </p>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Patients for Triage ({visits.length})</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            </div>
          ) : visits.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-8 text-center">
              <p className="text-sm text-slate-500">No patients waiting for triage</p>
            </div>
          ) : (
            visits.map((visit) => (
              <button
                key={visit.visit_id}
                onClick={() => setSelectedVisit(visit)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selectedVisit?.visit_id === visit.visit_id
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{visit.first_name} {visit.last_name}</p>
                    <p className="text-xs text-slate-400">{visit.university_id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 capitalize">{visit.service_type}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{visit.queue_number}</span>
                  </div>
                </div>
                {visit.reason_for_visit && (
                  <p className="mt-2 text-xs text-slate-500 truncate">{visit.reason_for_visit}</p>
                )}
              </button>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {selectedVisit ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Triage Assessment</h2>
                <p className="text-xs text-slate-500">{selectedVisit.first_name} {selectedVisit.last_name} ({selectedVisit.university_id})</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Chief Complaint</label>
                <input type="text" value={form.chief_complaint} onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500">Pain (0-10)</label>
                  <input type="number" min={0} max={10} value={form.pain_score} onChange={(e) => setForm({ ...form, pain_score: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Temp (°C)</label>
                  <input type="number" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Heart Rate</label>
                  <input type="number" value={form.heart_rate} onChange={(e) => setForm({ ...form, heart_rate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500">BP Systolic</label>
                  <input type="number" value={form.blood_pressure_systolic} onChange={(e) => setForm({ ...form, blood_pressure_systolic: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">BP Diastolic</label>
                  <input type="number" value={form.blood_pressure_diastolic} onChange={(e) => setForm({ ...form, blood_pressure_diastolic: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">SpO2 (%)</label>
                  <input type="number" value={form.oxygen_saturation} onChange={(e) => setForm({ ...form, oxygen_saturation: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Priority</label>
                <div className="mt-1 grid grid-cols-4 gap-2">
                  {(["emergency", "urgent", "priority", "normal"] as PriorityLevel[]).map((p) => (
                    <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })} className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${form.priority === p ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Red Flags (comma-separated)</label>
                <input type="text" value={form.red_flags} onChange={(e) => setForm({ ...form, red_flags: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" placeholder="e.g. Chest pain, Difficulty breathing" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Triage Notes</label>
                <textarea rows={2} value={form.triage_notes} onChange={(e) => setForm({ ...form, triage_notes: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
              </div>

              <button type="submit" disabled={submitting} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
                {submitting ? "Saving..." : "Complete Triage"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Select a patient to begin triage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
