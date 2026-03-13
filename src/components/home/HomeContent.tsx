'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlbumCarousel } from '@/components/carousel/AlbumCarousel';
import type { Vinyl } from '@/lib/types';

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function HomeContent({ vinyls }: { vinyls: Vinyl[] }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 ambient-glow relative">
      <motion.div
        className="flex flex-col items-center relative z-10"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <motion.h1
          variants={fadeUp}
          className="text-5xl md:text-6xl font-bold text-steel-100 mb-2 font-[family-name:var(--font-display)]"
        >
          House Aquemini
        </motion.h1>
        <motion.p variants={fadeUp} className="text-steel-400 mb-8">
          Ali and Antoin&apos;s Vinyl Collection
        </motion.p>

        <motion.div variants={fadeUp} className="w-full">
          <AlbumCarousel vinyls={vinyls} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <Link
            href="/collection"
            className="btn-primary mt-8 inline-flex items-center px-8 py-3 text-base font-medium focus-ring"
          >
            Explore Full Collection
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
