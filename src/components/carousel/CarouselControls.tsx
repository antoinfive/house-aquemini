'use client';

import { motion } from 'framer-motion';

interface CarouselControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  hidden?: boolean;
}

export function CarouselControls({
  onPrevious,
  onNext,
  hidden = false,
}: CarouselControlsProps) {
  if (hidden) return null;

  return (
    <>
      <motion.button
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-steel-800 border border-steel-600 text-steel-200 hover:border-brass-400 hover:text-brass-400 focus-ring transition-colors"
        onClick={onPrevious}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Previous album"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </motion.button>

      <motion.button
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-steel-800 border border-steel-600 text-steel-200 hover:border-brass-400 hover:text-brass-400 focus-ring transition-colors"
        onClick={onNext}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Next album"
      >
        <svg
          className="w-6 h-6"
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
      </motion.button>
    </>
  );
}
