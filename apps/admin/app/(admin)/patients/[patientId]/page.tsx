import { Container, PageHeader, Badge, Card, CardContent, CardHeader, CardTitle, DescriptionList } from "@repo/ui";
import { getPatientById } from "@/lib/actions/patients";
import { notFound } from "next/navigation";
import Link from "next/link";

const SERVICE_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  medical: "info",
  dental: "success",
  nursing: "warning",
  clearance: "secondary",
};

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  registered: "secondary",
  triaged: "warning",
  in_consultation: "info",
  completed: "success",
  cancelled: "destructive",
};

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const { data: patient, error } = await getPatientById(patientId);

  if (error || !patient) {
    notFound();
  }

  return (
    <Container>
      <PageHeader
        title={`${patient.last_name}, ${patient.first_name}`}
        description={`University ID: ${patient.university_id}`}
        actions={
          <Link
            href="/patients"
            className="inline-flex min-h-[48px] items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Back to Patients
          </Link>
        }
      />

      <div className="mt-8 space-y-6">
        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              items={[
                { label: "Full Name", value: `${patient.last_name}, ${patient.first_name}${patient.middle_name ? ` ${patient.middle_name}` : ""}` },
                { label: "University ID", value: patient.university_id },
                { label: "Employee/Student No.", value: patient.student_employee_no ?? "—" },
                { label: "Sex", value: patient.sex ?? "—" },
                { label: "Date of Birth", value: patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "—" },
                { label: "Blood Type", value: patient.blood_type ?? "—" },
                { label: "Affiliation", value: patient.affiliation ?? "—" },
                { label: "College/Unit", value: patient.college_unit ?? "—" },
                { label: "Contact Number", value: patient.contact_number ?? "—" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              items={[
                { label: "Name", value: patient.emergency_contact_name ?? "—" },
                { label: "Phone", value: patient.emergency_contact_number ?? "—" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {patient.allergies.map((allergy) => (
                      <Badge key={allergy} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm">None documented</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chronic Conditions</p>
                {patient.chronic_conditions && patient.chronic_conditions.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {patient.chronic_conditions.map((condition) => (
                      <Badge key={condition} variant="warning">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm">None documented</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit History */}
        <Card>
          <CardHeader>
            <CardTitle>Visit History ({patient.visit_count})</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.visits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visits recorded.</p>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Service</th>
                      <th className="px-4 py-2 text-left font-medium">Reason</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.visits.map((visit) => (
                      <tr key={visit.id} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={SERVICE_BADGE_VARIANT[visit.service_type] ?? "secondary"}>
                            {visit.service_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {visit.reason_for_visit ?? "—"}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={STATUS_BADGE_VARIANT[visit.status] ?? "secondary"}>
                            {visit.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
