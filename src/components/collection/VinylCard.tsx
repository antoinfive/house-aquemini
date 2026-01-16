'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Vinyl } from '@/lib/types';

interface VinylCardProps {
  vinyl: Vinyl;
  isOwner?: boolean;
  onEdit?: (vinyl: Vinyl) => void;
  onDelete?: (vinyl: Vinyl) => void;
  onSetNowPlaying?: (vinyl: Vinyl) => void;
  onClick?: (vinyl: Vinyl) => void;
}

export function VinylCard({
  vinyl,
  isOwner = false,
  onEdit,
  onDelete,
  onSetNowPlaying,
  onClick,
}: VinylCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick?.(vinyl);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(vinyl);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(vinyl);
  };

  const handleSetNowPlaying = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetNowPlaying?.(vinyl);
  };

  return (
    <div
      className="card-vinyl overflow-hidden cursor-pointer group"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${vinyl.album} by ${vinyl.artist}`}
    >
      {/* Cover Art */}
      <div className="relative aspect-square bg-wood-100 dark:bg-analog-800">
        {vinyl.cover_art_url && !imageError ? (
          <Image
            src={vinyl.cover_art_url}
            alt={`${vinyl.album} cover`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-wood-300 dark:text-analog-600"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg truncate">{vinyl.album}</h3>
            <p className="text-white/80 text-sm truncate">{vinyl.artist}</p>
            {vinyl.year && <p className="text-white/60 text-sm">{vinyl.year}</p>}
          </div>

          {/* Quick Actions (Owner only) */}
          {isOwner && (
            <div className="absolute top-3 right-3 flex gap-2">
              {onSetNowPlaying && (
                <button
                  onClick={handleSetNowPlaying}
                  className="p-2 bg-warm-500 hover:bg-warm-600 rounded-full text-white transition-colors"
                  aria-label="Set as now playing"
                  title="Set as now playing"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-2 bg-wood-500 hover:bg-wood-600 rounded-full text-white transition-colors"
                  aria-label="Edit vinyl"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                  aria-label="Delete vinyl"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Info (always visible) */}
      <div className="p-3">
        <h3 className="font-medium text-analog-800 dark:text-wood-100 truncate">{vinyl.album}</h3>
        <p className="text-sm text-analog-500 dark:text-analog-400 truncate">{vinyl.artist}</p>
        {vinyl.genre && vinyl.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {vinyl.genre.slice(0, 2).map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 bg-wood-100 dark:bg-analog-700 text-analog-600 dark:text-wood-300 text-xs rounded"
              >
                {g}
              </span>
            ))}
            {vinyl.genre.length > 2 && (
              <span className="px-2 py-0.5 text-analog-400 text-xs">+{vinyl.genre.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
