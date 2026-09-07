"use client";

import * as React from "react";
import { getCertificates, createCertificate, issueCertificate, type Certificate } from "@/lib/actions/certificates";
import { generateCertificatePDF } from "@/lib/actions/certificate-pdf";

const CERT_TYPES = ["medical_certificate", "dental_certificate", "referral_letter", "treatment_summary", "other"];

const TYPE_LABELS: Record<string, string> = {
  medical_certificate: "Medical Certificate",
  dental_certificate: "Dental Certificate",
  referral_letter: "Referral Letter",
  treatment_summary: "Treatment Summary",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700",
  issued: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [generating, setGenerating] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [verificationCode, setVerificationCode] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ patient_id: "", certificate_type: "medical_certificate", title: "", content: "", valid_until: "" });

  const load = React.useCallback(async () => {
    const result = await getCertificates();
    setCertificates(result.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result = await createCertificate({
      patient_id: form.patient_id,
      certificate_type: form.certificate_type,
      title: form.title,
      content: form.content,
      valid_until: form.valid_until || undefined,
    });
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else { setMessage({ type: "success", text: "Certificate created as draft" }); setShowForm(false); setForm({ patient_id: "", certificate_type: "medical_certificate", title: "", content: "", valid_until: "" }); await load(); }
  };

  const handleIssue = async (id: string) => {
    setMessage(null);
    const result = await issueCertificate(id);
    if (result.error) setMessage({ type: "error", text: result.error });
    else {
      setMessage({ type: "success", text: "Certificate issued" });
      if (result.verification_code) setVerificationCode(result.verification_code);
      await load();
    }
  };

  const handleDownloadPDF = async (id: string, certNumber: string) => {
    setGenerating(id);
    setMessage(null);
    const result = await generateCertificatePDF(id);
    setGenerating(null);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.data) {
      const blob = new Blob([Buffer.from(result.data)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = result.filename || `${certNumber}.pdf`;
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
          <h1 className="text-2xl font-bold text-slate-900">Certificates</h1>
          <p className="text-sm text-slate-500">{certificates.length} certificate{certificates.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          {showForm ? "Cancel" : "New Certificate"}
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
              <label className="block text-xs font-medium text-slate-500">Certificate Type *</label>
              <select required value={form.certificate_type} onChange={(e) => setForm({ ...form, certificate_type: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
                {CERT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="Certificate title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Content *</label>
            <textarea rows={4} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="Certificate content..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Valid Until</label>
            <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" />
          </div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Creating..." : "Create Certificate"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : certificates.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No certificates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-400">{c.certificate_number}</p>
                  <p className="mt-1 text-xs text-slate-400">{TYPE_LABELS[c.certificate_type] ?? c.certificate_type}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-slate-100 text-slate-600"}`}>{c.status}</span>
                  {c.status === "draft" && (
                    <button onClick={() => handleIssue(c.id)} className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100">Issue</button>
                  )}
                  {c.status === "issued" && (
                    <button onClick={() => handleDownloadPDF(c.id, c.certificate_number)} disabled={generating === c.id} className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50">
                      {generating === c.id ? "Generating..." : "Download PDF"}
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
