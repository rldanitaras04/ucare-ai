import { Container, PageHeader, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";

export default function DashboardPage() {
  return (
    <Container>
      <PageHeader
        title="Dashboard"
        description="Welcome to your dashboard."
      />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Complete</p>
            <p className="text-xs text-muted-foreground">Your profile information</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Recent activities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Manage</p>
            <p className="text-xs text-muted-foreground">Account settings</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
