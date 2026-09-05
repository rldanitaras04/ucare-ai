import { Container, PageHeader } from "@repo/ui";
import { PrescriptionsTable } from "@/components/prescriptions/prescriptions-table";

export default function PrescriptionsPage() {
  return (
    <Container>
      <PageHeader
        title="Prescriptions"
        description="Manage medical and dental prescriptions."
      />
      <div className="mt-8">
        <PrescriptionsTable />
      </div>
    </Container>
  );
}
