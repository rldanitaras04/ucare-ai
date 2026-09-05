"use client";

import * as React from "react";
import { getLiveQueue, type QueueEntry } from "../(admin)/walk-ins/actions";

const REFRESH_INTERVAL_MS = 5000;

const SERVICE_LABELS: Record<string, string> = {
  medical: "Medical",
  dental: "Dental",
  nursing: "Nursing",
  clearance: "Clearance",
};

function QueueCard({
  entry,
  isNowServing,
}: {
  entry: QueueEntry;
  isNowServing: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border-2 p-4 sm:p-6 ${
        isNowServing
          ? "border-primary bg-primary/10 shadow-lg"
          : "border-border bg-background"
      }`}
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-lg text-3xl font-bold sm:h-28 sm:w-28 sm:text-5xl ${
            isNowServing ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {entry.queue_number}
        </div>
        <div>
          <p
            className={`text-sm font-medium sm:text-base ${
              isNowServing ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {isNowServing ? "NOW SERVING" : "NEXT IN QUEUE"}
          </p>
          <p className="text-lg font-semibold sm:text-2xl">
            {SERVICE_LABELS[entry.service_category]}
          </p>
          {entry.room_station && (
            <p className="text-sm text-muted-foreground">
              Station: {entry.room_station}
            </p>
          )}
        </div>
      </div>
      {isNowServing && entry.called_at && (
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Called at</p>
          <p className="text-lg font-semibold sm:text-xl">
            {new Date(entry.called_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}

export default function QueueBoardPage() {
  const [entries, setEntries] = React.useState<QueueEntry[]>([]);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function fetch() {
      const { data, error: fetchError } = await getLiveQueue();
      if (!cancelled) {
        if (fetchError) {
          setError(fetchError);
        } else {
          setEntries(data);
          setError(null);
          setLastUpdated(new Date());
        }
      }
    }
    fetch();
    const interval = setInterval(fetch, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const nowServing = entries.filter((e) => e.status === "called" || e.status === "in_session");
  const nextInQueue = entries.filter((e) => e.status === "waiting");

  return (
    <div className="min-h-screen bg-blue-900 text-white">
      {/* Header */}
      <header className="border-b border-blue-700 bg-blue-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-4xl">UCare Clinic</h1>
            <p className="text-sm text-blue-300 sm:text-base">Waiting Room Queue Board</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-300">Last Updated</p>
            <p className="text-sm font-medium sm:text-base">
              {lastUpdated
                ? lastUpdated.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "--:--:--"}
            </p>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-600 px-6 py-2 text-center text-sm font-medium">
          {error}
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-200">
            <p className="text-2xl font-semibold sm:text-4xl">No Active Queue</p>
            <p className="mt-2 text-sm sm:text-base">
              No patients are currently waiting. Please check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {/* Now Serving Section */}
            {nowServing.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-green-400" />
                  <h2 className="text-xl font-bold sm:text-3xl">Now Serving</h2>
                </div>
                <div className="space-y-3">
                  {nowServing.map((entry) => (
                    <QueueCard
                      key={entry.id}
                      entry={entry}
                      isNowServing
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Next in Queue Section */}
            {nextInQueue.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-blue-200 sm:text-3xl">
                  Next in Queue
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {nextInQueue.slice(0, 10).map((entry) => (
                    <QueueCard
                      key={entry.id}
                      entry={entry}
                      isNowServing={false}
                    />
                  ))}
                </div>
                {nextInQueue.length > 10 && (
                  <p className="mt-3 text-center text-sm text-blue-300">
                    +{nextInQueue.length - 10} more patients in queue
                  </p>
                )}
              </section>
            )}
          </div>
        )}

        {/* RA 10173 Compliance Notice */}
        <footer className="mt-10 border-t border-blue-700 pt-4 text-center text-xs text-blue-300">
          <p>
            Patient privacy protected under RA 10173 (Data Privacy Act of 2012).
            Names, diagnoses, and medical details are not displayed.
          </p>
        </footer>
      </main>
    </div>
  );
}
