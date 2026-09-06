import { Container, PageHeader } from "@repo/ui";
import { getBreakGlassLogs } from "@/lib/actions/break-glass";

export default async function BreakGlassLogsPage() {
  const { data: logs, error } = await getBreakGlassLogs();

  return (
    <Container>
      <PageHeader
        title="Break-Glass Audit Logs"
        description="Immutable record of emergency EMR access overrides."
      />
      <div className="mt-8">
        {error ? (
          <p className="text-destructive">Error loading logs: {error}</p>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">No break-glass access events recorded.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                    <th className="px-4 py-3 text-left font-medium">Provider ID</th>
                    <th className="px-4 py-3 text-left font-medium">Patient ID</th>
                    <th className="px-4 py-3 text-left font-medium">Reason</th>
                    <th className="px-4 py-3 text-left font-medium">IP Address</th>
                    <th className="px-4 py-3 text-left font-medium">Notified</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">
                        {new Date(log.accessed_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{log.provider_id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.patient_id}</td>
                      <td className="px-4 py-3 max-w-xs">{log.reason}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.ip_address ?? "N/A"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          log.notified ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                        }`}>
                          {log.notified ? "Yes" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
