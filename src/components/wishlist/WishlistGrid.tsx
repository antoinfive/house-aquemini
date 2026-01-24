'use client';

import { WishlistCard } from './WishlistCard';
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
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
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
}

export function WishlistGrid({
  items,
  isLoading = false,
  isOwner = false,
  onItemClick,
  onEdit,
  onDelete,
  onAddToCollection,
  emptyMessage = 'No items in your wishlist yet.',
}: WishlistGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <WishlistCard
          key={item.id}
          item={item}
          isOwner={isOwner}
          onClick={onItemClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddToCollection={onAddToCollection}
        />
      ))}
    </div>
  );
}
