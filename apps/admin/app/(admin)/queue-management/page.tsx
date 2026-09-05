import { Container, PageHeader } from "@repo/ui";
import { QueueManager } from "@/components/queue/queue-manager";

export default function QueueManagementPage() {
  return (
    <Container>
      <PageHeader
        title="Queue Management"
        description="Call, skip, requeue, and manage patient priority."
      />
      <div className="mt-8">
        <QueueManager />
      </div>
    </Container>
  );
}
