import { createServerClient } from "@repo/supabase/server";
import { Container, PageHeader, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";

export default async function PatientPrescriptionsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let prescriptions: Array<{
    id: string;
    prescription_number: string;
    medication_name: string;
    medication_strength: string | null;
    dose: string;
    frequency: string;
    status: string;
    date_prescribed: string;
  }> = [];

  if (profile) {
    const { data } = await supabase
      .from("prescriptions")
      .select("id, prescription_number, medication_name, medication_strength, dose, frequency, status, date_prescribed")
      .eq("patient_id", profile.id)
      .order("date_prescribed", { ascending: false });

    prescriptions = data ?? [];
  }

  return (
    <Container>
      <PageHeader
        title="My Prescriptions"
        description="View your prescription history."
      />
      <div className="mt-8">
        {prescriptions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No prescriptions found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <Card key={rx.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {rx.medication_name}
                      {rx.medication_strength && (
                        <span className="text-muted-foreground"> {rx.medication_strength}</span>
                      )}
                    </CardTitle>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      rx.status === "completed" ? "bg-green-50 text-green-700" :
                      rx.status === "dispensed" ? "bg-blue-50 text-blue-700" :
                      rx.status === "cancelled" ? "bg-red-50 text-red-700" :
                      "bg-yellow-50 text-yellow-700"
                    }`}>
                      {rx.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dose:</span>
                      <span>{rx.dose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="capitalize">{rx.frequency.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prescribed:</span>
                      <span>{new Date(rx.date_prescribed).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prescription #:</span>
                      <span className="font-mono text-xs">{rx.prescription_number}</span>
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
