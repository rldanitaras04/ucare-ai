"use client";

import * as React from "react";
import { verifyDocument, type VerificationResult } from "@/lib/actions/verification";

export default function VerifyPage() {
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<VerificationResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error: verError } = await verifyDocument(code);
    setLoading(false);

    if (verError) {
      setError(verError);
    } else {
      setResult(data);
    }
  };

  const isValid = result?.is_valid ?? false;
  const isExpired = result?.valid_until ? new Date(result.valid_until) < new Date() : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Document Verification</h1>
          <p className="mt-2 text-sm text-slate-500">
            Verify the authenticity of clinic-issued certificates and health clearances.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-slate-700">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg font-mono tracking-wider shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Document"}
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className={`rounded-2xl border p-6 ${isValid && !isExpired ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <div className="flex items-center gap-3 mb-4">
              {isValid && !isExpired ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <div>
                <h2 className={`text-lg font-bold ${isValid && !isExpired ? "text-green-800" : "text-red-800"}`}>
                  {isValid && !isExpired ? "Document Verified" : "Document Invalid"}
                </h2>
                <p className={`text-sm ${isValid && !isExpired ? "text-green-600" : "text-red-600"}`}>
                  {isExpired ? "This document has expired" : isValid ? "This document is authentic and valid" : "This document could not be verified"}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-900 capitalize">{result.document_type.replace(/_/g, " ")}</span>
              </div>
              {result.document_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Number</span>
                  <span className="font-mono font-medium text-slate-900">{result.document_number}</span>
                </div>
              )}
              {result.document_title && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Title</span>
                  <span className="font-medium text-slate-900">{result.document_title}</span>
                </div>
              )}
              {result.issued_by && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Issued By</span>
                  <span className="font-medium text-slate-900">{result.issued_by}</span>
                </div>
              )}
              {result.issue_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Issue Date</span>
                  <span className="font-medium text-slate-900">{new Date(result.issue_date).toLocaleDateString()}</span>
                </div>
              )}
              {result.valid_until && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Valid Until</span>
                  <span className={`font-medium ${isExpired ? "text-red-600" : "text-slate-900"}`}>
                    {new Date(result.valid_until).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Verification Code</span>
                <span className="font-mono text-xs text-slate-600">{result.verification_code}</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-slate-400">
            University Integrated Medical & Dental Health Information System
          </p>
        </div>
      </div>
    </div>
  );
}
