'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Vinyl } from '@/lib/types';
import { useCarousel } from './useCarousel';
import { CarouselItem } from './CarouselItem';
import { CarouselControls } from './CarouselControls';
import { useResponsiveConfig } from '@/lib/hooks/useResponsiveConfig';

interface AlbumCarouselProps {
  vinyls: Vinyl[];
  isLoading?: boolean;
}

const DRAG_THRESHOLD = 50;

function LoadingSkeleton({ itemSize, spacing }: { itemSize: number; spacing: number }) {
  return (
    <div className="relative h-[350px] w-full flex items-center justify-center">
      {[-2, -1, 0, 1, 2].map((offset) => {
        const absOffset = Math.abs(offset);
        const scale = offset === 0 ? 1.15 : absOffset === 1 ? 0.85 : 0.7;
        const opacity = offset === 0 ? 1 : absOffset === 1 ? 0.75 : 0.5;

        return (
          <div
            key={offset}
            className="absolute rounded-lg bg-steel-800 animate-pulse"
            style={{
              width: itemSize,
              height: itemSize,
              left: '50%',
              marginLeft: -itemSize / 2,
              transform: `translateX(${offset * spacing}px) scale(${scale})`,
              opacity,
              zIndex: offset === 0 ? 50 : absOffset === 1 ? 30 : 10,
            }}
          />
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-[350px] w-full flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-steel-800 border border-steel-600 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-steel-500"
          fill="currentColor"
          viewBox="0 0 24 24"
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
      <p className="text-steel-400 mb-2">No records in the collection yet</p>
      <p className="text-steel-500 text-sm">
        Add some vinyl to see them here
      </p>
    </div>
  );
}

export function AlbumCarousel({ vinyls, isLoading = false }: AlbumCarouselProps) {
  const router = useRouter();
  const { itemSize, spacing } = useResponsiveConfig();

  const {
    activeIndex,
    goToNext,
    goToPrevious,
    goToIndex,
    pause,
    resume,
  } = useCarousel({
    itemCount: vinyls.length,
    autoPlayInterval: 4000,
  });

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x > DRAG_THRESHOLD) {
        goToPrevious();
      } else if (info.offset.x < -DRAG_THRESHOLD) {
        goToNext();
      }
    },
    [goToNext, goToPrevious]
  );

  const handleItemClick = useCallback(
    (vinyl: Vinyl, index: number) => {
      if (index === activeIndex) {
        router.push(`/collection/${vinyl.id}`);
      } else {
        goToIndex(index);
      }
    },
    [activeIndex, goToIndex, router]
  );

  // Calculate visible items with offsets from center
  const visibleItems = useMemo(() => {
    if (vinyls.length === 0) return [];

    const items: { vinyl: Vinyl; index: number; offset: number }[] = [];
    const range = 2; // Show 5 items (-2 to +2)

    for (let i = -range; i <= range; i++) {
      const index = (activeIndex + i + vinyls.length) % vinyls.length;
      items.push({
        vinyl: vinyls[index],
        index,
        offset: i,
      });
    }

    return items;
  }, [vinyls, activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    },
    [goToNext, goToPrevious]
  );

  if (isLoading) {
    return <LoadingSkeleton itemSize={itemSize} spacing={spacing} />;
  }

  if (vinyls.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="relative w-full h-[350px] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-steel-950 rounded-lg"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Album carousel"
    >
      <motion.div
        className="relative h-full w-full flex items-center justify-center"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {visibleItems.map(({ vinyl, index, offset }) => (
          <CarouselItem
            key={vinyl.id}
            vinyl={vinyl}
            offset={offset}
            itemSize={itemSize}
            spacing={spacing}
            onClick={() => handleItemClick(vinyl, index)}
          />
        ))}
      </motion.div>

      <CarouselControls
        onPrevious={goToPrevious}
        onNext={goToNext}
        hidden={vinyls.length <= 1}
      />
    </div>
  );
}
