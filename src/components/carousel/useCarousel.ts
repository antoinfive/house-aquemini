'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseCarouselOptions {
  itemCount: number;
  autoPlayInterval?: number;
  initialIndex?: number;
}

export function useCarousel({
  itemCount,
  autoPlayInterval = 4000,
  initialIndex = 0,
}: UseCarouselOptions) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goToNext = useCallback(() => {
    if (itemCount === 0) return;
    setActiveIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const goToPrevious = useCallback(() => {
    if (itemCount === 0) return;
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < itemCount) {
        setActiveIndex(index);
      }
    },
    [itemCount]
  );

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (isPaused || itemCount <= 1 || autoPlayInterval <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(goToNext, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, itemCount, autoPlayInterval, goToNext]);

  // Reset index if item count changes and current index is out of bounds
  useEffect(() => {
    if (itemCount > 0 && activeIndex >= itemCount) {
      setActiveIndex(0);
    }
  }, [itemCount, activeIndex]);

  return {
    activeIndex,
    isPaused,
    goToNext,
    goToPrevious,
    goToIndex,
    pause,
    resume,
  };
}
