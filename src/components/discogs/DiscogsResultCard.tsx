'use client';

import Image from 'next/image';
import type { SearchResultDisplay } from '@/lib/discogs/transform';

interface DiscogsResultCardProps {
  result: SearchResultDisplay;
  onSelect: (result: SearchResultDisplay) => void;
  isSelecting?: boolean;
}

export function DiscogsResultCard({
  result,
  onSelect,
  isSelecting = false,
}: DiscogsResultCardProps) {
  const handleClick = () => {
    if (!isSelecting) {
      onSelect(result);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        flex gap-4 p-3 rounded-lg border border-steel-700
        bg-steel-800/50 hover:bg-steel-700/50 hover:border-brass-600
        cursor-pointer transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-brass-500/50
        ${isSelecting ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Cover thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-steel-900">
        {result.thumb ? (
          <Image
            src={result.thumb}
            alt={`${result.album} cover`}
            fill
            className="object-cover"
            sizes="64px"
            unoptimized // Discogs images are external
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-steel-600"
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
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-steel-100 font-medium truncate">{result.artist}</h4>
        <p className="text-brass-400 text-sm truncate">{result.album}</p>

        {/* Metadata row */}
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-steel-400">
          {result.year && <span>{result.year}</span>}
          {result.label && (
            <span className="truncate max-w-[120px]">{result.label}</span>
          )}
          {result.catno && result.catno !== 'none' && (
            <span className="font-mono text-steel-500">{result.catno}</span>
          )}
        </div>

        {/* Format & Country */}
        {(result.format || result.country) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {result.format && (
              <span className="inline-flex px-1.5 py-0.5 text-xs bg-steel-700 text-steel-300 rounded">
                {result.format}
              </span>
            )}
            {result.country && (
              <span className="inline-flex px-1.5 py-0.5 text-xs bg-steel-700/50 text-steel-400 rounded">
                {result.country}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Select indicator */}
      <div className="flex-shrink-0 self-center">
        {isSelecting ? (
          <svg
            className="w-5 h-5 text-brass-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-steel-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
