"use client";

import * as React from "react";
import { getHealthClearances, createHealthClearance, updateClearanceStatus, type HealthClearance, type ClearanceType, type ClearanceStatus } from "@/lib/actions/health-clearances";
import { generateClearancePDF } from "@/lib/actions/clearance-pdf";

const TYPE_LABELS: Record<string, string> = {
  admission: "Admission",
  annual: "Annual",
  internship: "Internship / OJT",
  sports: "Sports",
  graduation: "Graduation",
  employee: "Employee",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_review: "bg-blue-100 text-blue-700",
  requires_action: "bg-orange-100 text-orange-700",
  approved: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-600",
  expired: "bg-slate-100 text-slate-500",
  cancelled: "bg-slate-100 text-slate-500",
};

export default function HealthClearancesPage() {
  const [clearances, setClearances] = React.useState<HealthClearance[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [generatingPdf, setGeneratingPdf] = React.useState<string | null>(null);
  const [verificationCode, setVerificationCode] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ patient_id: "", clearance_type: "admission" as ClearanceType, purpose: "" });

  const load = React.useCallback(async () => {
    const result = await getHealthClearances();
    setClearances(result.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result = await createHealthClearance({
      patient_id: form.patient_id,
      clearance_type: form.clearance_type,
      purpose: form.purpose || undefined,
    });
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else { setMessage({ type: "success", text: "Clearance created" }); setShowForm(false); setForm({ patient_id: "", clearance_type: "admission", purpose: "" }); await load(); }
  };

  const handleStatusUpdate = async (id: string, status: ClearanceStatus) => {
    const result = await updateClearanceStatus(id, status);
    if (result.error) setMessage({ type: "error", text: result.error });
    else {
      setMessage({ type: "success", text: "Clearance updated" });
      if (result.verification_code) setVerificationCode(result.verification_code);
      await load();
    }
  };

  const handleDownloadPDF = async (id: string, clrNumber: string) => {
    setGeneratingPdf(id);
    setMessage(null);
    const result = await generateClearancePDF(id);
    setGeneratingPdf(null);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.data) {
      const blob = new Blob([Buffer.from(result.data)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = result.filename || `${clrNumber}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Health Clearances</h1>
          <p className="text-sm text-slate-500">{clearances.length} clearance{clearances.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          {showForm ? "Cancel" : "New Clearance"}
        </button>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.text}</div>
      )}

      {verificationCode && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800">Verification Code Generated</p>
          <p className="mt-1 font-mono text-lg text-blue-900">{verificationCode}</p>
          <button onClick={() => setVerificationCode(null)} className="mt-2 text-xs text-blue-600 hover:underline">Dismiss</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">Patient ID *</label>
              <input type="text" required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="UUID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Clearance Type *</label>
              <select required value={form.clearance_type} onChange={(e) => setForm({ ...form, clearance_type: e.target.value as ClearanceType })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Purpose</label>
            <textarea rows={2} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="Purpose of clearance (optional)" />
          </div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Creating..." : "Create Clearance"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : clearances.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No health clearances</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clearances.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{TYPE_LABELS[c.clearance_type as ClearanceType] ?? c.clearance_type}</p>
                  <p className="text-xs text-slate-400">{c.clearance_number}</p>
                  {c.purpose && <p className="mt-1 text-xs text-slate-400">{c.purpose}</p>}
                  <p className="mt-1 text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-slate-100 text-slate-600"}`}>{c.status}</span>
                  {c.status === "pending" && (
                    <button onClick={() => handleStatusUpdate(c.id, "approved")} className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100">Approve</button>
                  )}
                  {c.status === "pending" && (
                    <button onClick={() => handleStatusUpdate(c.id, "denied")} className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100">Deny</button>
                  )}
                  {c.status === "approved" && (
                    <button onClick={() => handleDownloadPDF(c.id, c.clearance_number)} disabled={generatingPdf === c.id} className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50">
                      {generatingPdf === c.id ? "Generating..." : "Download PDF"}
                    </button>
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
