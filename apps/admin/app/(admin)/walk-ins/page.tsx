"use client";

import * as React from "react";
import {
  Container,
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Button,
  Badge,
  Loading,
  Alert,
  AlertDescription,
} from "@repo/ui";
import {
  searchPatientByUniversityId,
  registerWalkIn,
  type PatientProfile,
  type TicketData,
} from "./actions";

const SERVICE_OPTIONS = [
  { value: "medical", label: "Medical" },
  { value: "dental", label: "Dental" },
  { value: "nursing", label: "Nursing" },
  { value: "clearance", label: "Health Clearance" },
];

const AFFILIATION_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "staff", label: "Staff" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const SERVICE_LABELS: Record<string, string> = {
  medical: "Medical",
  dental: "Dental",
  nursing: "Nursing",
  clearance: "Health Clearance",
};

export default function WalkInRegistrationPage() {
  const [lookupId, setLookupId] = React.useState("");
  const [looking, setLooking] = React.useState(false);
  const [lookupError, setLookupError] = React.useState<string | null>(null);
  const [patient, setPatient] = React.useState<PatientProfile | null>(null);

  const [serviceType, setServiceType] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const [ticket, setTicket] = React.useState<TicketData | null>(null);

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setLooking(true);
    setLookupError(null);
    setPatient(null);
    setTicket(null);

    const { data, error } = await searchPatientByUniversityId(lookupId.trim());
    setLooking(false);

    if (error) {
      setLookupError(error);
      return;
    }

    if (data) {
      setPatient(data);
    } else {
      setLookupError("No patient found. You can register a new walk-in below.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType || !reason.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    const { data, error } = await registerWalkIn({
      university_id: lookupId.trim(),
      first_name: patient?.first_name ?? lookupId.trim(),
      last_name: patient?.last_name ?? "Walk-In",
      middle_name: patient?.middle_name ?? undefined,
      sex: patient?.sex ?? undefined,
      date_of_birth: patient?.date_of_birth ?? undefined,
      contact_number: patient?.contact_number ?? undefined,
      affiliation: patient?.affiliation ?? undefined,
      college_unit: patient?.college_unit ?? undefined,
      student_employee_no: patient?.student_employee_no ?? undefined,
      emergency_contact_name: patient?.emergency_contact_name ?? undefined,
      emergency_contact_number: patient?.emergency_contact_number ?? undefined,
      service_type: serviceType as "medical" | "dental" | "nursing" | "clearance",
      reason_for_visit: reason.trim(),
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    if (data) {
      setTicket(data);
    }
  };

  const handleReset = () => {
    setLookupId("");
    setPatient(null);
    setServiceType("");
    setReason("");
    setTicket(null);
    setLookupError(null);
    setSubmitError(null);
  };

  return (
    <Container size="lg">
      <PageHeader
        title="Walk-In Registration"
        description="Register a new walk-in patient and issue a queue ticket."
      />

      {/* Ticket Display */}
      {ticket && (
        <div className="mb-8">
          <Card className="border-2 border-success bg-success/5">
            <CardHeader className="text-center">
              <Badge variant="success" className="mx-auto w-fit text-sm">
                Registered Successfully
              </Badge>
              <CardTitle className="text-3xl">Walk-In Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Queue Number</p>
                  <p className="text-4xl font-bold tracking-wider">
                    {ticket.queue.queue_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="text-lg font-semibold">
                    {SERVICE_LABELS[ticket.queue.service_category]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <p className="text-lg font-semibold capitalize">
                    {ticket.queue.priority}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-lg font-semibold">
                    {new Date(ticket.visit.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Patient: {ticket.patient.first_name} {ticket.patient.last_name}
                </p>
                <p>ID: {ticket.patient.university_id}</p>
              </div>
              <div className="text-center">
                <Button variant="outline" size="touch" onClick={handleReset}>
                  Register Another Patient
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!ticket && (
        <div className="space-y-8">
          {/* Step 1: Lookup */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Lookup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Label htmlFor="lookup">Student / Employee ID</Label>
                  <Input
                    id="lookup"
                    placeholder="Enter ID or scan barcode..."
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    autoFocus
                  />
                </div>
                <div className="flex items-end">
                  <Button size="touch" onClick={handleLookup} disabled={looking || !lookupId.trim()}>
                    {looking ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
              {lookupError && (
                <Alert variant="info">
                  <AlertDescription>{lookupError}</AlertDescription>
                </Alert>
              )}
              {patient && (
                <div className="rounded-md border bg-muted/50 p-4">
                  <p className="font-medium">
                    {patient.first_name} {patient.middle_name} {patient.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {patient.university_id}
                    {patient.affiliation && ` \u00b7 ${patient.affiliation}`}
                    {patient.college_unit && ` \u00b7 ${patient.college_unit}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Visit Details */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="service">Service Requested</Label>
                    <Select
                      id="service"
                      options={SERVICE_OPTIONS}
                      placeholder="Select service..."
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      required
                    />
                  </div>
                  {!patient && (
                    <>
                      <div>
                        <Label htmlFor="affiliation">Affiliation</Label>
                        <Select
                          id="affiliation"
                          options={AFFILIATION_OPTIONS}
                          placeholder="Select..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="sex">Sex</Label>
                        <Select
                          id="sex"
                          options={SEX_OPTIONS}
                          placeholder="Select..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact">Contact Number</Label>
                        <Input id="contact" placeholder="09XX XXX XXXX" />
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <textarea
                    id="reason"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Brief description of symptoms or reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
                {submitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="touch"
                    disabled={submitting || !serviceType || !reason.trim()}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loading text="" /> Registering...
                      </span>
                    ) : (
                      "Issue Queue Ticket"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </Container>
  );
}
