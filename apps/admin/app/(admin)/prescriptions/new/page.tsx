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
  Badge,
} from "@repo/ui";
import {
  createPrescription,
  ROUTE_LABELS,
  FREQUENCY_LABELS,
  type MedicationRoute,
  type MedicationFrequency,
  type PrescriptionType,
} from "@/lib/actions/prescriptions";

const ROUTE_OPTIONS = Object.entries(ROUTE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const FREQUENCY_OPTIONS = Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    patient_university_id: "",
    patient_name: "",
    prescription_type: "medical" as PrescriptionType,
    medication_name: "",
    medication_strength: "",
    dose: "",
    route: "oral" as MedicationRoute,
    frequency: "once_daily" as MedicationFrequency,
    frequency_custom: "",
    duration_days: "",
    quantity: "",
    instructions: "",
  });

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate required fields
    if (!formData.patient_university_id.trim()) {
      setError("Patient University ID is required");
      setSubmitting(false);
      return;
    }
    if (!formData.medication_name.trim()) {
      setError("Medication name is required");
      setSubmitting(false);
      return;
    }
    if (!formData.dose.trim()) {
      setError("Dose is required");
      setSubmitting(false);
      return;
    }

    // For now, we'll use a placeholder patient_id since we don't have patient lookup
    // In production, this should search for the patient first
    const { data, error: createError } = await createPrescription({
      patient_id: "placeholder", // TODO: Replace with actual patient lookup
      prescription_type: formData.prescription_type,
      medication_name: formData.medication_name.trim(),
      medication_strength: formData.medication_strength.trim() || undefined,
      dose: formData.dose.trim(),
      route: formData.route,
      frequency: formData.frequency,
      frequency_custom: formData.frequency_custom.trim() || undefined,
      duration_days: formData.duration_days ? parseInt(formData.duration_days) : undefined,
      quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
      instructions: formData.instructions.trim() || undefined,
    });

    if (createError) {
      setError(createError);
      setSubmitting(false);
      return;
    }

    router.push("/prescriptions");
  };

  return (
    <Container>
      <PageHeader
        title="New Prescription"
        description="Create a new medical or dental prescription."
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">University ID</label>
                <Input
                  value={formData.patient_university_id}
                  onChange={(e) => handleChange("patient_university_id", e.target.value)}
                  placeholder="e.g., 2024-00001"
                  className="mt-1 min-h-[48px]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Patient Name</label>
                <Input
                  value={formData.patient_name}
                  onChange={(e) => handleChange("patient_name", e.target.value)}
                  placeholder="Auto-filled after lookup"
                  className="mt-1 min-h-[48px]"
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescription Type */}
        <Card>
          <CardHeader>
            <CardTitle>Prescription Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={formData.prescription_type === "medical" ? "default" : "outline"}
                onClick={() => handleChange("prescription_type", "medical")}
                className="min-h-[48px]"
              >
                Medical
              </Button>
              <Button
                type="button"
                variant={formData.prescription_type === "dental" ? "default" : "outline"}
                onClick={() => handleChange("prescription_type", "dental")}
                className="min-h-[48px]"
              >
                Dental
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medication Details */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Medication Name *</label>
                <Input
                  value={formData.medication_name}
                  onChange={(e) => handleChange("medication_name", e.target.value)}
                  placeholder="e.g., Amoxicillin"
                  className="mt-1 min-h-[48px]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Strength</label>
                <Input
                  value={formData.medication_strength}
                  onChange={(e) => handleChange("medication_strength", e.target.value)}
                  placeholder="e.g., 500mg"
                  className="mt-1 min-h-[48px]"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Dose *</label>
                <Input
                  value={formData.dose}
                  onChange={(e) => handleChange("dose", e.target.value)}
                  placeholder="e.g., 1 tablet"
                  className="mt-1 min-h-[48px]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Route</label>
                <Select
                  value={formData.route}
                  onChange={(e) => handleChange("route", e.target.value)}
                  className="mt-1 min-h-[48px]"
                  options={ROUTE_OPTIONS}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <Select
                  value={formData.frequency}
                  onChange={(e) => handleChange("frequency", e.target.value)}
                  className="mt-1 min-h-[48px]"
                  options={FREQUENCY_OPTIONS}
                />
              </div>
              {formData.frequency === "other" && (
                <div>
                  <label className="text-sm font-medium">Custom Frequency</label>
                  <Input
                    value={formData.frequency_custom}
                    onChange={(e) => handleChange("frequency_custom", e.target.value)}
                    placeholder="e.g., Every other day"
                    className="mt-1 min-h-[48px]"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Duration (days)</label>
                <Input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => handleChange("duration_days", e.target.value)}
                  placeholder="e.g., 7"
                  className="mt-1 min-h-[48px]"
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="e.g., 21"
                  className="mt-1 min-h-[48px]"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => handleChange("instructions", e.target.value)}
                placeholder="e.g., Take with food. Avoid dairy products."
                className="mt-1 min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/prescriptions")}
            className="min-h-[48px]"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="min-h-[48px]">
            {submitting ? "Creating..." : "Create Prescription"}
          </Button>
        </div>
      </form>
    </Container>
  );
}
