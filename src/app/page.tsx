import { AlbumCarousel } from '@/components/carousel/AlbumCarousel';
import { getVinyls } from '@/lib/data/vinyls';
import { HomeContent } from '@/components/home/HomeContent';

export default async function Home() {
  const vinyls = await getVinyls();

  return <HomeContent vinyls={vinyls} />;
}
