import { Container, PageHeader } from "@repo/ui";
import { RolesManager } from "@/components/roles/roles-manager";

export default function AdminRolesPage() {
  return (
    <Container>
      <PageHeader
        title="Roles & Permissions"
        description="Manage user roles and their permissions."
      />
      <div className="mt-8">
        <RolesManager />
      </div>
    </Container>
  );
}
