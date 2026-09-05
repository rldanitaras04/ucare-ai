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
  Select,
  Loading,
  EmptyState,
} from "@repo/ui";
import {
  getProviderSessions,
  updateSessionStatus,
  type ProviderSessionWithProvider,
  type ProviderSessionStatus,
  SESSION_TYPE_LABELS,
  SESSION_STATUS_LABELS,
} from "@/lib/actions/provider-sessions";

interface ProviderSessionsTableProps {
  sessions: ProviderSessionWithProvider[];
}

const STATUS_BADGE_VARIANT: Record<ProviderSessionStatus, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  planned: "secondary",
  confirmed: "info",
  active: "success",
  completed: "default",
  cancelled: "destructive",
};

const PROVIDER_TYPE_BADGE: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  doctor: "info",
  dentist: "success",
};

export function ProviderSessionsTable({
  sessions: initialSessions,
}: ProviderSessionsTableProps) {
  const router = useRouter();
  const [sessions, setSessions] = React.useState(initialSessions);
  const [loading, setLoading] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  const handleRefresh = async () => {
    setLoading(true);
    const { data } = await getProviderSessions();
    if (data) {
      setSessions(data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (
    sessionId: string,
    newStatus: ProviderSessionStatus
  ) => {
    const { success } = await updateSessionStatus(sessionId, newStatus);
    if (success) {
      router.refresh();
    }
  };

  const filteredSessions =
    filterStatus === "all"
      ? sessions
      : sessions.filter((s) => s.status === filterStatus);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="min-h-[48px] w-[200px]"
          options={[
            { value: "all", label: "All Statuses" },
            ...Object.entries(SESSION_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <Button variant="outline" onClick={handleRefresh} className="min-h-[48px]">
          Refresh
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Loading text="Loading sessions..." />
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          title="No sessions found"
          description="No provider sessions match the current filter."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Session Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {session.provider?.full_name ?? session.provider?.email ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={PROVIDER_TYPE_BADGE[session.provider_type] ?? "secondary"}>
                      {session.provider_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {SESSION_TYPE_LABELS[session.session_type]}
                  </TableCell>
                  <TableCell>
                    {new Date(session.session_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(session.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[session.status]}>
                      {SESSION_STATUS_LABELS[session.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {session.status === "planned" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(session.id, "confirmed")}
                          className="min-h-[40px]"
                        >
                          Confirm
                        </Button>
                      )}
                      {session.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(session.id, "active")}
                          className="min-h-[40px]"
                        >
                          Start
                        </Button>
                      )}
                      {session.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(session.id, "completed")}
                          className="min-h-[40px]"
                        >
                          End
                        </Button>
                      )}
                      {(session.status === "planned" || session.status === "confirmed") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(session.id, "cancelled")}
                          className="min-h-[40px] text-destructive"
                        >
                          Cancel
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
