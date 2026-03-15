'use client';

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useVinylStore } from '@/lib/store/vinylStore';
import type { Vinyl, VinylFilters, VinylFormData } from '@/lib/types';

interface UseVinylsOptions {
  autoFetch?: boolean;
  filters?: VinylFilters;
  initialData?: Vinyl[];
}

export function useVinyls(options: UseVinylsOptions = {}) {
  const { autoFetch = true, filters, initialData } = options;

  // Combine all selectors into a single shallow selector to reduce subscriptions
  const {
    vinyls,
    isLoading,
    error,
    storeFilters,
    hasMore,
    total,
    fetchVinyls,
    createVinyl,
    editVinyl,
    deleteVinyl,
    setFilters,
    clearFilters,
  } = useVinylStore(
    useShallow((state) => ({
      vinyls: state.vinyls,
      isLoading: state.isLoading,
      error: state.error,
      storeFilters: state.filters,
      hasMore: state.hasMore,
      total: state.total,
      fetchVinyls: state.fetchVinyls,
      createVinyl: state.createVinyl,
      editVinyl: state.editVinyl,
      deleteVinyl: state.deleteVinyl,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
    }))
  );

  // Track previous filters to avoid unnecessary updates from unstable object references
  const prevFiltersRef = useRef<string | null>(null);
  // Track if initial fetch has been done to prevent duplicate fetches
  const hasFetchedRef = useRef(false);
  // Track if initial data has been seeded
  const hasSeededRef = useRef(false);

  // Seed store with server-provided initial data (once)
  useEffect(() => {
    if (initialData && !hasSeededRef.current) {
      hasSeededRef.current = true;
      hasFetchedRef.current = true;
      const store = useVinylStore.getState();
      store.setVinyls(initialData);
      store.setLoading(false);
      useVinylStore.setState({ total: initialData.length });
    }
  }, [initialData]);

  // Set initial filters if provided - compare serialized values to handle object instability
  useEffect(() => {
    if (filters) {
      const serialized = JSON.stringify(filters);
      if (serialized !== prevFiltersRef.current) {
        prevFiltersRef.current = serialized;
        setFilters(filters);
      }
    }
  }, [filters, setFilters]);

  // Fetch vinyls on mount if autoFetch is true (only once)
  useEffect(() => {
    if (autoFetch && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchVinyls();
    }
  }, [autoFetch, fetchVinyls]);

  // Track whether filters have ever been set (to skip only the initial empty state)
  const filtersEverSetRef = useRef(false);

  // Refetch when filters change (skip only the initial empty filters)
  useEffect(() => {
    if (!hasFetchedRef.current) return;
    if (Object.keys(storeFilters).length > 0) {
      filtersEverSetRef.current = true;
    }
    if (filtersEverSetRef.current) {
      fetchVinyls();
    }
  }, [storeFilters, fetchVinyls]);

  const refetch = () => fetchVinyls();
  const loadMore = () => fetchVinyls({ append: true });

  const addVinyl = async (data: VinylFormData) => {
    const vinyl = await createVinyl(data);
    return vinyl;
  };

  const updateVinyl = async (id: string, data: Partial<VinylFormData>) => {
    const vinyl = await editVinyl(id, data);
    return vinyl;
  };

  const removeVinyl = async (id: string) => {
    const success = await deleteVinyl(id);
    return success;
  };

  const search = (query: string) => {
    setFilters({ search: query || undefined });
  };

  const filterByGenre = (genres: string[]) => {
    setFilters({ genre: genres.length > 0 ? genres : undefined });
  };

  const filterByYearRange = (start?: number, end?: number) => {
    setFilters({ yearStart: start, yearEnd: end });
  };

  return {
    vinyls,
    isLoading,
    error,
    filters: storeFilters,
    hasMore,
    total,
    refetch,
    loadMore,
    addVinyl,
    updateVinyl,
    removeVinyl,
    search,
    filterByGenre,
    filterByYearRange,
    clearFilters,
  };
}
