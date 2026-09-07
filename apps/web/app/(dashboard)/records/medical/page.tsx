"use client";

import * as React from "react";
import { getPatients, searchPatients, type PatientProfile } from "@/lib/actions/patients";

export default function MedicalRecordsPage() {
  const [patients, setPatients] = React.useState<PatientProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedPatient, setSelectedPatient] = React.useState<PatientProfile | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = search.trim() ? await searchPatients(search) : await getPatients();
      setPatients(result.data ?? []);
      setLoading(false);
    };
    load();
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
        <p className="text-sm text-slate-500">View patient medical records and history</p>
      </div>

      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
          ) : patients.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-8 text-center"><p className="text-sm text-slate-500">No patients found</p></div>
          ) : (
            patients.map((patient) => (
              <button key={patient.id} onClick={() => setSelectedPatient(patient)} className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedPatient?.id === patient.id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                <p className="text-sm font-medium text-slate-900">{patient.last_name}, {patient.first_name}</p>
                <p className="text-xs text-slate-400">{patient.university_id}</p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-900">Patient Information</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><dt className="text-xs text-slate-400">Name</dt><dd className="text-sm text-slate-900">{selectedPatient.first_name} {selectedPatient.last_name}</dd></div>
                  <div><dt className="text-xs text-slate-400">University ID</dt><dd className="text-sm font-mono text-slate-900">{selectedPatient.university_id}</dd></div>
                  <div><dt className="text-xs text-slate-400">Blood Type</dt><dd className="text-sm text-slate-900">{selectedPatient.blood_type || "Not recorded"}</dd></div>
                  <div><dt className="text-xs text-slate-400">Contact</dt><dd className="text-sm text-slate-900">{selectedPatient.contact_number || "Not recorded"}</dd></div>
                </div>
              </div>

              {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-sm font-semibold text-red-900">Allergies</h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedPatient.allergies.map((a, i) => (
                      <span key={i} className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPatient.chronic_conditions && selectedPatient.chronic_conditions.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <h3 className="text-sm font-semibold text-amber-900">Chronic Conditions</h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedPatient.chronic_conditions.map((c, i) => (
                      <span key={i} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900">Visit History</h3>
                <p className="mt-2 text-sm text-slate-500">Consultation records and encounter history will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-center">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Select a patient to view medical records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
