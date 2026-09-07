"use client";

import * as React from "react";
import { getPrescriptions, createPrescription, updatePrescriptionStatus, deletePrescription, type PrescriptionWithDetails } from "@/lib/actions/prescriptions";

type PrescriptionType = "medical" | "dental";
type MedicationRoute = "oral" | "topical" | "intravenous" | "intramuscular" | "subcutaneous" | "inhalation" | "rectal" | "ophthalmic" | "otic" | "nasal" | "sublingual" | "transdermal" | "other";
type MedicationFrequency = "once_daily" | "twice_daily" | "three_times_daily" | "four_times_daily" | "every_4_hours" | "every_6_hours" | "every_8_hours" | "every_12_hours" | "as_needed" | "at_bedtime" | "with_meals" | "other";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  signed: "bg-blue-100 text-blue-700",
  issued: "bg-amber-100 text-amber-700",
  dispensed: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = React.useState({
    patient_id: "",
    prescription_type: "medical" as PrescriptionType,
    medication_name: "",
    medication_strength: "",
    dose: "",
    route: "oral" as MedicationRoute,
    frequency: "once_daily" as MedicationFrequency,
    duration_days: "",
    quantity: "",
    instructions: "",
  });
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    const result = await getPrescriptions();
    setPrescriptions(result.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result = await createPrescription({
      patient_id: form.patient_id,
      prescription_type: form.prescription_type,
      medication_name: form.medication_name,
      medication_strength: form.medication_strength || undefined,
      dose: form.dose,
      route: form.route,
      frequency: form.frequency,
      duration_days: form.duration_days ? parseInt(form.duration_days) : undefined,
      quantity: form.quantity ? parseInt(form.quantity) : undefined,
      instructions: form.instructions || undefined,
    });
    setSubmitting(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Prescription created" });
      setShowForm(false);
      setForm({ patient_id: "", prescription_type: "medical", medication_name: "", medication_strength: "", dose: "", route: "oral", frequency: "once_daily", duration_days: "", quantity: "", instructions: "" });
      load();
    }
  };

  const handleStatus = async (id: string, status: string) => {
    const result = await updatePrescriptionStatus(id, status as never);
    if (result.error) setMessage({ type: "error", text: result.error });
    else { setMessage({ type: "success", text: `Prescription ${status}` }); load(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this draft prescription?")) return;
    const result = await deletePrescription(id);
    if (result.error) setMessage({ type: "error", text: result.error });
    else { setMessage({ type: "success", text: "Prescription deleted" }); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prescriptions</h1>
          <p className="text-sm text-slate-500">{prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Prescription
        </button>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">New Prescription</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">Patient ID *</label>
              <input type="text" required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Type *</label>
              <select value={form.prescription_type} onChange={(e) => setForm({ ...form, prescription_type: e.target.value as PrescriptionType })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100">
                <option value="medical">Medical</option>
                <option value="dental">Dental</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Medication *</label>
              <input type="text" required value={form.medication_name} onChange={(e) => setForm({ ...form, medication_name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Strength</label>
              <input type="text" value={form.medication_strength} onChange={(e) => setForm({ ...form, medication_strength: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Dose *</label>
              <input type="text" required value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Route</label>
              <select value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value as MedicationRoute })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100">
                <option value="oral">Oral</option>
                <option value="intravenous">IV</option>
                <option value="intramuscular">IM</option>
                <option value="subcutaneous">SC</option>
                <option value="topical">Topical</option>
                <option value="inhalation">Inhalation</option>
                <option value="rectal">Rectal</option>
                <option value="ophthalmic">Ophthalmic</option>
                <option value="otic">Otic</option>
                <option value="nasal">Nasal</option>
                <option value="sublingual">Sublingual</option>
                <option value="transdermal">Transdermal</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
              {submitting ? "Creating..." : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{rx.medication_name}</p>
                    {rx.medication_strength && <span className="text-xs text-slate-400">{rx.medication_strength}</span>}
                  </div>
                  <p className="text-xs text-slate-500">
                    {rx.dose} · {rx.route} · {rx.frequency.replace(/_/g, " ")}
                  </p>
                  {rx.patient && (
                    <p className="mt-1 text-xs text-slate-400">{rx.patient.first_name} {rx.patient.last_name} ({rx.patient.university_id})</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[rx.status]}`}>{rx.status}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 capitalize">{rx.prescription_type}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {rx.status === "draft" && (
                  <>
                    <button onClick={() => handleStatus(rx.id, "signed")} className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600">Sign</button>
                    <button onClick={() => handleDelete(rx.id)} className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-200">Delete</button>
                  </>
                )}
                {rx.status === "signed" && (
                  <button onClick={() => handleStatus(rx.id, "issued")} className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600">Issue</button>
                )}
                {rx.status === "issued" && (
                  <button onClick={() => handleStatus(rx.id, "dispensed")} className="rounded-lg bg-purple-500 px-3 py-1 text-xs font-medium text-white hover:bg-purple-600">Dispense</button>
                )}
                {rx.status === "dispensed" && (
                  <button onClick={() => handleStatus(rx.id, "completed")} className="rounded-lg bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600">Complete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
