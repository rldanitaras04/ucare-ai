import { Container, PageHeader } from "@repo/ui";
import { getProviderSessions } from "@/lib/actions/provider-sessions";
import { ProviderSessionsTable } from "@/components/providers/provider-sessions-table";

export default async function ProviderSessionsPage() {
  const { data: sessions, error } = await getProviderSessions();

  return (
    <Container>
      <PageHeader
        title="Provider Sessions"
        description="Manage doctor and dentist session schedules."
      />
      <div className="mt-8">
        {error ? (
          <p className="text-destructive">
            Error loading sessions: {error}
          </p>
        ) : (
          <ProviderSessionsTable sessions={sessions ?? []} />
        )}
      </div>
    </Container>
  );
}
