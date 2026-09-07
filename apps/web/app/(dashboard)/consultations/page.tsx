"use client";

import * as React from "react";
import Link from "next/link";

export default function ConsultationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
        <p className="text-sm text-slate-500">Select a consultation type</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/consultations/medical" className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:bg-slate-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Medical Consultations</h2>
          <p className="mt-1 text-sm text-slate-500">SOAP notes, diagnosis, treatment</p>
        </Link>
        <Link href="/consultations/dental" className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:bg-slate-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
            <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Dental Consultations</h2>
          <p className="mt-1 text-sm text-slate-500">Odontogram, dental procedures, treatment</p>
        </Link>
      </div>
    </div>
  );
}
