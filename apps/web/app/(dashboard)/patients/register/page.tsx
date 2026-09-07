"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { registerWalkIn, searchPatientByUniversityId, type PatientProfile, type TicketData } from "@/lib/actions/walk-ins";

type ServiceType = "medical" | "dental" | "nursing" | "clearance";

export default function RegisterWalkInPage() {
  const router = useRouter();
  const [universityId, setUniversityId] = React.useState("");
  const [existingPatient, setExistingPatient] = React.useState<PatientProfile | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [serviceType, setServiceType] = React.useState<ServiceType>("medical");
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [ticket, setTicket] = React.useState<TicketData | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [sex, setSex] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");
  const [affiliation, setAffiliation] = React.useState<"student" | "faculty" | "staff" | "">("");
  const [collegeUnit, setCollegeUnit] = React.useState("");
  const [studentEmpNo, _setStudentEmpNo] = React.useState("");

  const handleSearch = async () => {
    if (!universityId.trim()) return;
    setSearching(true);
    setSearchError(null);
    setExistingPatient(null);
    const result = await searchPatientByUniversityId(universityId.trim());
    setSearching(false);
    if (result.error) {
      setSearchError(result.error);
    } else if (result.data) {
      setExistingPatient(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setFormError("Reason for visit is required");
      return;
    }
    if (!existingPatient && (!firstName.trim() || !lastName.trim())) {
      setFormError("First name and last name are required for new patients");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const result = await registerWalkIn({
      university_id: universityId.trim(),
      first_name: existingPatient?.first_name || firstName.trim(),
      last_name: existingPatient?.last_name || lastName.trim(),
      middle_name: existingPatient?.middle_name || middleName.trim() || undefined,
      sex: existingPatient?.sex || sex || undefined,
      date_of_birth: existingPatient?.date_of_birth || dob || undefined,
      contact_number: existingPatient?.contact_number || contactNumber.trim() || undefined,
      affiliation: (existingPatient?.affiliation || affiliation || undefined) as "student" | "faculty" | "staff" | undefined,
      college_unit: existingPatient?.college_unit || collegeUnit.trim() || undefined,
      student_employee_no: existingPatient?.student_employee_no || studentEmpNo.trim() || undefined,
      service_type: serviceType,
      reason_for_visit: reason.trim(),
    });

    setSubmitting(false);

    if (result.error) {
      setFormError(result.error);
    } else if (result.data) {
      setTicket(result.data);
    }
  };

  if (ticket) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-green-900">Walk-In Registered</h2>
          <p className="mt-2 text-sm text-green-700">Patient has been added to the queue.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Queue Number</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{ticket.queue.queue_number}</p>
            <p className="mt-1 text-sm text-slate-500">{ticket.queue.service_category} - {ticket.queue.priority}</p>
          </div>
          <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Patient</span>
              <span className="font-medium text-slate-900">{ticket.patient.first_name} {ticket.patient.last_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">University ID</span>
              <span className="font-mono text-slate-900">{ticket.patient.university_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Service</span>
              <span className="font-medium text-slate-900 capitalize">{ticket.visit.service_type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-medium text-slate-900 capitalize">{ticket.queue.status}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setTicket(null); setUniversityId(""); setReason(""); setExistingPatient(null); }}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Register Another
          </button>
          <button
            onClick={() => router.push("/queue/reception")}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            View Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Walk-In Registration</h1>
        <p className="text-sm text-slate-500">Register a patient walk-in visit and add them to the queue.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Patient Verification</h2>
        <div className="mt-3 flex gap-3">
          <input
            type="text"
            placeholder="Enter University ID or Employee Number"
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !universityId.trim()}
            className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
        {searchError && <p className="mt-2 text-sm text-red-600">{searchError}</p>}
        {existingPatient && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">Patient Found</p>
            <p className="text-sm text-green-700">{existingPatient.first_name} {existingPatient.last_name} ({existingPatient.university_id})</p>
          </div>
        )}
        {!existingPatient && universityId.trim() && !searching && (
          <p className="mt-3 text-sm text-slate-500">No existing patient found. Fill in details below to create a new profile.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!existingPatient && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Patient Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-500">First Name *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">Last Name *</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">Middle Name</label>
                <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">Sex</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">Contact Number</label>
                <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">Affiliation</label>
                <select value={affiliation} onChange={(e) => setAffiliation(e.target.value as "student" | "faculty" | "staff" | "")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100">
                  <option value="">Select</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">College/Unit</label>
                <input type="text" value={collegeUnit} onChange={(e) => setCollegeUnit(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Visit Details</h2>
          <div>
            <label className="block text-xs font-medium text-slate-500">Service Type *</label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["medical", "dental", "nursing", "clearance"] as ServiceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    serviceType === type
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Reason for Visit *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Describe the reason for this visit..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{formError}</div>
        )}

        <button
          type="submit"
          disabled={submitting || !reason.trim()}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? "Registering..." : "Register Walk-In"}
        </button>
      </form>
    </div>
  );
}
