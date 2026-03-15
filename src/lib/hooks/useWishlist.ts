'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import type { WishlistFormData, WishlistItem } from '@/lib/types';

interface UseWishlistOptions {
  initialData?: WishlistItem[];
}

export function useWishlist(options: UseWishlistOptions = {}) {
  const { initialData } = options;

  const {
    items,
    isLoading,
    error,
    filters,
    hasMore,
    total,
    fetchItems,
    createItem,
    editItem,
    deleteItem,
    updatePositions,
    setFilters,
    clearFilters,
    reset,
  } = useWishlistStore();

  // Track if initial data has been seeded
  const hasSeededRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Seed store with server-provided initial data (once)
  useEffect(() => {
    if (initialData && !hasSeededRef.current) {
      hasSeededRef.current = true;
      hasFetchedRef.current = true;
      const store = useWishlistStore.getState();
      store.setItems(initialData);
      store.setLoading(false);
      useWishlistStore.setState({ total: initialData.length });
    }
  }, [initialData]);

  // Fetch items on mount and when filters change (skip if seeded)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchItems();
    }
  }, [fetchItems]);

  // Track whether filters have ever been set (to skip only the initial empty state)
  const filtersEverSetRef = useRef(false);

  // Refetch when any filter changes (skip only the initial empty filters)
  useEffect(() => {
    if (!hasFetchedRef.current) return;
    if (Object.keys(filters).length > 0) {
      filtersEverSetRef.current = true;
    }
    if (filtersEverSetRef.current) {
      fetchItems();
    }
  }, [filters, fetchItems]);

  const addItem = async (data: WishlistFormData) => {
    return createItem(data);
  };

  const updateItem = async (id: string, data: Partial<WishlistFormData>) => {
    return editItem(id, data);
  };

  const removeItem = async (id: string) => {
    return deleteItem(id);
  };

  const reorderItems = async (items: WishlistItem[]) => {
    return updatePositions(items);
  };

  const loadMore = () => fetchItems({ append: true });

  const search = useCallback((query: string) => {
    setFilters({ search: query || undefined });
  }, [setFilters]);

  return {
    items,
    isLoading,
    error,
    filters,
    hasMore,
    total,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    loadMore,
    search,
    clearFilters,
    reset,
  };
}
