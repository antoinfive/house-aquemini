import { create } from 'zustand';
import type { WishlistItem, WishlistFilters, WishlistFormData } from '@/lib/types';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  filters: WishlistFilters;
  hasMore: boolean;
  total: number;
  lastFetchedAt: number | null;

  // Actions
  setItems: (items: WishlistItem[]) => void;
  appendItems: (items: WishlistItem[]) => void;
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
  fetchItems: (options?: { append?: boolean }) => Promise<void>;
  createItem: (data: WishlistFormData) => Promise<WishlistItem | null>;
  editItem: (id: string, data: Partial<WishlistFormData>) => Promise<WishlistItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  updatePositions: (items: WishlistItem[]) => Promise<boolean>;
}

const CACHE_TTL_MS = 60_000; // 60 seconds

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filters: {},
  hasMore: false,
  total: 0,
  lastFetchedAt: null,

  // Synchronous actions
  setItems: (items) => set({ items }),
  appendItems: (newItems) => set((state) => {
    const existingIds = new Set(state.items.map((i) => i.id));
    const unique = newItems.filter((i) => !existingIds.has(i.id));
    return { items: [...state.items, ...unique] };
  }),
  addItem: (item) => set((state) => ({ items: [...state.items, item], total: state.total + 1 })),
  updateItem: (id, item) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? item : i)),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      total: state.total - 1,
    })),
  reorderItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters }, lastFetchedAt: null })),
  clearFilters: () => set({ filters: {}, lastFetchedAt: null }),
  reset: () => set({ items: [], isLoading: false, error: null, filters: {}, hasMore: false, total: 0, lastFetchedAt: null }),

  // Async actions
  fetchItems: async (options = {}) => {
    const { append = false } = options;
    const { filters, items, lastFetchedAt, setItems, appendItems, setLoading, setError } = get();

    // Stale-while-revalidate: skip fetch if cached data is recent
    if (!append && lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL_MS && items.length > 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);

      const offset = append ? items.length : 0;
      params.append('limit', '50');
      params.append('offset', offset.toString());

      const response = await fetch(`/api/wishlist?${params.toString()}`);
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return;
      }

      if (append) {
        appendItems(result.data || []);
      } else {
        setItems(result.data || []);
      }
      set({
        hasMore: result.hasMore ?? false,
        total: result.total ?? (result.data?.length || 0),
        lastFetchedAt: Date.now(),
      });
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
      const response = await fetch('/api/wishlist/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item, index) => ({ id: item.id, position: index })),
        }),
      });

      const result = await response.json();

      if (result.error) {
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
