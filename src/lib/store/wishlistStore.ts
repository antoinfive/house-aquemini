import { create } from 'zustand';
import type { WishlistItem, WishlistFilters, WishlistFormData } from '@/lib/types';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  filters: WishlistFilters;

  // Actions
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  updateItem: (id: string, item: WishlistItem) => void;
  removeItem: (id: string) => void;
  reorderItems: (items: WishlistItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<WishlistFilters>) => void;
  clearFilters: () => void;
  reset: () => void;

  // Async actions
  fetchItems: () => Promise<void>;
  createItem: (data: WishlistFormData) => Promise<WishlistItem | null>;
  editItem: (id: string, data: Partial<WishlistFormData>) => Promise<WishlistItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  updatePositions: (items: WishlistItem[]) => Promise<boolean>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filters: {},

  // Synchronous actions
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, item) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? item : i)),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
  reorderItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
  reset: () => set({ items: [], isLoading: false, error: null, filters: {} }),

  // Async actions
  fetchItems: async () => {
    const { filters, setItems, setLoading, setError } = get();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.tags?.length) {
        filters.tags.forEach((t) => params.append('tag', t));
      }

      const response = await fetch(`/api/wishlist?${params.toString()}`);
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return;
      }

      setItems(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  },

  createItem: async (data) => {
    const { addItem, setLoading, setError } = get();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return null;
      }

      addItem(result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      return null;
    } finally {
      setLoading(false);
    }
  },

  editItem: async (id, data) => {
    const { updateItem, setLoading, setError } = get();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return null;
      }

      updateItem(id, result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      return null;
    } finally {
      setLoading(false);
    }
  },

  deleteItem: async (id) => {
    const { removeItem, setLoading, setError } = get();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return false;
      }

      removeItem(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      return false;
    } finally {
      setLoading(false);
    }
  },

  updatePositions: async (items) => {
    const { reorderItems, setError } = get();

    // Optimistically update the UI
    reorderItems(items);

    try {
      // Update each item's position in the database
      const updates = items.map((item, index) =>
        fetch(`/api/wishlist/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: index }),
        })
      );

      const results = await Promise.all(updates);
      const hasError = results.some((r) => !r.ok);

      if (hasError) {
        setError('Failed to save new order');
        return false;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update positions');
      return false;
    }
  },
}));
