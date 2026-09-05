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
  Loading,
  EmptyState,
  Select,
} from "@repo/ui";
import {
  getStaffAvailability,
  recordDutyStatus,
} from "@/lib/actions/staff-availability";
import {
  type StaffAvailabilityWithMember,
  type DutyStatus,
  DUTY_STATUS_LABELS,
} from "@/lib/types/staff-availability";

interface StaffAvailabilityTableProps {
  records: StaffAvailabilityWithMember[];
  staffMembers: Array<{ id: string; full_name: string | null; email: string; role: string }>;
}

const STATUS_BADGE_VARIANT: Record<DutyStatus, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  available: "success",
  unavailable: "destructive",
  seminar: "info",
  training: "info",
  official_activity: "warning",
  on_leave: "secondary",
};

export function StaffAvailabilityTable({
  records: initialRecords,
  staffMembers,
}: StaffAvailabilityTableProps) {
  const router = useRouter();
  const [records, setRecords] = React.useState(initialRecords);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Record form state
  const [selectedStaff, setSelectedStaff] = React.useState("");
  const [dutyStatus, setDutyStatus] = React.useState<DutyStatus>("available");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      setRecords(initialRecords);
      return;
    }

    setLoading(true);
    const { data } = await getStaffAvailability();
    if (data) {
      const filtered = data.filter((r) =>
        r.staff?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        r.staff?.email?.toLowerCase().includes(query.toLowerCase())
      );
      setRecords(filtered);
    }
    setLoading(false);
  };

  const handleRecordDuty = async () => {
    if (!selectedStaff) return;

    setSubmitting(true);
    const { success } = await recordDutyStatus(selectedStaff, dutyStatus, notes);
    if (success) {
      setSelectedStaff("");
      setDutyStatus("available");
      setNotes("");
      router.refresh();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Record New Duty Status */}
      <div className="rounded-md border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold">Record Duty Status</h3>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="min-h-[48px] flex-1"
            options={[
              { value: "", label: "Select staff member" },
              ...staffMembers.map((member) => ({
                value: member.id,
                label: `${member.full_name ?? member.email} (${member.role})`,
              })),
            ]}
          />

          <Select
            value={dutyStatus}
            onChange={(e) => setDutyStatus(e.target.value as DutyStatus)}
            className="min-h-[48px] flex-1"
            options={Object.entries(DUTY_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />

          <Input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[48px] flex-1"
          />

          <Button
            onClick={handleRecordDuty}
            disabled={!selectedStaff || submitting}
            className="min-h-[48px]"
          >
            {submitting ? "Recording..." : "Record"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search staff..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm min-h-[48px]"
        />
      </div>

      {/* Records Table */}
      {loading ? (
        <Loading text="Loading..." />
      ) : records.length === 0 ? (
        <EmptyState
          title="No availability records"
          description={search ? "Try a different search term." : "No duty status records found."}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Recorded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.staff?.full_name ?? record.staff?.email ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.staff?.role ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[record.duty_status]}>
                      {DUTY_STATUS_LABELS[record.duty_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {record.notes ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(record.created_at).toLocaleString()}
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
