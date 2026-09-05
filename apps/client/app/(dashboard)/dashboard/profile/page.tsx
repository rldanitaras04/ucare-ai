import { createServerClient } from "@repo/supabase/server";
import { Container, PageHeader, Card, CardHeader, CardTitle, CardContent, DescriptionList } from "@repo/ui";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
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
                { label: "Last Sign In", value: user?.last_sign_in_at ?? "Never" },
              ]}
            />
          </CardContent>
        </Card>
        <div className="mt-6">
          <ProfileForm user={user} />
        </div>
      </div>
    </Container>
  );
}
