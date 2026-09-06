import { Container, PageHeader } from "@repo/ui";
import { getProviderRequests } from "@/lib/actions/provider-requests";

export default async function ProviderRequestsPage() {
  const { data: requests, error } = await getProviderRequests();

  return (
    <Container>
      <PageHeader
        title="Provider Requests"
        description="Coordinate requests for doctor and dentist availability."
      />
      <div className="mt-8">
        {error ? (
          <p className="text-destructive">Error loading requests: {error}</p>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">No provider requests found.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Patient</th>
                    <th className="px-4 py-3 text-left font-medium">Provider Type</th>
                    <th className="px-4 py-3 text-left font-medium">Urgency</th>
                    <th className="px-4 py-3 text-left font-medium">Reason</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{req.patient_name}</td>
                      <td className="px-4 py-3 capitalize">{req.provider_type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          req.urgency === "emergency" ? "bg-red-50 text-red-700" :
                          req.urgency === "urgent" ? "bg-orange-50 text-orange-700" :
                          "bg-blue-50 text-blue-700"
                        }`}>
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                        {req.reason ?? "No reason provided"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          req.status === "confirmed" ? "bg-green-50 text-green-700" :
                          req.status === "served" ? "bg-gray-50 text-gray-700" :
                          req.status === "cancelled" ? "bg-red-50 text-red-700" :
                          "bg-yellow-50 text-yellow-700"
                        }`}>
                          {req.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
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
