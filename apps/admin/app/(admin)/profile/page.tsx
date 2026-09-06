import { createServerClient } from "@repo/supabase/server";
import { Container, PageHeader, Card, CardHeader, CardTitle, CardContent, DescriptionList } from "@repo/ui";
import { AdminProfileForm } from "@/components/profile/admin-profile-form";

export default async function AdminProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <Container>
      <PageHeader
        title="Profile"
        description="Manage your account settings."
      />
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              items={[
                { label: "Email", value: user?.email ?? "Not set" },
                { label: "User ID", value: user?.id ?? "Not available" },
                { label: "Role", value: (user?.user_metadata?.role as string)?.replace(/_/g, " ") ?? "Not set" },
                { label: "Last Sign In", value: user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never" },
              ]}
            />
          </CardContent>
        </Card>
        <div className="mt-6">
          <AdminProfileForm user={user} />
        </div>
      </div>
    </Container>
  );
}
