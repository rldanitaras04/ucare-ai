import { Container, PageHeader } from "@repo/ui";
import { getStaffAvailability, getAvailableStaff } from "@/lib/actions/staff-availability";
import { StaffAvailabilityTable } from "@/components/staff/staff-availability-table";

export default async function StaffAvailabilityPage() {
  const [{ data: records, error: recordsError }, { data: staffMembers }] =
    await Promise.all([getStaffAvailability(), getAvailableStaff()]);

  return (
    <Container>
      <PageHeader
        title="Staff Availability"
        description="Manage staff duty status and availability."
      />
      <div className="mt-8">
        {recordsError ? (
          <p className="text-destructive">
            Error loading availability: {recordsError}
          </p>
        ) : (
          <StaffAvailabilityTable
            records={records ?? []}
            staffMembers={staffMembers ?? []}
          />
        )}
      </div>
    </Container>
  );
}
