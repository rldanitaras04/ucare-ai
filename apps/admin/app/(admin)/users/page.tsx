import { Container, PageHeader } from "@repo/ui";
import { getUsers } from "@/lib/actions/users";
import { UsersTable } from "@/components/users/users-table";

export default async function AdminUsersPage() {
  const { data: users, error } = await getUsers();

  return (
    <Container>
      <PageHeader
        title="Users"
        description="Manage user accounts and roles."
      />
      <div className="mt-8">
        {error ? (
          <p className="text-destructive">Error loading users: {error}</p>
        ) : (
          <UsersTable users={users ?? []} />
        )}
      </div>
    </Container>
  );
}
