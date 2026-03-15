import { getWishlistItems } from '@/lib/data/wishlist';
import WishlistPageClient from '@/components/wishlist/WishlistPageClient';

export default async function WishlistPage() {
  const items = await getWishlistItems();
  return <WishlistPageClient initialItems={items} />;
}
