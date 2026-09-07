"use client";

import * as React from "react";

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<{ id: string; action: string; resource: string; resource_id: string | null; created_at: string; details: Record<string, unknown> | null }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const { createClient } = await import("@repo/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (!error) setLogs(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
        <p className="text-sm text-slate-500">{logs.length} log{logs.length !== 1 ? "s" : ""}</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{log.resource}{log.resource_id ? ` (${log.resource_id.slice(0, 8)})` : ""}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{log.details ? JSON.stringify(log.details).slice(0, 60) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
