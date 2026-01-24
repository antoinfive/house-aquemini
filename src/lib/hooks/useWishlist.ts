'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import type { WishlistFormData, WishlistItem } from '@/lib/types';

export function useWishlist() {
  const {
    items,
    isLoading,
    error,
    filters,
    fetchItems,
    createItem,
    editItem,
    deleteItem,
    updatePositions,
    setFilters,
    clearFilters,
    reset,
  } = useWishlistStore();

  // Fetch items on mount and when filters change
  useEffect(() => {
    fetchItems();
  }, [fetchItems, filters.priority, filters.tags]);

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

  const filterByPriority = (priority: 'high' | 'medium' | 'low' | undefined) => {
    setFilters({ priority });
  };

  const filterByTags = (tags: string[]) => {
    setFilters({ tags });
  };

  return {
    items,
    isLoading,
    error,
    filters,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    filterByPriority,
    filterByTags,
    clearFilters,
    reset,
  };
}
