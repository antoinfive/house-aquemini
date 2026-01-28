'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Vinyl } from '@/lib/types';

interface CarouselItemProps {
  vinyl: Vinyl;
  offset: number;
  onClick: () => void;
  itemSize: number;
  spacing: number;
}

const CUSTOM_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function getPositionStyles(offset: number, spacing: number) {
  const absOffset = Math.abs(offset);

  if (absOffset === 0) {
    return {
      x: 0,
      scale: 1.15,
      opacity: 1,
      zIndex: 50,
    };
  }

  if (absOffset === 1) {
    return {
      x: offset * spacing,
      scale: 0.85,
      opacity: 0.75,
      zIndex: 30,
    };
  }

  return {
    x: offset * spacing,
    scale: 0.7,
    opacity: 0.5,
    zIndex: 10,
  };
}

export function CarouselItem({
  vinyl,
  offset,
  onClick,
  itemSize,
  spacing,
}: CarouselItemProps) {
  const [imageError, setImageError] = useState(false);
  const isCenter = offset === 0;
  const { x, scale, opacity, zIndex } = getPositionStyles(offset, spacing);

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: itemSize,
        height: itemSize,
        left: '50%',
        marginLeft: -itemSize / 2,
      }}
      animate={{
        x,
        scale,
        opacity,
        zIndex,
      }}
      transition={{
        duration: 0.4,
        ease: CUSTOM_EASE,
      }}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      tabIndex={isCenter ? 0 : -1}
      role="button"
      aria-label={`${vinyl.album} by ${vinyl.artist}${isCenter ? ' - Click to view details' : ''}`}
    >
      <div
        className={`w-full h-full rounded-lg overflow-hidden ${
          isCenter ? 'carousel-item-center' : 'carousel-item-side'
        }`}
      >
        {vinyl.cover_art_url && !imageError ? (
          <Image
            src={vinyl.cover_art_url}
            alt={`${vinyl.album} cover`}
            fill
            sizes={`${itemSize}px`}
            className="object-cover"
            onError={() => setImageError(true)}
            priority={isCenter}
          />
        ) : (
          <div className="w-full h-full bg-steel-800 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-steel-600"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}
