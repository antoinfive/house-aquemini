import { createClient } from '@/lib/supabase/server';
import type { WishlistItem } from '@/lib/types';

/**
 * Server-side function to fetch all wishlist items.
 * Use this in Server Components for initial data loading.
 */
export async function getWishlistItems(): Promise<WishlistItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('artist', { ascending: true });

  if (error) {
    console.error('Error fetching wishlist items:', error);
    return [];
  }

  return data || [];
}
