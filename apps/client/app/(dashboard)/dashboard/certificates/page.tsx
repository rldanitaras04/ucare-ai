import { createServerClient } from "@repo/supabase/server";
import { Container, PageHeader, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";

export default async function PatientCertificatesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let certificates: Array<{
    id: string;
    certificate_number: string;
    certificate_type: string;
    title: string;
    status: string;
    issue_date: string;
    valid_until: string | null;
  }> = [];

  if (profile) {
    const { data } = await supabase
      .from("certificates")
      .select("id, certificate_number, certificate_type, title, status, issue_date, valid_until")
      .eq("patient_id", profile.id)
      .order("created_at", { ascending: false });

    certificates = data ?? [];
  }

  return (
    <Container>
      <PageHeader
        title="My Certificates"
        description="View your medical and dental certificates."
      />
      <div className="mt-8">
        {certificates.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No certificates found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <Card key={cert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{cert.title}</CardTitle>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      cert.status === "issued" ? "bg-green-50 text-green-700" :
                      cert.status === "cancelled" ? "bg-red-50 text-red-700" :
                      "bg-yellow-50 text-yellow-700"
                    }`}>
                      {cert.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{cert.certificate_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span>{new Date(cert.issue_date).toLocaleDateString()}</span>
                    </div>
                    {cert.valid_until && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid Until:</span>
                        <span>{new Date(cert.valid_until).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificate #:</span>
                      <span className="font-mono text-xs">{cert.certificate_number}</span>
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
