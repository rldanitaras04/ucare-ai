"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import type { Database, Json } from "@repo/types";

type SystemLibraryType = Database["public"]["Enums"]["system_library_type"];

export interface SystemLibrary {
  id: string;
  code: string;
  name: string;
  description: string | null;
  library_type: SystemLibraryType;
  is_system_reserved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemLibraryItem {
  id: string;
  library_id: string;
  item_code: string;
  label: string;
  value: string;
  description: string | null;
  metadata: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemLibraryWithCount extends SystemLibrary {
  item_count: number;
}

async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Not authenticated" as const };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["super_admin", "admin", "clinic_admin"].includes(callerRole)) {
    return { supabase: null, error: "Insufficient permissions" as const };
  }

  return { supabase, error: null };
}

export async function getLibraries(): Promise<{ data: SystemLibraryWithCount[] | null; error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { data: null, error: authError };

  const { data: libraries, error } = await supabase
    .from("system_libraries")
    .select("*")
    .order("name");

  if (error) return { data: null, error: error.message };

  const { data: counts } = await supabase
    .from("system_library_items")
    .select("library_id")
    .eq("is_active", true);

  const countMap: Record<string, number> = {};
  (counts ?? []).forEach((item) => {
    countMap[item.library_id] = (countMap[item.library_id] || 0) + 1;
  });

  const enriched = (libraries ?? []).map((lib) => ({
    ...lib,
    item_count: countMap[lib.id] || 0,
  }));

  return { data: enriched, error: null };
}

export async function getLibraryByCode(code: string): Promise<{ data: SystemLibrary | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("system_libraries")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  return { data: data as SystemLibrary | null, error: error?.message ?? null };
}

export async function getLibraryItems(libraryId: string): Promise<{ data: SystemLibraryItem[] | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("system_library_items")
    .select("*")
    .eq("library_id", libraryId)
    .order("sort_order");

  return { data: (data as SystemLibraryItem[]) ?? [], error: error?.message ?? null };
}

export async function getActiveLibraryItemsByCode(code: string): Promise<{ data: SystemLibraryItem[] | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data: library } = await supabase
    .from("system_libraries")
    .select("id")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (!library) return { data: null, error: `Library not found: ${code}` };

  const { data, error } = await supabase
    .from("system_library_items")
    .select("*")
    .eq("library_id", library.id)
    .eq("is_active", true)
    .order("sort_order");

  return { data: (data as SystemLibraryItem[]) ?? [], error: error?.message ?? null };
}

export async function createLibrary(data: {
  code: string;
  name: string;
  description?: string;
  library_type?: SystemLibraryType;
}): Promise<{ data: SystemLibrary | null; error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { data: null, error: authError };

  const { data: library, error } = await supabase
    .from("system_libraries")
    .insert({
      code: data.code.toUpperCase().replace(/\s+/g, "_"),
      name: data.name,
      description: data.description ?? null,
      library_type: data.library_type ?? "custom",
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath("/system-library");
  return { data: library as SystemLibrary, error: null };
}

export async function updateLibrary(id: string, data: {
  name?: string;
  description?: string;
  is_active?: boolean;
}): Promise<{ success: boolean; error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { success: false, error: authError };

  const { error } = await supabase
    .from("system_libraries")
    .update(data)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/system-library");
  return { success: true, error: null };
}

export async function deleteLibrary(id: string): Promise<{ success: boolean; error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { success: false, error: authError };

  const { data: library } = await supabase
    .from("system_libraries")
    .select("is_system_reserved")
    .eq("id", id)
    .single();

  if (library?.is_system_reserved) {
    return { success: false, error: "Cannot delete a system-reserved library. Deactivate it instead." };
  }

  const { error } = await supabase
    .from("system_libraries")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/system-library");
  return { success: true, error: null };
}

export async function createLibraryItem(data: {
  library_id: string;
  item_code: string;
  label: string;
  value: string;
  description?: string;
  metadata?: Record<string, unknown>;
  sort_order?: number;
}): Promise<{ data: SystemLibraryItem | null; error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { data: null, error: authError };

  const { data: item, error } = await supabase
    .from("system_library_items")
    .insert({
      library_id: data.library_id,
      item_code: data.item_code.toUpperCase().replace(/\s+/g, "_"),
      label: data.label,
      value: data.value,
      description: data.description ?? null,
      metadata: (data.metadata ?? {}) as Json,
      sort_order: data.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath("/system-library");
  return { data: item as SystemLibraryItem, error: null };
}

export async function updateLibraryItem(id: string, data: {
  label?: string;
  value?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  sort_order?: number;
  is_active?: boolean;
}): Promise<{ success: boolean; error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { success: false, error: authError };

  const { error } = await supabase
    .from("system_library_items")
    .update(data as never)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/system-library");
  return { success: true, error: null };
}

export async function toggleLibraryItemActive(id: string): Promise<{ success: boolean; error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { success: false, error: authError };

  const { data: item } = await supabase
    .from("system_library_items")
    .select("is_active")
    .eq("id", id)
    .single();

  if (!item) return { success: false, error: "Item not found" };

  const { error } = await supabase
    .from("system_library_items")
    .update({ is_active: !item.is_active })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/system-library");
  return { success: true, error: null };
}

export async function deleteLibraryItem(id: string): Promise<{ success: boolean; error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { success: false, error: authError };

  const { error } = await supabase
    .from("system_library_items")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/system-library");
  return { success: true, error: null };
}
