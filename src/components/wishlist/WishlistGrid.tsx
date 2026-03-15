'use client';

import { memo } from 'react';
import { WishlistCard } from './WishlistCard';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import type { WishlistItem } from '@/lib/types';

interface WishlistGridProps {
  items: WishlistItem[];
  isLoading?: boolean;
  isOwner?: boolean;
  onItemClick?: (item: WishlistItem) => void;
  onEdit?: (item: WishlistItem) => void;
  onDelete?: (item: WishlistItem) => void;
  onAddToCollection?: (item: WishlistItem) => void;
  emptyMessage?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

// Hoist static array outside component to avoid recreation on each render
const SKELETON_INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

const WishlistGridSkeleton = memo(function WishlistGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {SKELETON_INDICES.map((i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-steel-800 rounded-lg" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-steel-800 rounded w-3/4" />
            <div className="h-3 bg-steel-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
});

export const WishlistGrid = memo(function WishlistGrid({
  items,
  isLoading = false,
  isOwner = false,
  onItemClick,
  onEdit,
  onDelete,
  onAddToCollection,
  emptyMessage = 'No items in your wishlist yet.',
  hasMore = false,
  onLoadMore,
}: WishlistGridProps) {
  const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore });

  if (isLoading && items.length === 0) {
    return <WishlistGridSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          className="w-16 h-16 text-steel-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <p className="text-steel-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="card-enter"
            style={{ animationDelay: `${Math.min(index * 0.04, 0.8)}s` }}
          >
            <WishlistCard
              item={item}
              isOwner={isOwner}
              onClick={onItemClick}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddToCollection={onAddToCollection}
            />
          </div>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </>
  );
});
