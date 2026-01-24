'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { WishlistItem } from '@/lib/types';

interface WishlistCardProps {
  item: WishlistItem;
  isOwner?: boolean;
  onEdit?: (item: WishlistItem) => void;
  onDelete?: (item: WishlistItem) => void;
  onAddToCollection?: (item: WishlistItem) => void;
  onClick?: (item: WishlistItem) => void;
  isDragging?: boolean;
}

export function WishlistCard({
  item,
  isOwner = false,
  onEdit,
  onDelete,
  onAddToCollection,
  onClick,
  isDragging = false,
}: WishlistCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick?.(item);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(item);
  };

  const handleAddToCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCollection?.(item);
  };

  return (
    <div
      className={`card-vinyl overflow-hidden cursor-pointer group transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95 rotate-2' : ''
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${item.album} by ${item.artist}`}
    >
      {/* Cover Art */}
      <div className="relative aspect-square bg-steel-900">
        {item.cover_art_url && !imageError ? (
          <Image
            src={item.cover_art_url}
            alt={`${item.album} cover`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-steel-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-steel-100 font-semibold text-lg truncate">{item.album}</h3>
            <p className="text-steel-300 text-sm truncate">{item.artist}</p>
            {item.year && <p className="text-steel-400 text-sm font-mono">{item.year}</p>}
            {item.target_price && (
              <p className="text-brass-400 text-sm font-mono mt-1">
                Target: ${item.target_price}
              </p>
            )}
          </div>

          {/* Quick Actions (Owner only) */}
          {isOwner && (
            <div className="absolute top-3 right-3 flex gap-2">
              {onAddToCollection && (
                <button
                  onClick={handleAddToCollection}
                  className="p-2 bg-brass-500 hover:bg-brass-400 rounded-full text-steel-900 transition-colors"
                  aria-label="Add to collection"
                  title="Add to Collection"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              )}
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-2 bg-steel-600 hover:bg-steel-500 rounded-full text-steel-200 transition-colors"
                  aria-label="Edit item"
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
                  className="p-2 bg-red-600 hover:bg-red-500 rounded-full text-white transition-colors"
                  aria-label="Delete item"
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
        <h3 className="font-medium text-steel-100 truncate">{item.album}</h3>
        <p className="text-sm text-steel-400 truncate">{item.artist}</p>
        {item.year && (
          <p className="text-sm text-steel-500 font-mono mt-1">{item.year}</p>
        )}
      </div>
    </div>
  );
}
