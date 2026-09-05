import { Container, PageHeader } from "@repo/ui";
import { getPatients } from "@/lib/actions/patients";
import { PatientsTable } from "@/components/patients/patients-table";

export default async function PatientsPage() {
  const { data: patients, error } = await getPatients();

  return (
    <Container>
      <PageHeader
        title="Patients"
        description="View and manage patient profiles."
      />
      <div className="mt-8">
        {error ? (
          <p className="text-destructive">Error loading patients: {error}</p>
        ) : (
          <PatientsTable patients={patients ?? []} />
        )}
      </div>
    </Container>
  );
}
