import { getVinyls } from '@/lib/data/vinyls';
import CollectionPageClient from '@/components/collection/CollectionPageClient';

export default async function CollectionPage() {
  const vinyls = await getVinyls();
  return <CollectionPageClient initialVinyls={vinyls} />;
}
