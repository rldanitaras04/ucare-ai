"use client";

import * as React from "react";
import { getVisitsForDental, getOrCreateDentalEncounter, saveOdontogramEntries, saveDentalFindings, completeDentalEncounter, type DentalVisitData, type DentalEncounterData } from "@/lib/actions/dental";

const TEETH = [
  { number: 11, label: "11" }, { number: 12, label: "12" }, { number: 13, label: "13" },
  { number: 14, label: "14" }, { number: 15, label: "15" }, { number: 16, label: "16" },
  { number: 17, label: "17" }, { number: 18, label: "18" },
  { number: 21, label: "21" }, { number: 22, label: "22" }, { number: 23, label: "23" },
  { number: 24, label: "24" }, { number: 25, label: "25" }, { number: 26, label: "26" },
  { number: 27, label: "27" }, { number: 28, label: "28" },
  { number: 31, label: "31" }, { number: 32, label: "32" }, { number: 33, label: "33" },
  { number: 34, label: "34" }, { number: 35, label: "35" }, { number: 36, label: "36" },
  { number: 37, label: "37" }, { number: 38, label: "38" },
  { number: 41, label: "41" }, { number: 42, label: "42" }, { number: 43, label: "43" },
  { number: 44, label: "44" }, { number: 45, label: "45" }, { number: 46, label: "46" },
  { number: 47, label: "47" }, { number: 48, label: "48" },
];

const CONDITIONS = ["sound", "caries", "restored", "missing", "crown", "extraction_indicated"] as const;
const CONDITION_COLORS: Record<string, string> = {
  sound: "bg-green-100 border-green-300 text-green-800",
  caries: "bg-red-100 border-red-300 text-red-800",
  restored: "bg-blue-100 border-blue-300 text-blue-800",
  missing: "bg-slate-200 border-slate-400 text-slate-600",
  crown: "bg-purple-100 border-purple-300 text-purple-800",
  extraction_indicated: "bg-orange-100 border-orange-300 text-orange-800",
};

export default function DentalConsultationsPage() {
  const [visits, setVisits] = React.useState<DentalVisitData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedVisit, setSelectedVisit] = React.useState<DentalVisitData | null>(null);
  const [encounter, setEncounter] = React.useState<DentalEncounterData | null>(null);
  const [odontogram, setOdontogram] = React.useState<Record<number, string>>({});
  const [findings, setFindings] = React.useState({ examination_notes: "", diagnosis: "", treatment_plan: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const result = await getVisitsForDental();
      setVisits(result.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleSelectVisit = async (visit: DentalVisitData) => {
    setSelectedVisit(visit);
    setMessage(null);
    const result = await getOrCreateDentalEncounter(visit.visit_id);
    if (result.data) {
      setEncounter(result.data);
      setFindings({
        examination_notes: result.data.examination_notes || "",
        diagnosis: result.data.diagnosis || "",
        treatment_plan: result.data.treatment_plan || "",
      });
    }
  };

  const handleSaveOdontogram = async () => {
    if (!encounter || !selectedVisit) return;
    setSubmitting(true);
    const entries = Object.entries(odontogram)
      .filter(([, condition]) => condition !== "sound")
      .map(([tooth, condition]) => ({
        tooth_number: parseInt(tooth),
        surface: "occlusal" as const,
        condition: condition as "caries" | "restored" | "missing" | "crown" | "extraction_indicated",
      }));
    const result = await saveOdontogramEntries({
      encounter_id: encounter.encounter_id,
      patient_id: encounter.patient_id,
      entries,
    });
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else setMessage({ type: "success", text: "Odontogram saved" });
  };

  const handleSaveFindings = async () => {
    if (!encounter) return;
    setSubmitting(true);
    const result = await saveDentalFindings({
      encounter_id: encounter.encounter_id,
      examination_notes: findings.examination_notes,
      diagnosis: findings.diagnosis,
      treatment_plan: findings.treatment_plan,
    });
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else setMessage({ type: "success", text: "Findings saved" });
  };

  const handleComplete = async () => {
    if (!encounter) return;
    if (!confirm("Complete this dental consultation?")) return;
    setSubmitting(true);
    const result = await completeDentalEncounter(encounter.encounter_id);
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else {
      setMessage({ type: "success", text: "Dental consultation completed" });
      setSelectedVisit(null);
      setEncounter(null);
      setVisits((prev) => prev.filter((v) => v.visit_id !== selectedVisit?.visit_id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dental Consultations</h1>
        <p className="text-sm text-slate-500">{visits.length} patient{visits.length !== 1 ? "s" : ""} ready for dental consultation</p>
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
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedVisit ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-900">Odontogram</h2>
                  <button onClick={handleSaveOdontogram} disabled={submitting} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                    Save Odontogram
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {TEETH.map((tooth) => (
                    <button
                      key={tooth.number}
                      onClick={() => setOdontogram((prev) => {
                        const current = prev[tooth.number] || "sound";
                        const idx = CONDITIONS.indexOf(current as typeof CONDITIONS[number]);
                        const next = CONDITIONS[(idx + 1) % CONDITIONS.length];
                        return { ...prev, [tooth.number]: next };
                      })}
                      className={`h-10 w-10 rounded-lg border text-xs font-medium transition-colors ${CONDITION_COLORS[odontogram[tooth.number] || "sound"]}`}
                      title={odontogram[tooth.number] || "sound"}
                    >
                      {tooth.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <span key={c} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${CONDITION_COLORS[c]}`}>
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {c.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">Findings</h2>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Examination Notes</label>
                  <textarea rows={3} value={findings.examination_notes} onChange={(e) => setFindings({ ...findings, examination_notes: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Diagnosis</label>
                  <textarea rows={2} value={findings.diagnosis} onChange={(e) => setFindings({ ...findings, diagnosis: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Treatment Plan</label>
                  <textarea rows={2} value={findings.treatment_plan} onChange={(e) => setFindings({ ...findings, treatment_plan: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSaveFindings} disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                    Save Findings
                  </button>
                  <button onClick={handleComplete} disabled={submitting} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                    Complete Consultation
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-center">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Select a patient to begin dental consultation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
