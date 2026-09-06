"use client";

import { useState } from "react";
import { recordBreakGlassAccess } from "@/lib/actions/break-glass";

interface BreakGlassModalProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BreakGlassModal({ patientId, patientName, isOpen, onClose, onSuccess }: BreakGlassModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError("Please provide a detailed justification (minimum 10 characters)");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: err } = await recordBreakGlassAccess({
      patient_id: patientId,
      reason: reason.trim(),
    });

    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setReason("");
      }, 2000);
    }
  };

  const handleClose = () => {
    setReason("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const PRESET_REASONS = [
    "Unconscious/Incapacitated patient requiring immediate treatment",
    "Critical life-threatening triage situation",
    "Emergency resuscitation in progress",
    "Patient unable to provide consent - life-threatening condition",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-red-900/20 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl border-2 border-red-500 bg-background shadow-2xl">
        <div className="border-b border-red-500/30 bg-red-500/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-700">Break-Glass Emergency Access</h2>
              <p className="text-sm text-muted-foreground">This action is logged and will be audited</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          {success ? (
            <div className="flex flex-col items-center py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-3 font-medium">Emergency Access Granted</p>
              <p className="text-sm text-muted-foreground">Full EMR access for {patientName}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                You are requesting full EMR access for patient <strong>{patientName}</strong>.
                This action requires a mandatory justification and will be permanently logged.
              </p>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Quick Select Reason</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_REASONS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setReason(preset)}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                        reason === preset ? "border-red-500 bg-red-50 text-red-700" : "hover:bg-muted"
                      }`}
                    >
                      {preset.length > 40 ? preset.substring(0, 40) + "..." : preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="block text-sm font-medium">
                  Justification Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError(null);
                  }}
                  rows={3}
                  placeholder="Describe the emergency situation requiring full EMR access..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <p className="text-[10px] text-muted-foreground">Minimum 10 characters required</p>
              </div>

              {error && (
                <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}
            </>
          )}
        </div>

        {!success && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <button
              onClick={handleClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || reason.trim().length < 10}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Granting Access..." : "Grant Emergency Access"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
