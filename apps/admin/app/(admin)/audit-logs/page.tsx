import { Container, PageHeader } from "@repo/ui";
import { AuditLogsTable } from "@/components/audit-logs/audit-logs-table";

export default function AdminAuditLogsPage() {
  return (
    <Container>
      <PageHeader
        title="Audit Logs"
        description="View system audit events and security logs."
      />
      <div className="mt-8">
        <AuditLogsTable />
      </div>
    </Container>
  );
}
