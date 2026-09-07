"use client";

import * as React from "react";
import { getVisitsForConsultation, getOrCreateEncounter, saveSoapNotes, completeEncounter, type VisitWithTriage, type EncounterData } from "@/lib/actions/consultations";

export default function MedicalConsultationsPage() {
  const [visits, setVisits] = React.useState<VisitWithTriage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedVisit, setSelectedVisit] = React.useState<VisitWithTriage | null>(null);
  const [encounter, setEncounter] = React.useState<EncounterData | null>(null);
  const [soap, setSoap] = React.useState({ subjective: "", objective: "", assessment: "", plan: "", diagnosis_codes: [] as string[], notes: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const result = await getVisitsForConsultation();
      setVisits(result.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleSelectVisit = async (visit: VisitWithTriage) => {
    setSelectedVisit(visit);
    setMessage(null);
    const result = await getOrCreateEncounter(visit.visit_id);
    if (result.data) {
      setEncounter(result.data);
      setSoap({
        subjective: result.data.subjective || "",
        objective: result.data.objective || "",
        assessment: result.data.assessment || "",
        plan: result.data.plan || "",
        diagnosis_codes: result.data.diagnosis_codes || [],
        notes: result.data.notes || "",
      });
    }
  };

  const handleSave = async () => {
    if (!encounter) return;
    setSubmitting(true);
    const result = await saveSoapNotes(encounter.encounter_id, soap);
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else setMessage({ type: "success", text: "SOAP notes saved" });
  };

  const handleComplete = async () => {
    if (!encounter) return;
    if (!confirm("Complete this consultation?")) return;
    setSubmitting(true);
    const result = await completeEncounter(encounter.encounter_id);
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else {
      setMessage({ type: "success", text: "Consultation completed" });
      setSelectedVisit(null);
      setEncounter(null);
      setVisits((prev) => prev.filter((v) => v.visit_id !== selectedVisit?.visit_id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medical Consultations</h1>
        <p className="text-sm text-slate-500">{visits.length} patient{visits.length !== 1 ? "s" : ""} ready for consultation</p>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900">Patients Ready</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
          ) : visits.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-8 text-center"><p className="text-sm text-slate-500">No patients waiting</p></div>
          ) : (
            visits.map((visit) => (
              <button key={visit.visit_id} onClick={() => handleSelectVisit(visit)} className={`w-full rounded-xl border p-4 text-left transition-colors ${selectedVisit?.visit_id === visit.visit_id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                <p className="text-sm font-medium text-slate-900">{visit.first_name} {visit.last_name}</p>
                <p className="text-xs text-slate-400">{visit.university_id}</p>
                {visit.reason_for_visit && <p className="mt-1 text-xs text-slate-500 truncate">{visit.reason_for_visit}</p>}
                <div className="mt-2 flex gap-1">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 capitalize">{visit.service_type}</span>
                  {visit.queue_number && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{visit.queue_number}</span>}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedVisit ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">SOAP Notes</h2>
                <p className="text-xs text-slate-500">{selectedVisit.first_name} {selectedVisit.last_name} ({selectedVisit.university_id})</p>
              </div>
              {(["subjective", "objective", "assessment", "plan"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">{field}</label>
                  <textarea rows={3} value={soap[field]} onChange={(e) => setSoap({ ...soap, [field]: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
              ))}
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Notes"}
                </button>
                <button onClick={handleComplete} disabled={submitting} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                  Complete Consultation
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-center">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Select a patient to begin consultation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
