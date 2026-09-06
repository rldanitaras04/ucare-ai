"use client";

import * as React from "react";
import {
  getLibraries,
  getLibraryItems,
  createLibrary,
  updateLibrary,
  deleteLibrary,
  createLibraryItem,
  updateLibraryItem,
  toggleLibraryItemActive,
  deleteLibraryItem,
  type SystemLibraryWithCount,
  type SystemLibraryItem,
} from "@/lib/actions/system-library";

const LIBRARY_TYPE_LABELS: Record<string, string> = {
  icd10_diagnoses: "ICD-10 Diagnoses",
  medication_formulary: "Medication Formulary",
  triage_severity_levels: "Triage Severity",
  specialties: "Specialties",
  appointment_statuses: "Appointment Statuses",
  queue_locations: "Queue Locations",
  service_types: "Service Types",
  vital_sign_units: "Vital Sign Units",
  allergy_types: "Allergy Types",
  blood_types: "Blood Types",
  immunization_types: "Immunization Types",
  referral_reasons: "Referral Reasons",
  dental_conditions: "Dental Conditions",
  tooth_surfaces: "Tooth Surfaces",
  custom: "Custom",
};

export function LibraryManager() {
  const [libraries, setLibraries] = React.useState<SystemLibraryWithCount[]>([]);
  const [selectedLib, setSelectedLib] = React.useState<SystemLibraryWithCount | null>(null);
  const [items, setItems] = React.useState<SystemLibraryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [itemsLoading, setItemsLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [showAddItem, setShowAddItem] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<SystemLibraryItem | null>(null);
  const [showAddLibrary, setShowAddLibrary] = React.useState(false);

  React.useEffect(() => {
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    setLoading(true);
    const { data } = await getLibraries();
    if (data) setLibraries(data);
    setLoading(false);
  };

  const selectLibrary = async (lib: SystemLibraryWithCount) => {
    setSelectedLib(lib);
    setItemsLoading(true);
    setShowAddItem(false);
    setEditingItem(null);
    const { data } = await getLibraryItems(lib.id);
    if (data) setItems(data);
    setItemsLoading(false);
  };

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.item_code.toLowerCase().includes(search.toLowerCase()) ||
      item.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (item: SystemLibraryItem) => {
    const { success } = await toggleLibraryItemActive(item.id);
    if (success) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
      );
    }
  };

  const handleDeleteItem = async (item: SystemLibraryItem) => {
    if (!confirm(`Delete "${item.label}"? This action cannot be undone.`)) return;
    const { success } = await deleteLibraryItem(item.id);
    if (success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selectedLib) {
        setLibraries((prev) =>
          prev.map((l) => (l.id === selectedLib.id ? { ...l, item_count: l.item_count - 1 } : l))
        );
      }
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Library Sidebar */}
      <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">Libraries</h3>
          <button
            onClick={() => setShowAddLibrary(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Add Library"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-50" />
              ))}
            </div>
          ) : (
            <div className="p-2">
              {libraries.map((lib) => (
                <button
                  key={lib.id}
                  onClick={() => selectLibrary(lib)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                    selectedLib?.id === lib.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${selectedLib?.id === lib.id ? "text-white" : "text-slate-900"}`}>
                      {lib.name}
                    </p>
                    <p className={`truncate text-xs ${selectedLib?.id === lib.id ? "text-slate-300" : "text-slate-400"}`}>
                      {lib.item_count} items
                    </p>
                  </div>
                  {lib.is_system_reserved && (
                    <svg className={`h-3.5 w-3.5 shrink-0 ${selectedLib?.id === lib.id ? "text-slate-400" : "text-slate-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        {selectedLib ? (
          <>
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedLib.name}</h3>
                <p className="text-xs text-slate-400">
                  {LIBRARY_TYPE_LABELS[selectedLib.library_type] ?? selectedLib.library_type}
                  {selectedLib.description && ` — ${selectedLib.description}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
                <button
                  onClick={() => { setShowAddItem(true); setEditingItem(null); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>
            </div>

            {(showAddItem || editingItem) && (
              <ItemForm
                libraryId={selectedLib.id}
                item={editingItem}
                onSaved={(item) => {
                  if (editingItem) {
                    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
                  } else {
                    setItems((prev) => [...prev, item]);
                    setLibraries((prev) =>
                      prev.map((l) => (l.id === selectedLib.id ? { ...l, item_count: l.item_count + 1 } : l))
                    );
                  }
                  setShowAddItem(false);
                  setEditingItem(null);
                }}
                onCancel={() => { setShowAddItem(false); setEditingItem(null); }}
              />
            )}

            <div className="max-h-[500px] overflow-y-auto">
              {itemsLoading ? (
                <div className="p-6 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-50" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-400">{search ? "No items match your search." : "No items in this library yet."}</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Code</th>
                      <th className="px-6 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Label</th>
                      <th className="px-6 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Value</th>
                      <th className="px-6 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Order</th>
                      <th className="px-6 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="px-6 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-mono text-xs text-slate-600">{item.item_code}</td>
                        <td className="px-6 py-3">
                          <p className="font-medium text-slate-900">{item.label}</p>
                          {item.description && (
                            <p className="text-xs text-slate-400 truncate max-w-[200px]">{item.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-3 text-slate-600">{item.value}</td>
                        <td className="px-6 py-3 text-slate-500">{item.sort_order}</td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => handleToggleActive(item)}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                              item.is_active
                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            {item.is_active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditingItem(item); setShowAddItem(false); }}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              title="Delete"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12">
            <svg className="h-12 w-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="mt-3 text-sm text-slate-400">Select a library from the sidebar to manage its items.</p>
          </div>
        )}
      </div>

      {showAddLibrary && (
        <AddLibraryModal
          onSaved={(lib) => {
            setLibraries((prev) => [...prev, { ...lib, item_count: 0 }]);
            setShowAddLibrary(false);
          }}
          onCancel={() => setShowAddLibrary(false)}
        />
      )}
    </div>
  );
}

function ItemForm({
  libraryId,
  item,
  onSaved,
  onCancel,
}: {
  libraryId: string;
  item: SystemLibraryItem | null;
  onSaved: (item: SystemLibraryItem) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = React.useState({
    item_code: item?.item_code ?? "",
    label: item?.label ?? "",
    value: item?.value ?? "",
    description: item?.description ?? "",
    sort_order: item?.sort_order ?? 0,
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.item_code.trim() || !form.label.trim() || !form.value.trim()) {
      setError("Code, Label, and Value are required.");
      return;
    }

    setSaving(true);
    setError(null);

    if (item) {
      const { success, error: err } = await updateLibraryItem(item.id, {
        label: form.label,
        value: form.value,
        description: form.description || undefined,
        sort_order: form.sort_order,
      });
      if (!success) {
        setError(err ?? "Failed to update item");
        setSaving(false);
        return;
      }
      onSaved({ ...item, ...form, description: form.description || null });
    } else {
      const { data, error: err } = await createLibraryItem({
        library_id: libraryId,
        item_code: form.item_code,
        label: form.label,
        value: form.value,
        description: form.description || undefined,
        sort_order: form.sort_order,
      });
      if (!data || err) {
        setError(err ?? "Failed to create item");
        setSaving(false);
        return;
      }
      onSaved(data);
    }
    setSaving(false);
  };

  return (
    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {item ? "Edit Item" : "Add New Item"}
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Code *</label>
          <input
            type="text"
            value={form.item_code}
            onChange={(e) => setForm((p) => ({ ...p, item_code: e.target.value }))}
            disabled={!!item}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 disabled:opacity-50"
            placeholder="e.g. PARA"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Label *</label>
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="e.g. Paracetamol"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Value *</label>
          <input
            type="text"
            value={form.value}
            onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="e.g. paracetamol"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="Optional description"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Sort Order</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
          />
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs text-rose-500">{error}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : item ? "Update" : "Create"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddLibraryModal({
  onSaved,
  onCancel,
}: {
  onSaved: (lib: SystemLibraryWithCount) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = React.useState({ code: "", name: "", description: "" });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setError("Code and Name are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const { data, error: err } = await createLibrary({
      code: form.code,
      name: form.name,
      description: form.description || undefined,
      library_type: "custom",
    });

    if (!data || err) {
      setError(err ?? "Failed to create library");
      setSaving(false);
      return;
    }

    onSaved(data as SystemLibraryWithCount);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md mx-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Create New Library</h2>
          <p className="text-xs text-slate-400">Define a new system lookup table.</p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Code *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="e.g. CUSTOM_LIST"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="e.g. Custom List"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="Optional description"
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onCancel}
            className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Library"}
          </button>
        </div>
      </div>
    </div>
  );
}
