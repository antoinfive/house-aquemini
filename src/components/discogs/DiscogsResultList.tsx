'use client';

import { DiscogsResultCard } from './DiscogsResultCard';
import { Button } from '@/components/ui';
import type { SearchResultDisplay } from '@/lib/discogs/transform';

interface DiscogsResultListProps {
  results: SearchResultDisplay[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pages: number;
    total: number;
  } | null;
  onSelect: (result: SearchResultDisplay) => void;
  onLoadMore?: () => void;
  selectingId?: number | null;
  emptyMessage?: string;
}

export function DiscogsResultList({
  results,
  isLoading,
  error,
  pagination,
  onSelect,
  onLoadMore,
  selectingId = null,
  emptyMessage = 'No results found. Try a different search.',
}: DiscogsResultListProps) {
  // Loading skeleton
  if (isLoading && results.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-4 p-3 rounded-lg border border-steel-700 bg-steel-800/30 animate-pulse"
          >
            <div className="w-16 h-16 bg-steel-700 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-steel-700 rounded w-1/2" />
              <div className="h-3 bg-steel-700 rounded w-1/3" />
              <div className="h-3 bg-steel-700 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center rounded-lg border border-red-800/50 bg-red-900/20">
        <svg
          className="w-8 h-8 mx-auto text-red-400 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  // Empty state
  if (results.length === 0) {
    return (
      <div className="p-8 text-center rounded-lg border border-steel-700 bg-steel-800/30">
        <svg
          className="w-12 h-12 mx-auto text-steel-600 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <p className="text-steel-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const hasMore = pagination && pagination.page < pagination.pages;

  return (
    <div className="space-y-4">
      {/* Results count */}
      {pagination && (
        <p className="text-xs text-steel-500">
          Showing {results.length} of {pagination.total} results
        </p>
      )}

      {/* Results list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {results.map((result) => (
          <DiscogsResultCard
            key={result.id}
            result={result}
            onSelect={onSelect}
            isSelecting={selectingId === result.id}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="pt-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            isLoading={isLoading}
          >
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
}
