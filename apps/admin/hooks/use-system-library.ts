"use client";

import * as React from "react";
import { getActiveLibraryItemsByCode, type SystemLibraryItem } from "@/lib/actions/system-library";

const cache = new Map<string, { data: SystemLibraryItem[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export function useSystemLibrary(libraryCode: string) {
  const [items, setItems] = React.useState<SystemLibraryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      const cached = cache.get(libraryCode);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setItems(cached.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: err } = await getActiveLibraryItemsByCode(libraryCode);

      if (!cancelled) {
        if (err) {
          setError(err);
          setItems([]);
        } else if (data) {
          setItems(data);
          cache.set(libraryCode, { data, timestamp: Date.now() });
        }
        setLoading(false);
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [libraryCode]);

  const getItemByCode = React.useCallback(
    (code: string) => items.find((item) => item.item_code === code),
    [items]
  );

  const getItemByValue = React.useCallback(
    (value: string) => items.find((item) => item.value === value),
    [items]
  );

  const getSelectOptions = React.useCallback(
    () =>
      items.map((item) => ({
        value: item.value,
        label: item.label,
        code: item.item_code,
        metadata: item.metadata,
      })),
    [items]
  );

  return {
    items,
    loading,
    error,
    getItemByCode,
    getItemByValue,
    getSelectOptions,
  };
}

export function clearLibraryCache() {
  cache.clear();
}
