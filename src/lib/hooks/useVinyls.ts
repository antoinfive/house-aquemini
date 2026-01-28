'use client';

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useVinylStore } from '@/lib/store/vinylStore';
import type { VinylFilters, VinylFormData } from '@/lib/types';

interface UseVinylsOptions {
  autoFetch?: boolean;
  filters?: VinylFilters;
}

export function useVinyls(options: UseVinylsOptions = {}) {
  const { autoFetch = true, filters } = options;

  // Combine all selectors into a single shallow selector to reduce subscriptions
  const {
    vinyls,
    isLoading,
    error,
    storeFilters,
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

  // Refetch when filters change (skip initial empty filters)
  useEffect(() => {
    // Only refetch if we've already done the initial fetch and filters have values
    if (hasFetchedRef.current && Object.keys(storeFilters).length > 0) {
      fetchVinyls();
    }
  }, [storeFilters, fetchVinyls]);

  const refetch = () => fetchVinyls();

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
    refetch,
    addVinyl,
    updateVinyl,
    removeVinyl,
    search,
    filterByGenre,
    filterByYearRange,
    clearFilters,
  };
}
