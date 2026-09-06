import { Container, PageHeader, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { getClientDashboardData } from "./actions";

export default async function DashboardPage() {
  const { data: dashboardData } = await getClientDashboardData();

  return (
    <Container>
      <PageHeader
        title="Dashboard"
        description={
          dashboardData?.fullName
            ? `Welcome back, ${dashboardData.fullName}.`
            : "Welcome to your dashboard."
        }
      />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {dashboardData?.hasProfile ? "Complete" : "Incomplete"}
            </p>
            <p className="text-xs text-muted-foreground">Your profile information</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">My Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData?.totalVisits ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total clinic visits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Active</p>
            <p className="text-xs text-muted-foreground">{dashboardData?.email ?? "No email"}</p>
          </CardContent>
        </Card>
      </div>
      {dashboardData?.recentVisits && dashboardData.recentVisits.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">{visit.service_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(visit.visit_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 capitalize">
                    {visit.status.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
