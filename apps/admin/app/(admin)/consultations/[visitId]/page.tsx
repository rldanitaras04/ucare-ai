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
  Label,
  Button,
  Badge,
  Loading,
  Alert,
  AlertDescription,
} from "@repo/ui";
import {
  getVisitForConsultation,
  getOrCreateEncounter,
  saveSoapNotes,
  completeEncounter,
  type VisitWithTriage,
  type EncounterData,
  type SoapNotes,
} from "../actions";

const INITIAL_SOAP: SoapNotes = {
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
  diagnosis_codes: [],
  notes: "",
};

function SoapField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <textarea
        id={label}
        rows={rows}
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function VitalsSummary({
  temperature_c,
  systolic_bp,
  diastolic_bp,
  heart_rate_bpm,
  spo2_percent,
  pain_score,
}: {
  temperature_c: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate_bpm: number | null;
  spo2_percent: number | null;
  pain_score: number | null;
}) {
  const items = [
    { label: "Temp", value: temperature_c != null ? `${temperature_c}\u00b0C` : "\u2014" },
    { label: "BP", value: systolic_bp != null && diastolic_bp != null ? `${systolic_bp}/${diastolic_bp}` : "\u2014" },
    { label: "HR", value: heart_rate_bpm != null ? `${heart_rate_bpm} bpm` : "\u2014" },
    { label: "SpO2", value: spo2_percent != null ? `${spo2_percent}%` : "\u2014" },
    { label: "Pain", value: pain_score != null ? `${pain_score}/10` : "\u2014" },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-md bg-muted p-2 text-center">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="font-mono text-sm font-semibold tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function DiagnosisCodeInput({
  codes,
  onChange,
}: {
  codes: string[];
  onChange: (codes: string[]) => void;
}) {
  const [input, setInput] = React.useState("");

  const addCode = () => {
    const trimmed = input.trim().toUpperCase();
    if (trimmed && !codes.includes(trimmed)) {
      onChange([...codes, trimmed]);
      setInput("");
    }
  };

  const removeCode = (code: string) => {
    onChange(codes.filter((c) => c !== code));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="dx-code" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Diagnosis Codes
      </Label>
      <div className="flex gap-2">
        <input
          id="dx-code"
          type="text"
          className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="e.g. J06.9"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCode();
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={addCode}>
          Add
        </Button>
      </div>
      {codes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {codes.map((code) => (
            <Badge key={code} variant="secondary" className="gap-1">
              {code}
              <button
                type="button"
                onClick={() => removeCode(code)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${code}`}
              >
                &times;
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConsultationPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const visitId = resolvedParams.visitId;

  const [visit, setVisit] = React.useState<VisitWithTriage | null>(null);
  const [encounter, setEncounter] = React.useState<EncounterData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  const [soap, setSoap] = React.useState<SoapNotes>(INITIAL_SOAP);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      const [visitResult, encounterResult] = await Promise.all([
        getVisitForConsultation(visitId),
        getOrCreateEncounter(visitId),
      ]);
      if (!cancelled) {
        if (visitResult.error) {
          setError(visitResult.error);
        } else {
          setVisit(visitResult.data);
        }
        if (encounterResult.error) {
          setError(encounterResult.error);
        } else if (encounterResult.data) {
          setEncounter(encounterResult.data);
          setSoap({
            subjective: encounterResult.data.subjective ?? "",
            objective: encounterResult.data.objective ?? "",
            assessment: encounterResult.data.assessment ?? "",
            plan: encounterResult.data.plan ?? "",
            diagnosis_codes: encounterResult.data.diagnosis_codes ?? [],
            notes: encounterResult.data.notes ?? "",
          });
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [visitId]);

  const updateSoap = (field: keyof SoapNotes, value: string | string[]) => {
    setSoap((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!encounter) return;
    setSaving(true);
    setError(null);

    const { success, error: saveError } = await saveSoapNotes(encounter.encounter_id, soap);

    setSaving(false);
    if (saveError) {
      setError(saveError);
    } else if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleComplete = async () => {
    if (!encounter) return;
    setCompleting(true);
    setError(null);

    const { success, error: completeError } = await completeEncounter(encounter.encounter_id);

    setCompleting(false);
    if (completeError) {
      setError(completeError);
    } else if (success) {
      setCompleted(true);
      setTimeout(() => router.push("/walk-ins"), 2000);
    }
  };

  if (loading) {
    return (
      <Container size="xl">
        <Loading text="Loading consultation..." />
      </Container>
    );
  }

  if (error && !visit) {
    return (
      <Container size="xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (completed) {
    return (
      <Container size="xl">
        <div className="flex flex-col items-center justify-center py-20">
          <Badge variant="success" className="mb-4 text-lg">Consultation Completed</Badge>
          <p className="text-muted-foreground">
            Redirecting to walk-in station...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <PageHeader
        title="Doctor Consultation"
        description={`Queue #${visit?.queue_number ?? "N/A"} \u00b7 ${visit?.first_name} ${visit?.last_name}`}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Left: Patient & Triage (2 cols) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Identity */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-lg font-semibold">
                  {visit?.first_name} {visit?.middle_name} {visit?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {visit?.university_id}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{visit?.service_type}</Badge>
                <Badge variant="outline">{visit?.visit_status}</Badge>
              </div>
              {visit?.reason_for_visit && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Reason for Visit</p>
                  <p className="text-sm">{visit.reason_for_visit}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Triage Vitals */}
          <Card>
            <CardHeader>
              <CardTitle>Triage Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <VitalsSummary
                temperature_c={visit?.temperature_c ?? null}
                systolic_bp={visit?.systolic_bp ?? null}
                diastolic_bp={visit?.diastolic_bp ?? null}
                heart_rate_bpm={visit?.heart_rate_bpm ?? null}
                spo2_percent={visit?.spo2_percent ?? null}
                pain_score={visit?.pain_score ?? null}
              />
              {visit?.chief_complaint && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Chief Complaint</p>
                  <p className="text-sm">{visit.chief_complaint}</p>
                </div>
              )}
              {visit?.red_flags && visit.red_flags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Red Flags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {visit.red_flags.map((flag) => (
                      <Badge key={flag} variant="destructive">{flag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {visit?.priority_level && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Priority</p>
                  <Badge
                    variant={
                      visit.priority_level === "emergency"
                        ? "destructive"
                        : visit.priority_level === "urgent"
                          ? "warning"
                          : "outline"
                    }
                  >
                    {visit.priority_level}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right: SOAP Notes (3 cols) ── */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes (SOAP)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SoapField
                label="Subjective"
                value={soap.subjective}
                onChange={(v) => updateSoap("subjective", v)}
                placeholder="Patient-reported symptoms, history, concerns..."
                rows={4}
              />
              <SoapField
                label="Objective"
                value={soap.objective}
                onChange={(v) => updateSoap("objective", v)}
                placeholder="Physical examination findings, measurable data..."
                rows={4}
              />
              <SoapField
                label="Assessment"
                value={soap.assessment}
                onChange={(v) => updateSoap("assessment", v)}
                placeholder="Clinical impression, differential diagnosis..."
                rows={4}
              />
              <SoapField
                label="Plan"
                value={soap.plan}
                onChange={(v) => updateSoap("plan", v)}
                placeholder="Treatment plan, prescriptions, follow-up, referrals..."
                rows={4}
              />
              <DiagnosisCodeInput
                codes={soap.diagnosis_codes}
                onChange={(codes) => updateSoap("diagnosis_codes", codes)}
              />
              <SoapField
                label="Additional Notes"
                value={soap.notes}
                onChange={(v) => updateSoap("notes", v)}
                placeholder="Any other clinical notes..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 min-h-[48px] text-base"
              onClick={handleSave}
              disabled={saving || completing}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loading text="" /> Saving...
                </span>
              ) : saved ? (
                "Saved!"
              ) : (
                "Save Draft"
              )}
            </Button>
            <Button
              className="flex-1 min-h-[48px] text-base"
              onClick={handleComplete}
              disabled={saving || completing}
            >
              {completing ? (
                <span className="flex items-center gap-2">
                  <Loading text="" /> Completing...
                </span>
              ) : (
                "Complete Consultation"
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full min-h-[44px]"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>
      </div>
    </Container>
  );
}
