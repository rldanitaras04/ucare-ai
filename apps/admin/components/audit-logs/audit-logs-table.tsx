"use client";

import * as React from "react";
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
  Pagination,
} from "@repo/ui";
import { getAuditLogs, type AuditLog } from "@/lib/actions/audit-logs";

const actionColors: Record<string, "default" | "secondary" | "destructive" | "warning" | "info"> = {
  "user.created": "info",
  "user.updated": "secondary",
  "user.deleted": "destructive",
  "user.role_changed": "warning",
  "auth.login_success": "info",
  "auth.login_failed": "destructive",
};

function formatAction(action: string): string {
  return action
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AuditLogsTable() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [actionFilter, setActionFilter] = React.useState("");
  const [resourceFilter, setResourceFilter] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);
  const pageSize = 20;

  React.useEffect(() => {
    let cancelled = false;
    async function fetchLogs() {
      setLoading(true);
      const { data, count } = await getAuditLogs(
        {
          action: actionFilter || undefined,
          resource: resourceFilter || undefined,
        },
        pageSize,
        (page - 1) * pageSize
      );
      if (!cancelled) {
        if (data) setLogs(data);
        if (count) setTotalCount(count);
        setLoading(false);
      }
    }
    fetchLogs();
    return () => { cancelled = true; };
  }, [page, actionFilter, resourceFilter, refreshKey]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Filter by action..."
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by resource..."
          value={resourceFilter}
          onChange={(e) => {
            setResourceFilter(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <Loading text="Loading audit logs..." />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description="No audit events match your filters."
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={actionColors[log.action] ?? "secondary"}>
                        {formatAction(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.resource}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.resource_id ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.user_id ?? "System"}
                    </TableCell>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
