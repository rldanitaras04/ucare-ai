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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Odontogram,
  CONDITION_COLORS,
  CONDITION_LABELS,
  SURFACE_LABELS,
  type ToothCondition,
  type ToothSurface,
  type OdontogramEntry,
} from "@repo/ui";
import {
  getDentalVisit,
  getOrCreateDentalEncounter,
  getOdontogramEntries,
  saveOdontogramEntries,
  saveDentalFindings,
  completeDentalEncounter,
  type DentalVisitData,
  type DentalEncounterData,
} from "../actions";

interface FindingsState {
  examination_notes: string;
  diagnosis: string;
  treatment_plan: string;
}

const INITIAL_FINDINGS: FindingsState = {
  examination_notes: "",
  diagnosis: "",
  treatment_plan: "",
};

function ProcedureLog({ entries }: { entries: OdontogramEntry[] }) {
  const nonSound = entries.filter((e) => e.condition !== "sound");

  if (nonSound.length === 0) {
    return (
      <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
        No findings charted yet. Click teeth on the odontogram to record conditions.
      </div>
    );
  }

  // Group by tooth
  const byTooth = new Map<number, OdontogramEntry[]>();
  for (const entry of nonSound) {
    const list = byTooth.get(entry.tooth_number) ?? [];
    list.push(entry);
    byTooth.set(entry.tooth_number, list);
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tooth</TableHead>
            <TableHead>Surface</TableHead>
            <TableHead>Condition</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nonSound.map((entry, i) => (
            <TableRow key={`${entry.tooth_number}-${entry.surface}-${i}`}>
              <TableCell className="font-mono font-semibold">
                {entry.tooth_number}
              </TableCell>
              <TableCell>{SURFACE_LABELS[entry.surface]}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: CONDITION_COLORS[entry.condition] }}
                  />
                  {CONDITION_LABELS[entry.condition]}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function DentalWorkspacePage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const visitId = resolvedParams.visitId;

  const [visit, setVisit] = React.useState<DentalVisitData | null>(null);
  const [encounter, setEncounter] = React.useState<DentalEncounterData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  const [activeTool, setActiveTool] = React.useState<ToothCondition>("caries");
  const [odontogramEntries, setOdontogramEntries] = React.useState<OdontogramEntry[]>([]);
  const [findings, setFindings] = React.useState<FindingsState>(INITIAL_FINDINGS);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      const [visitResult, encounterResult] = await Promise.all([
        getDentalVisit(visitId),
        getOrCreateDentalEncounter(visitId),
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
          setFindings({
            examination_notes: encounterResult.data.examination_notes ?? "",
            diagnosis: encounterResult.data.diagnosis ?? "",
            treatment_plan: encounterResult.data.treatment_plan ?? "",
          });

          // Load existing odontogram entries
          const entriesResult = await getOdontogramEntries(encounterResult.data.encounter_id);
          if (!cancelled && entriesResult.data) {
            setOdontogramEntries(
              entriesResult.data.map((e) => ({
                tooth_number: e.tooth_number,
                surface: e.surface as ToothSurface,
                condition: e.condition as ToothCondition,
              }))
            );
          }
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [visitId]);

  const updateFindings = (field: keyof FindingsState, value: string) => {
    setFindings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!encounter) return;
    setSaving(true);
    setError(null);

    // Save odontogram
    const odontogramResult = await saveOdontogramEntries({
      encounter_id: encounter.encounter_id,
      patient_id: encounter.patient_id,
      entries: odontogramEntries.map((e) => ({
        tooth_number: e.tooth_number,
        surface: e.surface as "mesial" | "distal" | "occlusal" | "buccal" | "lingual",
        condition: e.condition as "sound" | "caries" | "restored" | "missing" | "crown" | "extraction_indicated",
      })),
    });

    if (odontogramResult.error) {
      setSaving(false);
      setError(odontogramResult.error);
      return;
    }

    // Save findings
    const findingsResult = await saveDentalFindings({
      encounter_id: encounter.encounter_id,
      ...findings,
    });

    setSaving(false);

    if (findingsResult.error) {
      setError(findingsResult.error);
    } else if (findingsResult.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleComplete = async () => {
    if (!encounter) return;
    setCompleting(true);
    setError(null);

    // Save first
    await handleSave();

    const { success, error: completeError } = await completeDentalEncounter(encounter.encounter_id);

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
        <Loading text="Loading dental workspace..." />
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
          <Badge variant="success" className="mb-4 text-lg">Dental Encounter Completed</Badge>
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
        title="Dental Workspace"
        description={`Queue #${visit?.queue_number ?? "N/A"} \u00b7 ${visit?.first_name} ${visit?.last_name}`}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Left: Patient Identity (1 col) ── */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient</CardTitle>
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
              </div>
              {visit?.reason_for_visit && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Reason</p>
                  <p className="text-sm">{visit.reason_for_visit}</p>
                </div>
              )}
              {visit?.chief_complaint && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Chief Complaint</p>
                  <p className="text-sm">{visit.chief_complaint}</p>
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

        {/* ── Center: Odontogram (3 cols) ── */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Odontogram</CardTitle>
            </CardHeader>
            <CardContent>
              <Odontogram
                entries={odontogramEntries}
                onEntryChange={setOdontogramEntries}
                activeTool={activeTool}
                onToolChange={setActiveTool}
              />
            </CardContent>
          </Card>

          {/* Procedure Log */}
          <Card>
            <CardHeader>
              <CardTitle>Procedure Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcedureLog entries={odontogramEntries} />
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Findings & Actions (1 col) ── */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dental Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="exam-notes" className="text-xs text-muted-foreground">
                  Examination Notes
                </Label>
                <textarea
                  id="exam-notes"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Clinical examination findings..."
                  value={findings.examination_notes}
                  onChange={(e) => updateFindings("examination_notes", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="diagnosis" className="text-xs text-muted-foreground">
                  Diagnosis
                </Label>
                <textarea
                  id="diagnosis"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Dental diagnosis..."
                  value={findings.diagnosis}
                  onChange={(e) => updateFindings("diagnosis", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="treatment-plan" className="text-xs text-muted-foreground">
                  Treatment Plan
                </Label>
                <textarea
                  id="treatment-plan"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Planned dental procedures..."
                  value={findings.treatment_plan}
                  onChange={(e) => updateFindings("treatment_plan", e.target.value)}
                />
              </div>
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
                "Complete"
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full min-h-[48px]"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>
      </div>
    </Container>
  );
}
