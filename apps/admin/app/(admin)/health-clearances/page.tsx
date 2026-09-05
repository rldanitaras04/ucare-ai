import { Container, PageHeader } from "@repo/ui";
import { HealthClearancesTable } from "@/components/health-clearances/health-clearances-table";

export default function HealthClearancesPage() {
  return (
    <Container>
      <PageHeader
        title="Health Clearances"
        description="Manage institutional health clearances."
      />
      <div className="mt-8">
        <HealthClearancesTable />
      </div>
    </Container>
  );
}
