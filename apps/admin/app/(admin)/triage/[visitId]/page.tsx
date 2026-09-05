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
  getVisitDetails,
  getNurseAvailability,
  saveTriageAssessment,
  type VisitWithPatient,
  type NurseStatus,
} from "../actions";

const RED_FLAG_OPTIONS = [
  "Chest pain",
  "Severe dyspnea",
  "Acute trauma",
  "Altered consciousness",
];

const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal", color: "bg-green-500 text-white" },
  { value: "priority", label: "Priority", color: "bg-yellow-500 text-black" },
  { value: "urgent", label: "Urgent", color: "bg-amber-500 text-white" },
  { value: "emergency", label: "Emergency", color: "bg-red-600 text-white animate-pulse" },
];

function VitalsInput({
  label,
  value,
  onChange,
  unit,
  placeholder,
  min,
  max,
  highlight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={label} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <input
          id={label}
          type="number"
          inputMode="decimal"
          className={`flex h-14 w-full rounded-md border bg-background px-3 py-2 pr-12 font-mono text-xl tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            highlight ? "border-red-500 bg-red-50 focus-visible:ring-red-500" : "border-input"
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function PainSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const getColor = (score: number) => {
    if (score <= 3) return "text-green-600";
    if (score <= 6) return "text-yellow-600";
    if (score <= 8) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Pain Score</Label>
        <span className={`font-mono text-2xl font-bold tabular-nums ${getColor(value)}`}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-red-500"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 - None</span>
        <span>5 - Moderate</span>
        <span>10 - Worst</span>
      </div>
    </div>
  );
}

function BPHighlight({
  systolic,
  diastolic,
}: {
  systolic: number | null;
  diastolic: number | null;
}) {
  if (!systolic || !diastolic) return null;

  let severity: "normal" | "elevated" | "high" | "crisis" = "normal";
  if (systolic >= 180 || diastolic >= 120) severity = "crisis";
  else if (systolic >= 140 || diastolic >= 90) severity = "high";
  else if (systolic >= 130 || diastolic >= 80) severity = "elevated";

  const colors = {
    normal: "text-green-600",
    elevated: "text-yellow-600",
    high: "text-amber-600",
    crisis: "text-red-600 font-bold",
  };

  const labels = {
    normal: "Normal",
    elevated: "Elevated",
    high: "Hypertension Stage 1",
    crisis: "Hypertensive Crisis",
  };

  return (
    <p className={`text-xs ${colors[severity]}`}>
      BP: {labels[severity]}
    </p>
  );
}

export default function TriagePage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const visitId = resolvedParams.visitId;

  const [visit, setVisit] = React.useState<VisitWithPatient | null>(null);
  const [nurseStatus, setNurseStatus] = React.useState<NurseStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const [priority, setPriority] = React.useState<string>("normal");
  const [temperatureC, setTemperatureC] = React.useState("");
  const [systolicBp, setSystolicBp] = React.useState("");
  const [diastolicBp, setDiastolicBp] = React.useState("");
  const [heartRate, setHeartRate] = React.useState("");
  const [respRate, setRespRate] = React.useState("");
  const [spo2, setSpo2] = React.useState("");
  const [painScore, setPainScore] = React.useState(0);
  const [chiefComplaint, setChiefComplaint] = React.useState("");
  const [redFlags, setRedFlags] = React.useState<string[]>([]);
  const [triageNotes, setTriageNotes] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      const [visitResult, nurseResult] = await Promise.all([
        getVisitDetails(visitId),
        getNurseAvailability(),
      ]);
      if (!cancelled) {
        if (visitResult.error) {
          setError(visitResult.error);
        } else {
          setVisit(visitResult.data);
        }
        setNurseStatus(nurseResult.data);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [visitId]);

  const isFallback = nurseStatus
    ? !nurseStatus.is_nurse_available
    : false;

  const toggleRedFlag = (flag: string) => {
    setRedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const systolic = systolicBp ? Number(systolicBp) : null;
    const diastolic = diastolicBp ? Number(diastolicBp) : null;

    const { success, error: saveError } = await saveTriageAssessment({
      visit_id: visitId,
      is_fallback: isFallback,
      fallback_reason: isFallback ? nurseStatus?.notes ?? "Nurse unavailable" : null,
      priority: priority as "emergency" | "urgent" | "priority" | "normal",
      temperature_c: temperatureC ? Number(temperatureC) : null,
      systolic_bp: systolic,
      diastolic_bp: diastolic,
      heart_rate_bpm: heartRate ? Number(heartRate) : null,
      resp_rate_cpm: respRate ? Number(respRate) : null,
      spo2_percent: spo2 ? Number(spo2) : null,
      pain_score: painScore,
      chief_complaint: chiefComplaint.trim() || null,
      red_flags: redFlags,
      triage_notes: triageNotes.trim() || null,
    });

    setSaving(false);

    if (saveError) {
      setError(saveError);
    } else if (success) {
      setSaved(true);
      setTimeout(() => router.push("/walk-ins"), 2000);
    }
  };

  if (loading) {
    return (
      <Container size="lg">
        <Loading text="Loading visit details..." />
      </Container>
    );
  }

  if (error && !visit) {
    return (
      <Container size="lg">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (saved) {
    return (
      <Container size="lg">
        <div className="flex flex-col items-center justify-center py-20">
          <Badge variant="success" className="mb-4 text-lg">Triage Saved</Badge>
          <p className="text-muted-foreground">
            Redirecting to walk-in station...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <PageHeader
        title="Triage Assessment"
        description={`Queue #${visit?.queue_number ?? "N/A"} \u00b7 ${visit?.first_name} ${visit?.last_name}`}
      />

      {/* Fallback Warning Banner */}
      {isFallback && (
        <Alert variant="warning" className="mb-6 border-2 border-amber-400 bg-amber-50">
          <AlertDescription className="font-semibold text-amber-800">
            Fallback Triage Mode Active &ndash; Operating under Clinic Staff Fallback Authorization
            Protocol.
            {nurseStatus?.notes && (
              <span className="block mt-1 text-sm font-normal text-amber-700">
                Reason: {nurseStatus.notes}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Patient Info Banner */}
      {visit && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="font-semibold">
                  {visit.first_name} {visit.middle_name} {visit.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {visit.university_id} &middot; {visit.service_type}
                </p>
              </div>
              <Badge variant="outline">{visit.visit_status}</Badge>
              {visit.reason_for_visit && (
                <p className="w-full text-sm text-muted-foreground">
                  Reason: {visit.reason_for_visit}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vitals Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Blood Pressure */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Blood Pressure</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="systolic" className="text-xs text-muted-foreground">
                      Systolic
                    </Label>
                    <div className="relative">
                      <input
                        id="systolic"
                        type="number"
                        inputMode="numeric"
                        className="flex h-14 w-full rounded-md border border-input bg-background px-3 py-2 pr-12 font-mono text-xl tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={systolicBp}
                        onChange={(e) => setSystolicBp(e.target.value)}
                        placeholder="120"
                        min={60}
                        max={300}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        mmHg
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="diastolic" className="text-xs text-muted-foreground">
                      Diastolic
                    </Label>
                    <div className="relative">
                      <input
                        id="diastolic"
                        type="number"
                        inputMode="numeric"
                        className="flex h-14 w-full rounded-md border border-input bg-background px-3 py-2 pr-12 font-mono text-xl tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={diastolicBp}
                        onChange={(e) => setDiastolicBp(e.target.value)}
                        placeholder="80"
                        min={30}
                        max={200}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        mmHg
                      </span>
                    </div>
                  </div>
                </div>
                <BPHighlight
                  systolic={systolicBp ? Number(systolicBp) : null}
                  diastolic={diastolicBp ? Number(diastolicBp) : null}
                />
              </div>

              {/* Temperature & SpO2 */}
              <div className="grid grid-cols-2 gap-4">
                <VitalsInput
                  label="Temperature"
                  value={temperatureC}
                  onChange={setTemperatureC}
                  unit="\u00b0C"
                  placeholder="36.5"
                  min={30}
                  max={45}
                  highlight={temperatureC !== "" && Number(temperatureC) >= 37.5}
                />
                <VitalsInput
                  label="SpO2"
                  value={spo2}
                  onChange={setSpo2}
                  unit="%"
                  placeholder="98"
                  min={50}
                  max={100}
                  highlight={spo2 !== "" && Number(spo2) < 94}
                />
              </div>

              {/* Heart Rate & Respiratory Rate */}
              <div className="grid grid-cols-2 gap-4">
                <VitalsInput
                  label="Heart Rate"
                  value={heartRate}
                  onChange={setHeartRate}
                  unit="bpm"
                  placeholder="72"
                  min={30}
                  max={250}
                />
                <VitalsInput
                  label="Respiratory Rate"
                  value={respRate}
                  onChange={setRespRate}
                  unit="cpm"
                  placeholder="16"
                  min={8}
                  max={60}
                />
              </div>

              {/* Pain Score */}
              <PainSlider value={painScore} onChange={setPainScore} />
            </CardContent>
          </Card>

          {/* Chief Complaint & Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="complaint">Chief Complaint</Label>
                <textarea
                  id="complaint"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Patient-reported symptoms..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Triage Notes</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Additional clinical observations..."
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority & Red Flags Panel */}
        <div className="space-y-6">
          {/* Priority Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all min-h-[48px] ${
                    priority === opt.value
                      ? "border-primary ring-2 ring-primary"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full ${opt.color}`} />
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Red Flags */}
          <Card>
            <CardHeader>
              <CardTitle>Red Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {RED_FLAG_OPTIONS.map((flag) => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => toggleRedFlag(flag)}
                  className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left text-sm transition-all min-h-[48px] ${
                    redFlags.includes(flag)
                      ? "border-red-500 bg-red-50 text-red-800"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      redFlags.includes(flag)
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-input"
                    }`}
                  >
                    {redFlags.includes(flag) && (
                      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {flag}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            className="w-full min-h-[48px] text-base"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loading text="" /> Saving...
              </span>
            ) : (
              "Save Triage Assessment"
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full min-h-[48px]"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Container>
  );
}
