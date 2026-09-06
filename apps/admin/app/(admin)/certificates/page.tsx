import { Container, PageHeader } from "@repo/ui";
import { getCertificates } from "@/lib/actions/certificates";

export default async function CertificatesPage() {
  const { data: certs, error } = await getCertificates();

  return (
    <Container>
      <PageHeader
        title="Certificates"
        description="Manage medical, dental, and referral certificates."
      />
      <div className="mt-8">
        {error ? (
          <p className="text-destructive">Error loading certificates: {error}</p>
        ) : certs.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">No certificates found. Create one to get started.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Number</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Issue Date</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((cert) => (
                    <tr key={cert.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{cert.certificate_number}</td>
                      <td className="px-4 py-3 capitalize">{cert.certificate_type}</td>
                      <td className="px-4 py-3">{cert.title}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          cert.status === "issued" ? "bg-green-50 text-green-700" :
                          cert.status === "draft" ? "bg-yellow-50 text-yellow-700" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{new Date(cert.issue_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
