import { Container, PageHeader } from "@repo/ui";
import { getInventoryItems } from "@/lib/actions/inventory";

export default async function InventoryPage() {
  const { data: items, error } = await getInventoryItems();

  return (
    <Container>
      <PageHeader
        title="Inventory"
        description="Manage medicines, medical supplies, and dental supplies."
      />
      <div className="mt-8">
        {error ? (
          <p className="text-destructive">Error loading inventory: {error}</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">No inventory items found. Add items to get started.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Unit</th>
                    <th className="px-4 py-3 text-left font-medium">Reorder Level</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 capitalize">{item.category.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3">{item.unit}</td>
                      <td className="px-4 py-3">{item.reorder_level}</td>
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
