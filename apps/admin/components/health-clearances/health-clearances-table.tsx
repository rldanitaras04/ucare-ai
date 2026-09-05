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
  getHealthClearances,
  updateClearanceStatus,
} from "@/lib/actions/health-clearances";
import {
  type HealthClearanceWithDetails,
  type ClearanceStatus,
  CLEARANCE_TYPE_LABELS,
  CLEARANCE_STATUS_LABELS,
} from "@/lib/types/health-clearances";

const STATUS_BADGE_VARIANT: Record<ClearanceStatus, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  pending: "secondary",
  in_review: "info",
  requires_action: "warning",
  approved: "success",
  denied: "destructive",
  expired: "destructive",
  cancelled: "secondary",
};

export function HealthClearancesTable() {
  const router = useRouter();
  const [clearances, setClearances] = React.useState<HealthClearanceWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const fetchClearances = React.useCallback(async () => {
    setLoading(true);
    const { data } = await getHealthClearances();
    if (data) {
      setClearances(data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchClearances();
  }, [fetchClearances]);

  const handleStatusChange = async (id: string, status: ClearanceStatus) => {
    const { success } = await updateClearanceStatus(id, status);
    if (success) {
      fetchClearances();
    }
  };

  const filteredClearances = clearances.filter((c) => {
    if (filterType !== "all" && c.clearance_type !== filterType) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        c.clearance_number.toLowerCase().includes(searchLower) ||
        c.patient?.first_name?.toLowerCase().includes(searchLower) ||
        c.patient?.last_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search clearances..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-[48px] max-w-sm"
        />
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="min-h-[48px] w-[160px]"
          options={[
            { value: "all", label: "All Types" },
            ...Object.entries(CLEARANCE_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="min-h-[48px] w-[160px]"
          options={[
            { value: "all", label: "All Statuses" },
            ...Object.entries(CLEARANCE_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <Button
          onClick={() => router.push("/health-clearances/new")}
          className="min-h-[48px]"
        >
          New Clearance
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Loading text="Loading clearances..." />
      ) : filteredClearances.length === 0 ? (
        <EmptyState
          title="No clearances found"
          description={
            search || filterType !== "all" || filterStatus !== "all"
              ? "Try a different search or filter."
              : "No health clearances have been created yet."
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clearance #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Requirements</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClearances.map((clearance) => {
                const completedReqs =
                  clearance.requirements?.filter((r) => r.completed).length ?? 0;
                const totalReqs = clearance.requirements?.length ?? 0;

                return (
                  <TableRow key={clearance.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {clearance.clearance_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {clearance.patient
                            ? `${clearance.patient.last_name}, ${clearance.patient.first_name}`
                            : "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {clearance.patient?.university_id ?? "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CLEARANCE_TYPE_LABELS[clearance.clearance_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {clearance.purpose ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {clearance.valid_until
                        ? new Date(clearance.valid_until).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {totalReqs > 0 ? (
                        <span>
                          {completedReqs}/{totalReqs}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[clearance.status]}>
                        {CLEARANCE_STATUS_LABELS[clearance.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/health-clearances/${clearance.id}`)
                          }
                          className="min-h-[40px]"
                        >
                          View
                        </Button>
                        {clearance.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(clearance.id, "in_review")
                            }
                            className="min-h-[40px]"
                          >
                            Review
                          </Button>
                        )}
                        {clearance.status === "in_review" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(clearance.id, "approved")
                            }
                            className="min-h-[40px] text-green-600"
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
