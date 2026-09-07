"use client";

import * as React from "react";
import { getPatients, searchPatients, type PatientProfile } from "@/lib/actions/patients";

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

const CONDITION_COLORS: Record<string, string> = {
  sound: "bg-green-100 border-green-300 text-green-800",
  caries: "bg-red-100 border-red-300 text-red-800",
  restored: "bg-blue-100 border-blue-300 text-blue-800",
  missing: "bg-slate-200 border-slate-400 text-slate-600",
  crown: "bg-purple-100 border-purple-300 text-purple-800",
  extraction_indicated: "bg-orange-100 border-orange-300 text-orange-800",
};

export default function DentalRecordsPage() {
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
        <h1 className="text-2xl font-bold text-slate-900">Dental Records & Charting</h1>
        <p className="text-sm text-slate-500">View patient dental records and odontogram history</p>
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
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900">Odontogram (Read-Only)</h3>
                <p className="mt-1 text-xs text-slate-500">Historical dental chart. Consultation records will appear here.</p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {TEETH.map((tooth) => (
                    <div key={tooth.number} className="h-10 w-10 rounded-lg border bg-green-100 border-green-300 text-green-800 flex items-center justify-center text-xs font-medium">
                      {tooth.label}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(CONDITION_COLORS).map(([condition, classes]) => (
                    <span key={condition} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${classes}`}>
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {condition.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900">Dental Visit History</h3>
                <p className="mt-2 text-sm text-slate-500">Dental consultation records and treatment history will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-center">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Select a patient to view dental records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
