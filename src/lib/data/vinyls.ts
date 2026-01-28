import { createClient } from '@/lib/supabase/server';
import type { Vinyl } from '@/lib/types';

/**
 * Server-side function to fetch all vinyls.
 * Use this in Server Components for initial data loading.
 */
export async function getVinyls(): Promise<Vinyl[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vinyls')
    .select('*')
    .order('artist', { ascending: true });

  if (error) {
    console.error('Error fetching vinyls:', error);
    return [];
  }

  return data || [];
}
