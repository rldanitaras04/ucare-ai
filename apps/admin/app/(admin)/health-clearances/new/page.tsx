"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
} from "@repo/ui";
import { createHealthClearance } from "@/lib/actions/health-clearances";
import {
  CLEARANCE_TYPE_LABELS,
  type ClearanceType,
} from "@/lib/types/health-clearances";
import { searchPatients } from "@/lib/actions/patients";

const CLEARANCE_TYPE_OPTIONS = Object.entries(CLEARANCE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const DEFAULT_REQUIREMENTS: Record<ClearanceType, string[]> = {
  admission: ["Medical Exam", "Dental Exam", "Chest X-Ray", "Lab Tests"],
  annual: ["Medical Exam", "Dental Exam"],
  internship: ["Medical Exam", "Dental Exam", "Chest X-Ray"],
  sports: ["Medical Exam", "Physical Fitness Test"],
  graduation: ["Medical Exam", "Dental Exam"],
  employee: ["Medical Exam", "Dental Exam", "Lab Tests"],
  other: [],
};

export default function NewHealthClearancePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [looking, setLooking] = React.useState(false);

  const [formData, setFormData] = React.useState({
    patient_university_id: "",
    patient_id: "",
    patient_name: "",
    clearance_type: "admission" as ClearanceType,
    purpose: "",
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePatientLookup = async () => {
    const id = formData.patient_university_id.trim();
    if (!id) return;

    setLooking(true);
    setError(null);
    const { data, error: lookupError } = await searchPatients(id);
    setLooking(false);

    if (lookupError) {
      setError(lookupError);
      return;
    }

    if (!data || data.length === 0) {
      setError("No patient found with that University ID");
      setFormData((prev) => ({ ...prev, patient_id: "", patient_name: "" }));
      return;
    }

    const patient = data[0];
    setFormData((prev) => ({
      ...prev,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.patient_id) {
      setError("Please look up a valid patient first");
      setSubmitting(false);
      return;
    }

    const requirements = DEFAULT_REQUIREMENTS[formData.clearance_type].map(
      (name) => ({
        name,
        completed: false,
        date: null,
      })
    );

    const { data, error: createError } = await createHealthClearance({
      patient_id: formData.patient_id,
      clearance_type: formData.clearance_type,
      purpose: formData.purpose.trim() || undefined,
      valid_from: formData.valid_from || undefined,
      valid_until: formData.valid_until || undefined,
      requirements,
    });

    if (createError) {
      setError(createError);
      setSubmitting(false);
      return;
    }

    router.push("/health-clearances");
  };

  return (
    <Container>
      <PageHeader
        title="New Health Clearance"
        description="Create a new institutional health clearance."
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium">University ID *</label>
                <Input
                  value={formData.patient_university_id}
                  onChange={(e) =>
                    handleChange("patient_university_id", e.target.value)
                  }
                  onBlur={handlePatientLookup}
                  placeholder="e.g., 2024-00001"
                  className="mt-1 min-h-[48px]"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePatientLookup}
                  disabled={!formData.patient_university_id.trim() || looking}
                  className="min-h-[48px] w-full"
                >
                  {looking ? "Looking up..." : "Find Patient"}
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium">Patient Name</label>
                <Input
                  value={formData.patient_name}
                  placeholder="Found after lookup"
                  className="mt-1 min-h-[48px]"
                  readOnly
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clearance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Clearance Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Clearance Type *</label>
                <Select
                  value={formData.clearance_type}
                  onChange={(e) => handleChange("clearance_type", e.target.value)}
                  className="mt-1 min-h-[48px]"
                  options={CLEARANCE_TYPE_OPTIONS}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Purpose</label>
                <Input
                  value={formData.purpose}
                  onChange={(e) => handleChange("purpose", e.target.value)}
                  placeholder="e.g., Enrollment for AY 2024-2025"
                  className="mt-1 min-h-[48px]"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Valid From</label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => handleChange("valid_from", e.target.value)}
                  className="mt-1 min-h-[48px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valid Until</label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => handleChange("valid_until", e.target.value)}
                  className="mt-1 min-h-[48px]"
                />
              </div>
            </div>

            {/* Requirements Preview */}
            <div>
              <label className="text-sm font-medium">Requirements Checklist</label>
              <div className="mt-2 space-y-2">
                {DEFAULT_REQUIREMENTS[formData.clearance_type].map((req) => (
                  <div
                    key={req}
                    className="flex items-center gap-2 rounded-md border p-3"
                  >
                    <div className="h-4 w-4 rounded border-2 border-muted" />
                    <span className="text-sm">{req}</span>
                  </div>
                ))}
                {DEFAULT_REQUIREMENTS[formData.clearance_type].length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No default requirements for this clearance type.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/health-clearances")}
            className="min-h-[48px]"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="min-h-[48px]">
            {submitting ? "Creating..." : "Create Clearance"}
          </Button>
        </div>
      </form>
    </Container>
  );
}
