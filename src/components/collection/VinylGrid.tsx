'use client';

import { VinylCard } from './VinylCard';
import type { Vinyl } from '@/lib/types';

interface VinylGridProps {
  vinyls: Vinyl[];
  isLoading?: boolean;
  isOwner?: boolean;
  onVinylClick?: (vinyl: Vinyl) => void;
  onEdit?: (vinyl: Vinyl) => void;
  onDelete?: (vinyl: Vinyl) => void;
  onSetNowPlaying?: (vinyl: Vinyl) => void;
  emptyMessage?: string;
}

function VinylGridSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card-vinyl overflow-hidden animate-pulse">
          <div className="aspect-square bg-wood-200 dark:bg-analog-700" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-wood-200 dark:bg-analog-700 rounded w-3/4" />
            <div className="h-3 bg-wood-200 dark:bg-analog-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="w-24 h-24 text-wood-300 dark:text-analog-600 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="1" />
        <circle cx="12" cy="12" r="4" strokeWidth="1" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <path strokeLinecap="round" strokeWidth="1" d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
      <h3 className="text-lg font-medium text-analog-600 dark:text-analog-400 mb-1">
        No vinyls yet
      </h3>
      <p className="text-analog-500 dark:text-analog-500 max-w-sm">{message}</p>
    </div>
  );
}

export function VinylGrid({
  vinyls,
  isLoading = false,
  isOwner = false,
  onVinylClick,
  onEdit,
  onDelete,
  onSetNowPlaying,
  emptyMessage = 'Start building your collection by adding your first vinyl record.',
}: VinylGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {isLoading ? (
        <VinylGridSkeleton />
      ) : vinyls.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        vinyls.map((vinyl) => (
          <VinylCard
            key={vinyl.id}
            vinyl={vinyl}
            isOwner={isOwner}
            onClick={onVinylClick}
            onEdit={onEdit}
            onDelete={onDelete}
            onSetNowPlaying={onSetNowPlaying}
          />
        ))
      )}
    </div>
  );
}
