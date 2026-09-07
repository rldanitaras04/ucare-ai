"use client";

import * as React from "react";
import { getQueueWithPatients, callPatient, startSession, skipPatient, requeuePatient, type QueueEntryWithVisit, type PriorityLevel } from "@/lib/actions/queue";

const PRIORITY_COLORS: Record<string, string> = {
  emergency: "bg-red-100 text-red-700 border-red-200",
  urgent: "bg-orange-100 text-orange-700 border-orange-200",
  priority: "bg-yellow-100 text-yellow-700 border-yellow-200",
  normal: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_COLORS: Record<string, string> = {
  waiting: "bg-blue-50 text-blue-700",
  called: "bg-amber-50 text-amber-700",
  in_session: "bg-green-50 text-green-700",
  served: "bg-slate-100 text-slate-600",
  skipped: "bg-red-50 text-red-600",
};

export default function QueueReceptionPage() {
  const [entries, setEntries] = React.useState<QueueEntryWithVisit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadQueue = React.useCallback(async () => {
    const result = await getQueueWithPatients();
    if (result.error) {
      setError(result.error);
    } else {
      setEntries(result.data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const handleAction = async (action: string, entryId: string) => {
    let result;
    switch (action) {
      case "call": result = await callPatient(entryId); break;
      case "start": result = await startSession(entryId); break;
      case "skip": result = await skipPatient(entryId); break;
      case "requeue": result = await requeuePatient(entryId); break;
    }
    if (result?.error) setError(result.error);
    else loadQueue();
  };

  const waiting = entries.filter((e) => e.status === "waiting");
  const called = entries.filter((e) => e.status === "called");
  const inSession = entries.filter((e) => e.status === "in_session");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Queue Reception</h1>
          <p className="text-sm text-slate-500">Live queue management. Auto-refreshes every 10 seconds.</p>
        </div>
        <button onClick={loadQueue} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
          Refresh
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">Queue is empty</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Waiting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Waiting</h2>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{waiting.length}</span>
            </div>
            {waiting.map((entry) => (
              <QueueCard
                key={entry.id}
                entry={entry}
                onAction={handleAction}
                actions={[
                  { label: "Call", action: "call", color: "bg-amber-500 hover:bg-amber-600 text-white" },
                  { label: "Skip", action: "skip", color: "bg-red-100 hover:bg-red-200 text-red-700" },
                ]}
              />
            ))}
          </div>

          {/* Called */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Called</h2>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{called.length}</span>
            </div>
            {called.map((entry) => (
              <QueueCard
                key={entry.id}
                entry={entry}
                onAction={handleAction}
                actions={[
                  { label: "Start Session", action: "start", color: "bg-green-500 hover:bg-green-600 text-white" },
                  { label: "Skip", action: "skip", color: "bg-red-100 hover:bg-red-200 text-red-700" },
                ]}
              />
            ))}
          </div>

          {/* In Session */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">In Session</h2>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{inSession.length}</span>
            </div>
            {inSession.map((entry) => (
              <QueueCard
                key={entry.id}
                entry={entry}
                onAction={handleAction}
                actions={[]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QueueCard({ entry, onAction, actions }: {
  entry: QueueEntryWithVisit;
  onAction: (action: string, id: string) => void;
  actions: { label: string; action: string; color: string }[];
}) {
  const patient = entry.walk_in_visits?.patient_profiles;
  const visit = entry.walk_in_visits;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-slate-900">{entry.queue_number}</p>
          <p className="text-sm text-slate-600">{patient ? `${patient.first_name} ${patient.last_name}` : "Unknown"}</p>
          {patient && <p className="text-xs text-slate-400">{patient.university_id}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${PRIORITY_COLORS[entry.priority]}`}>
            {entry.priority}
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status]}`}>
            {entry.status.replace("_", " ")}
          </span>
        </div>
      </div>
      {visit?.reason_for_visit && (
        <p className="mt-2 text-xs text-slate-500 truncate">{visit.reason_for_visit}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {visit?.service_type && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 capitalize">{visit.service_type}</span>
        )}
        {entry.room_station && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{entry.room_station}</span>
        )}
      </div>
      {actions.length > 0 && (
        <div className="mt-3 flex gap-2">
          {actions.map((a) => (
            <button
              key={a.action}
              onClick={() => onAction(a.action, entry.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${a.color}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
