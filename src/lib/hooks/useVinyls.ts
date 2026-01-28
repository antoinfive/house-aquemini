'use client';

import { useEffect } from 'react';
import { useVinylStore } from '@/lib/store/vinylStore';
import type { VinylFilters, VinylFormData } from '@/lib/types';

interface UseVinylsOptions {
  autoFetch?: boolean;
  filters?: VinylFilters;
}

export function useVinyls(options: UseVinylsOptions = {}) {
  const { autoFetch = true, filters } = options;

  const vinyls = useVinylStore((state) => state.vinyls);
  const isLoading = useVinylStore((state) => state.isLoading);
  const error = useVinylStore((state) => state.error);
  const storeFilters = useVinylStore((state) => state.filters);

  const fetchVinyls = useVinylStore((state) => state.fetchVinyls);
  const createVinyl = useVinylStore((state) => state.createVinyl);
  const editVinyl = useVinylStore((state) => state.editVinyl);
  const deleteVinyl = useVinylStore((state) => state.deleteVinyl);
  const setFilters = useVinylStore((state) => state.setFilters);
  const clearFilters = useVinylStore((state) => state.clearFilters);

  // Set initial filters if provided
  useEffect(() => {
    if (filters) {
      setFilters(filters);
    }
  }, [filters, setFilters]);

  // Fetch vinyls on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchVinyls();
    }
  }, [autoFetch, fetchVinyls]);

  // Refetch when filters change
  useEffect(() => {
    if (autoFetch && Object.keys(storeFilters).length > 0) {
      fetchVinyls();
    }
  }, [autoFetch, storeFilters, fetchVinyls]);

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
