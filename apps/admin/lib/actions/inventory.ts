"use server";

import { createServerClient } from "@repo/supabase/server";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  description: string | null;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
}

export interface StockLot {
  id: string;
  item_id: string;
  batch_number: string;
  quantity: number;
  unit_cost: number | null;
  expiry_date: string | null;
  acquisition_date: string;
  supplier: string | null;
}

export interface StockMovement {
  id: string;
  item_id: string;
  lot_id: string | null;
  movement_type: string;
  quantity: number;
  performed_by: string;
  notes: string | null;
  created_at: string;
}

export async function getInventoryItems(): Promise<{
  data: InventoryItem[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return { data: (data as InventoryItem[]) ?? [], error: error?.message ?? null };
}

export async function createInventoryItem(item: {
  name: string;
  category: string;
  unit?: string;
  description?: string;
  reorder_level?: number;
}): Promise<{ data: InventoryItem | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["super_admin", "admin", "clinic_admin"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions" };
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      name: item.name,
      category: item.category,
      unit: item.unit ?? "tablets",
      description: item.description ?? null,
      reorder_level: item.reorder_level ?? 10,
    })
    .select()
    .single();

  return { data: data as InventoryItem | null, error: error?.message ?? null };
}

export async function getStockLots(itemId: string): Promise<{
  data: StockLot[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("stock_lots")
    .select("*")
    .eq("item_id", itemId)
    .order("expiry_date", { ascending: true });

  return { data: (data as StockLot[]) ?? [], error: error?.message ?? null };
}

export async function recordStockMovement(movement: {
  item_id: string;
  lot_id?: string;
  movement_type: string;
  quantity: number;
  notes?: string;
}): Promise<{ data: StockMovement | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["super_admin", "admin", "clinic_admin", "clinic_staff"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions" };
  }

  const { data, error } = await supabase
    .from("stock_movements")
    .insert({
      item_id: movement.item_id,
      lot_id: movement.lot_id ?? null,
      movement_type: movement.movement_type,
      quantity: movement.quantity,
      performed_by: user.id,
      notes: movement.notes ?? null,
    })
    .select()
    .single();

  return { data: data as StockMovement | null, error: error?.message ?? null };
}
