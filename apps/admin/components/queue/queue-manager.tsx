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
  Input,
  Loading,
  EmptyState,
} from "@repo/ui";
import {
  getQueueWithPatients,
  callPatient,
  startSession,
  skipPatient,
  requeuePatient,
  updatePriority,
  type QueueEntryWithVisit,
  type PriorityLevel,
} from "@/lib/actions/queue";

const PRIORITY_BADGE_VARIANT: Record<PriorityLevel, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  emergency: "destructive",
  urgent: "warning",
  priority: "info",
  normal: "secondary",
};

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  waiting: "secondary",
  called: "warning",
  in_session: "info",
  served: "success",
  skipped: "destructive",
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  emergency: "Emergency",
  urgent: "Urgent",
  priority: "Priority",
  normal: "Normal",
};

export function QueueManager() {
  const router = useRouter();
  const [entries, setEntries] = React.useState<QueueEntryWithVisit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterService, setFilterService] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [roomInputs, setRoomInputs] = React.useState<Record<string, string>>({});

  const fetchEntries = React.useCallback(async () => {
    setLoading(true);
    const { data } = await getQueueWithPatients();
    if (data) {
      setEntries(data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 10000);
    return () => clearInterval(interval);
  }, [fetchEntries]);

  const handleCall = async (entryId: string) => {
    const room = roomInputs[entryId] || undefined;
    const { success } = await callPatient(entryId, room);
    if (success) {
      fetchEntries();
    }
  };

  const handleStart = async (entryId: string) => {
    const { success } = await startSession(entryId);
    if (success) {
      fetchEntries();
    }
  };

  const handleSkip = async (entryId: string) => {
    const { success } = await skipPatient(entryId);
    if (success) {
      fetchEntries();
    }
  };

  const handleRequeue = async (entryId: string) => {
    const { success } = await requeuePatient(entryId);
    if (success) {
      fetchEntries();
    }
  };

  const handlePriorityChange = async (entryId: string, priority: PriorityLevel) => {
    const { success } = await updatePriority(entryId, priority);
    if (success) {
      fetchEntries();
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (filterService !== "all" && e.service_category !== filterService) return false;
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="min-h-[48px] w-[160px]"
          options={[
            { value: "all", label: "All Services" },
            { value: "medical", label: "Medical" },
            { value: "dental", label: "Dental" },
            { value: "nursing", label: "Nursing" },
            { value: "clearance", label: "Clearance" },
          ]}
        />

        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="min-h-[48px] w-[160px]"
          options={[
            { value: "all", label: "All Statuses" },
            { value: "waiting", label: "Waiting" },
            { value: "called", label: "Called" },
            { value: "in_session", label: "In Session" },
            { value: "skipped", label: "Skipped" },
          ]}
        />

        <Button variant="outline" onClick={fetchEntries} className="min-h-[48px]">
          Refresh
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Loading text="Loading queue..." />
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          title="No queue entries"
          description="No patients in the queue matching the current filters."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const patient = entry.walk_in_visits?.patient_profiles;
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-lg font-bold">
                      {entry.queue_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {patient
                            ? `${patient.last_name}, ${patient.first_name}`
                            : "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {patient?.university_id ?? "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.service_category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={entry.priority}
                        onChange={(e) =>
                          handlePriorityChange(entry.id, e.target.value as PriorityLevel)
                        }
                        className="min-h-[40px] w-[130px]"
                        options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
                          value,
                          label,
                        }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[entry.status]}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Room"
                        value={roomInputs[entry.id] ?? entry.room_station ?? ""}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [entry.id]: e.target.value,
                          }))
                        }
                        className="min-h-[40px] w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.status === "waiting" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCall(entry.id)}
                            className="min-h-[40px]"
                          >
                            Call
                          </Button>
                        )}
                        {entry.status === "called" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStart(entry.id)}
                            className="min-h-[40px]"
                          >
                            Start
                          </Button>
                        )}
                        {(entry.status === "waiting" || entry.status === "called") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSkip(entry.id)}
                            className="min-h-[40px] text-destructive"
                          >
                            Skip
                          </Button>
                        )}
                        {entry.status === "skipped" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRequeue(entry.id)}
                            className="min-h-[40px]"
                          >
                            Requeue
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
