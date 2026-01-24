'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { VinylFormData } from '@/lib/types';
import type { SearchResultDisplay } from '@/lib/discogs/transform';

interface SearchState {
  results: SearchResultDisplay[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pages: number;
    total: number;
  } | null;
}

interface UseDiscogsSearchReturn extends SearchState {
  search: (query: string) => void;
  searchByBarcode: (barcode: string) => void;
  loadMore: () => void;
  selectRelease: (id: number) => Promise<{
    vinyl: VinylFormData;
    coverImageUrl: string | null;
  } | null>;
  proxyImage: (imageUrl: string, discogsId?: string) => Promise<string | null>;
  clearResults: () => void;
}

const DEBOUNCE_MS = 500;

export function useDiscogsSearch(): UseDiscogsSearchReturn {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
    pagination: null,
  });

  const [currentQuery, setCurrentQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'query' | 'barcode'>('query');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const fetchSearch = useCallback(
    async (query: string, mode: 'query' | 'barcode', page = 1, append = false) => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const endpoint =
          mode === 'barcode'
            ? `/api/discogs/barcode?barcode=${encodeURIComponent(query)}`
            : `/api/discogs/search?q=${encodeURIComponent(query)}&page=${page}`;

        const response = await fetch(endpoint, {
          signal: abortControllerRef.current.signal,
        });

        const data = await response.json();

        if (data.error) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: data.error,
          }));
          return;
        }

        setState((prev) => ({
          results: append ? [...prev.results, ...data.data.results] : data.data.results,
          isLoading: false,
          error: null,
          pagination: data.data.pagination,
        }));
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to search Discogs',
        }));
      }
    },
    []
  );

  const search = useCallback(
    (query: string) => {
      setCurrentQuery(query);
      setSearchMode('query');

      // Clear any existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!query.trim()) {
        setState({
          results: [],
          isLoading: false,
          error: null,
          pagination: null,
        });
        return;
      }

      // Debounce the search
      debounceRef.current = setTimeout(() => {
        fetchSearch(query, 'query');
      }, DEBOUNCE_MS);
    },
    [fetchSearch]
  );

  const searchByBarcode = useCallback(
    (barcode: string) => {
      setCurrentQuery(barcode);
      setSearchMode('barcode');

      // No debounce for barcode - user enters full value
      if (!barcode.trim()) {
        setState({
          results: [],
          isLoading: false,
          error: null,
          pagination: null,
        });
        return;
      }

      fetchSearch(barcode, 'barcode');
    },
    [fetchSearch]
  );

  const loadMore = useCallback(() => {
    if (!state.pagination || state.pagination.page >= state.pagination.pages) {
      return;
    }

    fetchSearch(currentQuery, searchMode, state.pagination.page + 1, true);
  }, [state.pagination, currentQuery, searchMode, fetchSearch]);

  const selectRelease = useCallback(
    async (
      id: number
    ): Promise<{ vinyl: VinylFormData; coverImageUrl: string | null } | null> => {
      try {
        const response = await fetch(`/api/discogs/release/${id}`);
        const data = await response.json();

        if (data.error) {
          console.error('Failed to fetch release:', data.error);
          return null;
        }

        return data.data;
      } catch (err) {
        console.error('Failed to fetch release:', err);
        return null;
      }
    },
    []
  );

  const proxyImage = useCallback(
    async (imageUrl: string, discogsId?: string): Promise<string | null> => {
      try {
        const response = await fetch('/api/discogs/image-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl, discogsId }),
        });

        const data = await response.json();

        if (data.error) {
          console.error('Failed to proxy image:', data.error);
          return null;
        }

        return data.data.url;
      } catch (err) {
        console.error('Failed to proxy image:', err);
        return null;
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    setCurrentQuery('');
    setState({
      results: [],
      isLoading: false,
      error: null,
      pagination: null,
    });
  }, []);

  return {
    ...state,
    search,
    searchByBarcode,
    loadMore,
    selectRelease,
    proxyImage,
    clearResults,
  };
}
