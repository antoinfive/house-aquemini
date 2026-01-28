'use client';

import { useVinyls } from '@/lib/hooks';
import { AlbumCarousel } from '@/components/carousel';
import Link from 'next/link';

export default function Home() {
  const { vinyls, isLoading } = useVinyls({ autoFetch: true });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-steel-100 mb-2">House Aquemini</h1>
      <p className="text-steel-400 mb-8">Ali and Antoin&apos;s Vinyl Collection</p>

      <AlbumCarousel vinyls={vinyls} isLoading={isLoading} />

      <Link
        href="/collection"
        className="btn-primary mt-8 px-8 py-3 rounded text-base font-medium focus-ring"
      >
        Explore Full Collection
      </Link>
    </div>
  );
}
