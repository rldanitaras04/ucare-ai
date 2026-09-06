import { Container, PageHeader } from "@repo/ui";
import { LibraryManager } from "@/components/system-library/library-manager";

export default function SystemLibraryPage() {
  return (
    <Container>
      <PageHeader
        title="System Libraries"
        description="Manage lookup tables, clinical reference datasets, and system options."
      />
      <div className="mt-8">
        <LibraryManager />
      </div>
    </Container>
  );
}
