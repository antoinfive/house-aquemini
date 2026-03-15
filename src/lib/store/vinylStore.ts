import { create } from 'zustand';
import type { Vinyl, VinylFilters, VinylFormData } from '@/lib/types';

interface VinylState {
  vinyls: Vinyl[];
  isLoading: boolean;
  error: string | null;
  filters: VinylFilters;
  hasMore: boolean;
  total: number;
  lastFetchedAt: number | null;

  // Actions
  setVinyls: (vinyls: Vinyl[]) => void;
  appendVinyls: (vinyls: Vinyl[]) => void;
  addVinyl: (vinyl: Vinyl) => void;
  updateVinyl: (id: string, vinyl: Vinyl) => void;
  removeVinyl: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<VinylFilters>) => void;
  clearFilters: () => void;
  reset: () => void;

  // Async actions
  fetchVinyls: (options?: { append?: boolean }) => Promise<void>;
  createVinyl: (data: VinylFormData) => Promise<Vinyl | null>;
  editVinyl: (id: string, data: Partial<VinylFormData>) => Promise<Vinyl | null>;
  deleteVinyl: (id: string) => Promise<boolean>;
}

const CACHE_TTL_MS = 60_000; // 60 seconds

export const useVinylStore = create<VinylState>((set, get) => ({
  vinyls: [],
  isLoading: true,  // Start as true to prevent empty state flash
  error: null,
  filters: {},
  hasMore: false,
  total: 0,
  lastFetchedAt: null,

  // Synchronous actions
  setVinyls: (vinyls) => set({ vinyls }),
  appendVinyls: (newVinyls) => set((state) => {
    const existingIds = new Set(state.vinyls.map((v) => v.id));
    const unique = newVinyls.filter((v) => !existingIds.has(v.id));
    return { vinyls: [...state.vinyls, ...unique] };
  }),
  addVinyl: (vinyl) => set((state) => ({ vinyls: [vinyl, ...state.vinyls], total: state.total + 1 })),
  updateVinyl: (id, vinyl) =>
    set((state) => ({
      vinyls: state.vinyls.map((v) => (v.id === id ? vinyl : v)),
    })),
  removeVinyl: (id) =>
    set((state) => ({
      vinyls: state.vinyls.filter((v) => v.id !== id),
      total: state.total - 1,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters }, lastFetchedAt: null })),
  clearFilters: () => set({ filters: {}, lastFetchedAt: null }),
  reset: () => set({ vinyls: [], isLoading: false, error: null, filters: {}, hasMore: false, total: 0, lastFetchedAt: null }),

  // Async actions
  fetchVinyls: async (options = {}) => {
    const { append = false } = options;
    const { filters, vinyls, lastFetchedAt, setVinyls, appendVinyls, setLoading, setError } = get();

    // Stale-while-revalidate: skip fetch if cached data is recent and filters haven't changed
    if (!append && lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL_MS && vinyls.length > 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.genre?.length) {
        filters.genre.forEach((g) => params.append('genre', g));
      }
      if (filters.yearStart) params.append('yearStart', filters.yearStart.toString());
      if (filters.yearEnd) params.append('yearEnd', filters.yearEnd.toString());

      const offset = append ? vinyls.length : 0;
      params.append('limit', '50');
      params.append('offset', offset.toString());

      const response = await fetch(`/api/vinyls?${params.toString()}`);
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return;
      }

      if (append) {
        appendVinyls(result.data || []);
      } else {
        setVinyls(result.data || []);
      }
      set({
        hasMore: result.hasMore ?? false,
        total: result.total ?? (result.data?.length || 0),
        lastFetchedAt: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vinyls');
    } finally {
      setLoading(false);
    }
  },

  createVinyl: async (data) => {
    const { addVinyl, setLoading, setError } = get();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vinyls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return null;
      }

      addVinyl(result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vinyl');
      return null;
    } finally {
      setLoading(false);
    }
  },

  editVinyl: async (id, data) => {
    const { updateVinyl, setLoading, setError } = get();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/vinyls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return null;
      }

      updateVinyl(id, result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vinyl');
      return null;
    } finally {
      setLoading(false);
    }
  },

  deleteVinyl: async (id) => {
    const { removeVinyl, setLoading, setError } = get();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/vinyls/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return false;
      }

      removeVinyl(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vinyl');
      return false;
    } finally {
      setLoading(false);
    }
  },
}));
