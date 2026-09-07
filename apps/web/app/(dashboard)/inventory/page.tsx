"use client";

import * as React from "react";
import { getInventoryItems, createInventoryItem, getStockLots, recordStockMovement, type InventoryItem, type StockLot } from "@/lib/actions/inventory";

type MovementType = "stock_in" | "stock_out" | "dispensing" | "adjustment" | "return";

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [lots, setLots] = React.useState<StockLot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lotsLoading, setLotsLoading] = React.useState(false);
  const [tab, setTab] = React.useState<"items" | "lots">("items");
  const [selectedItemId, setSelectedItemId] = React.useState<string>("");
  const [showItemForm, setShowItemForm] = React.useState(false);
  const [showMovementForm, setShowMovementForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [itemForm, setItemForm] = React.useState({ name: "", category: "medicine", unit: "pcs", reorder_level: "" });
  const [movementForm, setMovementForm] = React.useState({ item_id: "", movement_type: "stock_in" as MovementType, quantity: "", notes: "" });

  const load = React.useCallback(async () => {
    const itemsResult = await getInventoryItems();
    setItems(itemsResult.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const loadLots = React.useCallback(async (itemId: string) => {
    if (!itemId) { setLots([]); return; }
    setLotsLoading(true);
    const result = await getStockLots(itemId);
    setLots(result.data ?? []);
    setLotsLoading(false);
  }, []);

  React.useEffect(() => {
    if (tab === "lots" && selectedItemId) {
      loadLots(selectedItemId);
    }
  }, [tab, selectedItemId, loadLots]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result = await createInventoryItem({
      name: itemForm.name,
      category: itemForm.category,
      unit: itemForm.unit,
      reorder_level: itemForm.reorder_level ? parseInt(itemForm.reorder_level) : undefined,
    });
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else { setMessage({ type: "success", text: "Item created" }); setShowItemForm(false); setItemForm({ name: "", category: "medicine", unit: "pcs", reorder_level: "" }); await load(); }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result = await recordStockMovement({
      item_id: movementForm.item_id,
      movement_type: movementForm.movement_type,
      quantity: parseInt(movementForm.quantity),
      notes: movementForm.notes || undefined,
    });
    setSubmitting(false);
    if (result.error) setMessage({ type: "error", text: result.error });
    else {
      setMessage({ type: "success", text: "Movement recorded" });
      setShowMovementForm(false);
      setMovementForm({ item_id: "", movement_type: "stock_in", quantity: "", notes: "" });
      await load();
      if (selectedItemId) await loadLots(selectedItemId);
    }
  };

  const selectedItemName = items.find((i) => i.id === selectedItemId)?.name ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-sm text-slate-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowItemForm(!showItemForm); setShowMovementForm(false); }} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
            {showItemForm ? "Cancel" : "Add Item"}
          </button>
          <button onClick={() => { setShowMovementForm(!showMovementForm); setShowItemForm(false); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {showMovementForm ? "Cancel" : "Record Movement"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.text}</div>
      )}

      {showItemForm && (
        <form onSubmit={handleCreateItem} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">Item Name *</label>
              <input type="text" required value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Category *</label>
              <select required value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
                <option value="medicine">Medicine</option>
                <option value="medical_supply">Medical Supply</option>
                <option value="dental_supply">Dental Supply</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Unit *</label>
              <input type="text" required value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="pcs, tablets, bottles..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Reorder Level</label>
              <input type="number" value={itemForm.reorder_level} onChange={(e) => setItemForm({ ...itemForm, reorder_level: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="Optional" />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Creating..." : "Create Item"}
          </button>
        </form>
      )}

      {showMovementForm && (
        <form onSubmit={handleRecordMovement} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">Item *</label>
              <select required value={movementForm.item_id} onChange={(e) => setMovementForm({ ...movementForm, item_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
                <option value="">Select item...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Movement Type *</label>
              <select required value={movementForm.movement_type} onChange={(e) => setMovementForm({ ...movementForm, movement_type: e.target.value as MovementType })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
                <option value="stock_in">Stock In</option>
                <option value="stock_out">Stock Out</option>
                <option value="dispensing">Dispensing</option>
                <option value="adjustment">Adjustment</option>
                <option value="return">Return</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Quantity *</label>
              <input type="number" required min="1" value={movementForm.quantity} onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Notes</label>
              <input type="text" value={movementForm.notes} onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" placeholder="Optional notes" />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Recording..." : "Record Movement"}
          </button>
        </form>
      )}

      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
        <button onClick={() => setTab("items")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "items" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Items ({items.length})</button>
        <button onClick={() => setTab("lots")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "lots" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Stock Lots</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : tab === "items" ? (
        items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center"><p className="text-sm text-slate-500">No inventory items</p></div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Reorder Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 capitalize">{item.category.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.unit}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.reorder_level ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500">Select Item to View Lots</label>
            <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none">
              <option value="">Choose an item...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          {selectedItemId && (
            lotsLoading ? (
              <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
            ) : lots.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
                <p className="text-sm text-slate-500">No stock lots for {selectedItemName}</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Unit Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Expiry</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lots.map((lot) => (
                      <tr key={lot.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{lot.batch_number || "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{lot.quantity}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{lot.unit_cost != null ? `₱${lot.unit_cost.toFixed(2)}` : "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{lot.expiry_date ? new Date(lot.expiry_date).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{lot.supplier || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {!selectedItemId && (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
              <p className="text-sm text-slate-500">Select an item above to view its stock lots</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
