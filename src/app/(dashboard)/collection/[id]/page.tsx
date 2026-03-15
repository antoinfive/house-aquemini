import { notFound } from 'next/navigation';
import { getVinylById } from '@/lib/data/vinyls';
import VinylDetailPageClient from '@/components/collection/VinylDetailPageClient';
import type { Metadata } from 'next';

interface VinylDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VinylDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const vinyl = await getVinylById(id);

  if (!vinyl) {
    return { title: 'Vinyl Not Found' };
  }

  return {
    title: `${vinyl.album} by ${vinyl.artist}`,
    description: `${vinyl.album} by ${vinyl.artist}${vinyl.year ? ` (${vinyl.year})` : ''}`,
  };
}

export default async function VinylDetailPage({ params }: VinylDetailPageProps) {
  const { id } = await params;
  const vinyl = await getVinylById(id);

  if (!vinyl) {
    notFound();
  }

  return <VinylDetailPageClient vinyl={vinyl} />;
}
