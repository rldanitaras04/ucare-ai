import { createServerClient } from "@repo/supabase/server";
import { Container, PageHeader, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";

export default async function PatientClearancesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let clearances: Array<{
    id: string;
    clearance_number: string;
    clearance_type: string;
    status: string;
    purpose: string | null;
    valid_from: string;
    valid_until: string | null;
  }> = [];

  if (profile) {
    const { data } = await supabase
      .from("health_clearances")
      .select("id, clearance_number, clearance_type, status, purpose, valid_from, valid_until")
      .eq("patient_id", profile.id)
      .order("created_at", { ascending: false });

    clearances = data ?? [];
  }

  return (
    <Container>
      <PageHeader
        title="My Health Clearances"
        description="View your health clearance status and history."
      />
      <div className="mt-8">
        {clearances.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No health clearances found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {clearances.map((hc) => (
              <Card key={hc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize">
                      {hc.clearance_type.replace(/_/g, " ")} Clearance
                    </CardTitle>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      hc.status === "approved" ? "bg-green-50 text-green-700" :
                      hc.status === "denied" ? "bg-red-50 text-red-700" :
                      hc.status === "expired" ? "bg-gray-50 text-gray-700" :
                      "bg-yellow-50 text-yellow-700"
                    }`}>
                      {hc.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    {hc.purpose && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purpose:</span>
                        <span>{hc.purpose}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid From:</span>
                      <span>{new Date(hc.valid_from).toLocaleDateString()}</span>
                    </div>
                    {hc.valid_until && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid Until:</span>
                        <span>{new Date(hc.valid_until).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clearance #:</span>
                      <span className="font-mono text-xs">{hc.clearance_number}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
