"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Input,
  Select,
  Loading,
  EmptyState,
} from "@repo/ui";
import {
  getPrescriptions,
  updatePrescriptionStatus,
  deletePrescription,
} from "@/lib/actions/prescriptions";
import {
  type PrescriptionWithDetails,
  type PrescriptionStatus,
  STATUS_LABELS,
  ROUTE_LABELS,
  FREQUENCY_LABELS,
} from "@/lib/types/prescriptions";

const STATUS_BADGE_VARIANT: Record<PrescriptionStatus, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  draft: "secondary",
  signed: "info",
  issued: "warning",
  dispensed: "success",
  completed: "default",
  cancelled: "destructive",
};

const TYPE_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  medical: "info",
  dental: "success",
};

export function PrescriptionsTable() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const fetchPrescriptions = React.useCallback(async () => {
    setLoading(true);
    const { data } = await getPrescriptions();
    if (data) {
      setPrescriptions(data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleStatusChange = async (id: string, status: PrescriptionStatus) => {
    const { success } = await updatePrescriptionStatus(id, status);
    if (success) {
      fetchPrescriptions();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this draft prescription?")) return;
    const { success } = await deletePrescription(id);
    if (success) {
      fetchPrescriptions();
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        p.prescription_number.toLowerCase().includes(searchLower) ||
        p.medication_name.toLowerCase().includes(searchLower) ||
        p.patient?.first_name?.toLowerCase().includes(searchLower) ||
        p.patient?.last_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search prescriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-[48px] max-w-sm"
        />
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="min-h-[48px] w-[160px]"
          options={[
            { value: "all", label: "All Statuses" },
            ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <Button
          onClick={() => router.push("/prescriptions/new")}
          className="min-h-[48px]"
        >
          New Prescription
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Loading text="Loading prescriptions..." />
      ) : filteredPrescriptions.length === 0 ? (
        <EmptyState
          title="No prescriptions found"
          description={
            search || filterStatus !== "all"
              ? "Try a different search or filter."
              : "No prescriptions have been created yet."
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rx #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((rx) => (
                <TableRow key={rx.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {rx.prescription_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {rx.patient
                          ? `${rx.patient.last_name}, ${rx.patient.first_name}`
                          : "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rx.patient?.university_id ?? "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rx.medication_name}</p>
                      {rx.medication_strength && (
                        <p className="text-xs text-muted-foreground">
                          {rx.medication_strength}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{rx.dose}</TableCell>
                  <TableCell className="text-sm">{ROUTE_LABELS[rx.route]}</TableCell>
                  <TableCell className="text-sm">
                    {rx.frequency === "other"
                      ? rx.frequency_custom
                      : FREQUENCY_LABELS[rx.frequency]}
                  </TableCell>
                  <TableCell>
                    <Badge variant={TYPE_BADGE_VARIANT[rx.prescription_type] ?? "secondary"}>
                      {rx.prescription_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[rx.status]}>
                      {STATUS_LABELS[rx.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {rx.status === "draft" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(rx.id, "signed")}
                            className="min-h-[40px]"
                          >
                            Sign
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rx.id)}
                            className="min-h-[40px] text-destructive"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      {rx.status === "signed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(rx.id, "issued")}
                          className="min-h-[40px]"
                        >
                          Issue
                        </Button>
                      )}
                      {rx.status === "issued" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(rx.id, "dispensed")}
                          className="min-h-[40px]"
                        >
                          Dispense
                        </Button>
                      )}
                      {rx.status === "dispensed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(rx.id, "completed")}
                          className="min-h-[40px]"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
