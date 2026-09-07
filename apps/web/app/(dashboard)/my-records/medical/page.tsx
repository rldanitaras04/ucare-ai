"use client";

import * as React from "react";
import { getEmergencyContacts, createEmergencyContact, deleteEmergencyContact, type EmergencyContact } from "@/lib/actions/emergency-contacts";
import { getAllergies, createAllergy, type Allergy } from "@/lib/actions/allergies";
import { getMedicalHistory, type MedicalHistoryEntry } from "@/lib/actions/medical-history";

const SEVERITY_COLORS: Record<string, string> = {
  mild: "bg-green-100 text-green-700",
  moderate: "bg-amber-100 text-amber-700",
  severe: "bg-red-100 text-red-700",
  life_threatening: "bg-red-200 text-red-800",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  chronic: "bg-blue-100 text-blue-700",
  in_remission: "bg-purple-100 text-purple-700",
};

interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  blood_type: string | null;
  allergies: string[];
  chronic_conditions: string[];
}

export default function MyMedicalRecordPage() {
  const [patient, setPatient] = React.useState<PatientProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [emergencyContacts, setEmergencyContacts] = React.useState<EmergencyContact[]>([]);
  const [detailedAllergies, setDetailedAllergies] = React.useState<Allergy[]>([]);
  const [medicalHistory, setMedicalHistory] = React.useState<MedicalHistoryEntry[]>([]);

  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formName, setFormName] = React.useState("");
  const [formRelationship, setFormRelationship] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");

  const [showAllergyForm, setShowAllergyForm] = React.useState(false);
  const [allergyForm, setAllergyForm] = React.useState({
    allergen: "",
    allergen_type: "other",
    reaction: "",
    severity: "moderate",
    notes: "",
  });

  React.useEffect(() => {
    const load = async () => {
      try {
        const { createClient } = await import("@repo/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        const { data: raw } = await supabase
          .from("patient_profiles" as never)
          .select("id, first_name, last_name, blood_type, allergies, chronic_conditions")
          .eq("user_id", user.id)
          .single();
        const data = raw as PatientProfile | null;
        if (!data) {
          setLoading(false);
          return;
        }
        setPatient(data);
        const [contactsRes, allergiesRes, historyRes] = await Promise.all([
          getEmergencyContacts(data.id),
          getAllergies(data.id),
          getMedicalHistory(data.id),
        ]);
        setEmergencyContacts(contactsRes.data ?? []);
        setDetailedAllergies(allergiesRes.data ?? []);
        setMedicalHistory(historyRes.data ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !formName.trim() || !formPhone.trim()) return;
    setSubmitting(true);
    setMessage(null);
    const res = await createEmergencyContact({
      patient_id: patient.id,
      name: formName.trim(),
      relationship: formRelationship.trim() || undefined,
      phone: formPhone.trim(),
      email: formEmail.trim() || undefined,
    });
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setEmergencyContacts((prev) => [res.data!, ...prev]);
      setFormName("");
      setFormRelationship("");
      setFormPhone("");
      setFormEmail("");
      setShowForm(false);
      setMessage({ type: "success", text: "Emergency contact added." });
    }
    setSubmitting(false);
  };

  const handleDeleteContact = async (id: string) => {
    const res = await deleteEmergencyContact(id);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !allergyForm.allergen.trim()) return;
    setSubmitting(true);
    setMessage(null);
    const res = await createAllergy({
      patient_id: patient.id,
      allergen: allergyForm.allergen.trim(),
      allergen_type: allergyForm.allergen_type,
      severity: allergyForm.severity,
      reaction: allergyForm.reaction.trim() || undefined,
      notes: allergyForm.notes.trim() || undefined,
    });
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setDetailedAllergies((prev) => [res.data!, ...prev]);
      setAllergyForm({ allergen: "", allergen_type: "other", reaction: "", severity: "moderate", notes: "" });
      setShowAllergyForm(false);
      setMessage({ type: "success", text: "Allergy added." });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Medical Record</h1>
        <p className="text-sm text-slate-500">Your personal health information</p>
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
            <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">Name</dt>
                <dd className="text-sm text-slate-900">{patient.first_name} {patient.last_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Blood Type</dt>
                <dd className="text-sm text-slate-900">{patient.blood_type || "Not recorded"}</dd>
              </div>
            </div>
          </div>

          {patient.allergies && patient.allergies.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="text-sm font-semibold text-red-900">Quick Allergies</h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {patient.allergies.map((a, i) => (
                  <span key={i} className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{a}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Emergency Contacts</h3>
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                {showForm ? "Cancel" : "+ Add"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAddContact} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Relationship</label>
                    <input
                      type="text"
                      value={formRelationship}
                      onChange={(e) => setFormRelationship(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Contact"}
                </button>
              </form>
            )}

            {emergencyContacts.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No emergency contacts added.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{contact.name}</p>
                      {contact.relationship && <p className="text-xs text-slate-500">{contact.relationship}</p>}
                      <p className="mt-1 text-xs text-slate-600">{contact.phone}</p>
                      {contact.email && <p className="text-xs text-slate-600">{contact.email}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Detailed Allergies</h3>
              <button
                type="button"
                onClick={() => setShowAllergyForm(!showAllergyForm)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                {showAllergyForm ? "Cancel" : "+ Add Allergy"}
              </button>
            </div>

            {showAllergyForm && (
              <form onSubmit={handleAddAllergy} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Allergen *</label>
                    <input
                      type="text"
                      required
                      value={allergyForm.allergen}
                      onChange={(e) => setAllergyForm((p) => ({ ...p, allergen: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Type</label>
                    <select
                      value={allergyForm.allergen_type}
                      onChange={(e) => setAllergyForm((p) => ({ ...p, allergen_type: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      <option value="medication">Medication</option>
                      <option value="food">Food</option>
                      <option value="environmental">Environmental</option>
                      <option value="latex">Latex</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Severity</label>
                    <select
                      value={allergyForm.severity}
                      onChange={(e) => setAllergyForm((p) => ({ ...p, severity: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="life-threatening">Life-threatening</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Reaction</label>
                    <input
                      type="text"
                      value={allergyForm.reaction}
                      onChange={(e) => setAllergyForm((p) => ({ ...p, reaction: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Notes</label>
                  <input
                    type="text"
                    value={allergyForm.notes}
                    onChange={(e) => setAllergyForm((p) => ({ ...p, notes: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Allergy"}
                </button>
              </form>
            )}

            {detailedAllergies.length === 0 && !showAllergyForm ? (
              <p className="mt-2 text-sm text-slate-500">No detailed allergy records.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="pb-2 font-medium">Allergen</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Severity</th>
                      <th className="pb-2 font-medium">Reaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedAllergies.map((allergy) => (
                      <tr key={allergy.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 text-slate-900">{allergy.allergen}</td>
                        <td className="py-2 text-slate-600">{allergy.allergen_type}</td>
                        <td className="py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[allergy.severity] ?? "bg-slate-100 text-slate-600"}`}>
                            {allergy.severity}
                          </span>
                        </td>
                        <td className="py-2 text-slate-600">{allergy.reaction || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">Medical History</h3>
            {medicalHistory.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No medical history records.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="pb-2 font-medium">Condition</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Severity</th>
                      <th className="pb-2 font-medium">Diagnosed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalHistory.map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 text-slate-900">{entry.condition_name}</td>
                        <td className="py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status] ?? "bg-slate-100 text-slate-600"}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="py-2">
                          {entry.severity ? (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[entry.severity] ?? "bg-slate-100 text-slate-600"}`}>
                              {entry.severity}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-2 text-slate-600">{entry.diagnosis_date || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {patient.chronic_conditions && patient.chronic_conditions.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="text-sm font-semibold text-amber-900">Chronic Conditions</h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {patient.chronic_conditions.map((c, i) => (
                  <span key={i} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{c}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">Visit History</h3>
            <p className="mt-2 text-sm text-slate-500">Your consultation records will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
